import json
import requests
import cv2
import time
import numpy as np
import pandas as pd
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import joblib
import easyocr
from collections import defaultdict, Counter
import warnings
import os

warnings.filterwarnings("ignore")

reader = easyocr.Reader(["en"], gpu=False)

ILLEGAL_TIME_THRESHOLD = 20
MOVE_DIST_THRESH = 8

FRAME_W, FRAME_H = 1280, 720

CLASS_NAMES = {2: "Car", 3: "Bike", 5: "Bus", 7: "Truck"}
VEHICLE_CLASSES = list(CLASS_NAMES.keys())
VEHICLE_CLASS_ENCODING = {"Car": 0, "Bike": 1, "Bus": 2, "Truck": 3}

NO_PARKING_ZONE = [(6, 367), (884, 381), (890, 504), (16, 556)]

CAMERA_LAT = 28.632889
CAMERA_LON = 77.310166

model = YOLO("yolo11n.pt", verbose=False)
tracker = DeepSort(max_age=30, n_init=3)
urgency_model = joblib.load("urgency_model.pkl")

def point_in_polygon(point, polygon):
    return cv2.pointPolygonTest(np.array(polygon), point, False) >= 0

def predict_urgency(map_ctx, vehicle_class):
    X = pd.DataFrame(
        [
            {
                "hospital": int(map_ctx["hospital"]),
                "school": int(map_ctx["school"]),
                "bus_stop": int(map_ctx["bus_stop"]),
                "residential": int(map_ctx["residential"]),
                "market": int(map_ctx["market"]),
                "vehicle_class": VEHICLE_CLASS_ENCODING.get(vehicle_class, 0),
            }
        ]
    )
    return round(float(urgency_model.predict(X)[0]), 2)

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

def get_parking_context(lat, lon, radius=150):
    query = f"""
[out:json];
(
  node(around:{radius},{lat},{lon})["amenity"~"hospital|school"];
  way(around:{radius},{lat},{lon})["amenity"~"hospital|school"];
  node(around:{radius},{lat},{lon})["highway"="bus_stop"];
  way(around:{radius},{lat},{lon})["shop"];
  way(around:{radius},{lat},{lon})["landuse"="residential"];
);
out tags;
"""
    ctx = dict.fromkeys(
        ["hospital", "school", "bus_stop", "residential", "market"], False
    )

    try:
        res = requests.post(OVERPASS_URL, data=query, timeout=10).json()
        for el in res["elements"]:
            tags = el.get("tags", {})
            if tags.get("amenity") == "hospital":
                ctx["hospital"] = True
            if tags.get("amenity") == "school":
                ctx["school"] = True
            if tags.get("highway") == "bus_stop":
                ctx["bus_stop"] = True
            if tags.get("landuse") == "residential":
                ctx["residential"] = True
            if "shop" in tags:
                ctx["market"] = True
    except:
        pass

    return ctx

GLOBAL_MAP_CONTEXT = get_parking_context(CAMERA_LAT, CAMERA_LON)

def read_license_plate(crop):
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)

    results = reader.readtext(gray)
    best_text = ""

    for (bbox, text, conf) in results:
        text = text.upper().replace(" ", "")
        if conf > 0.4 and len(text) >= 6:
            best_text = text
            break

    return best_text


def process_video(input_path, output_path):
    vehicles = {}
    total_vehicle_ids = set()
    illegal_vehicle_ids = set()
    max_urgency = 0
    violations = []

    cap = cv2.VideoCapture(input_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps == 0 or fps != fps:
        fps = 25

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (FRAME_W, FRAME_H))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (FRAME_W, FRAME_H))
        results = model(frame, classes=VEHICLE_CLASSES, conf=0.5, verbose=False)

        detections = []
        for b in results[0].boxes:
            x1, y1, x2, y2 = map(int, b.xyxy[0])
            cls = int(b.cls[0])
            detections.append(
                ([x1, y1, x2 - x1, y2 - y1], float(b.conf[0]), CLASS_NAMES[cls])
            )

        tracks = tracker.update_tracks(detections, frame=frame)
        cv2.polylines(frame, [np.array(NO_PARKING_ZONE)], True, (0, 0, 255), 2)

        now = time.time()

        for t in tracks:
            if not t.is_confirmed():
                continue

            tid = t.track_id
            total_vehicle_ids.add(tid)

            x1, y1, x2, y2 = map(int, t.to_ltrb())
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            inside = point_in_polygon((cx, cy), NO_PARKING_ZONE)

            if tid not in vehicles:
                vehicles[tid] = {
                    "class": t.det_class,
                    "last_pos": (cx, cy),
                    "last_stationary_ts": None,
                    "total_parked_time": 0,
                    "is_illegal": False,
                    "final_urgency": 0,
                    "plate": None,            # 🔴 ADD
                    "plate_checked": False, 
                }

            v = vehicles[tid]
            
            # -------- LICENSE PLATE OCR (RUN ONCE PER VEHICLE) --------
            if not v["plate_checked"]:
                vehicle_crop = frame[y1:y2, x1:x2]
            
                if vehicle_crop.size > 0:
                    plate_text = read_license_plate(vehicle_crop)
            
                    if plate_text:
                        v["plate"] = plate_text
                        v["plate_checked"] = True

            dist = np.linalg.norm(
                np.array(v["last_pos"]) - np.array((cx, cy))
            )
            stationary = dist < MOVE_DIST_THRESH
            v["last_pos"] = (cx, cy)

            if inside and stationary:
                if v["last_stationary_ts"] is None:
                    v["last_stationary_ts"] = now
                v["total_parked_time"] += now - v["last_stationary_ts"]
                v["last_stationary_ts"] = now
            else:
                v["last_stationary_ts"] = None

            if v["total_parked_time"] >= ILLEGAL_TIME_THRESHOLD:
                v["is_illegal"] = True
                v["final_urgency"] = predict_urgency(
                    GLOBAL_MAP_CONTEXT, v["class"]
                )
                illegal_vehicle_ids.add(tid)
                max_urgency = max(max_urgency, v["final_urgency"])

            if v["is_illegal"]:
                color = (
                    (0, 0, 255)
                    if v["final_urgency"] >= 8
                    else (0, 165, 255)
                )
            else:
                color = (0, 200, 0)

            plate_display = v["plate"] if v["plate"] else "Detecting..."
            label = (
            f"T:{int(v['total_parked_time'])}s "
            f"U:{v['final_urgency']}"
        )

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(
                frame,
                label,
                (x1, y1 - 8),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2,
            )

        out.write(frame)

    cap.release()
    out.release()

    for tid, v in vehicles.items():
        if v["is_illegal"]:
            duration_sec = int(v["total_parked_time"])
            minutes = duration_sec // 60
            seconds = duration_sec % 60
            duration = f"{minutes}m {seconds}s"

            status = (
                "Critical"
                if v["final_urgency"] >= 8
                else "High"
                if v["final_urgency"] >= 6
                else "Medium"
            )

            violations.append(
                {
                    "vehicle_id": v["plate"] if v["plate"] else f"ID-{tid}",
                    "urgency": v["final_urgency"],
                    "status": status,
                    "duration": duration,
                    "location": "No Parking Zone",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

    return {
        "total_vehicles": len(total_vehicle_ids),
        "illegal_vehicles": len(illegal_vehicle_ids),
        "max_urgency": round(max_urgency, 2),
        "violations": violations,
        "output_url": f"/outputs/{os.path.basename(output_path)}",
    }
