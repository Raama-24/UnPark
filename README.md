***UnPark***
AI-Powered Smart Parking & Automated Violation Detection System

UnPark is an intelligent parking surveillance system that uses Computer Vision and AI to detect parking violations in real time, assign priority scores, and generate structured reports for enforcement authorities.It transforms passive CCTV monitoring into an automated, intelligent enforcement system.

**Problem**

Illegal roadside and sidewalk parking is a common issue, especially in dense urban areas. It:
Blocks pedestrian walkways
Causes traffic bottlenecks
Requires inefficient manual monitoring


**Features**

1. Real-time vehicle detection (YOLO)
2. Multi-object tracking (DeepSORT / ByteTrack)
3. Violation detection logic (No-parking / Overstay)
4. Urgency scoring system
5. OCR-based number plate extraction (ANPR-ready)
6. Evidence clip generation
7. MongoDB-based violation storage
8. FastAPI backend
9. Conceptual AR-assisted enforcement interface

**Tech Stack**

Language : Python
AI & Computer Vision: YOLO (Ultralytics) , DeepSORT / ByteTrack , OpenCV , OCR (for ANPR pipeline)
Backend : FastAPI , REST APIs
Database: MongoDB (Atlas-ready)

**How It Works**

1️⃣ Vehicle Detection
Vehicles are detected using YOLO with a confidence threshold:
Confidence≥τ
Only detections above threshold τ are processed further.

2️⃣ Violation Urgency Scoring
Each violation is assigned a priority score:
Urgency=αT+βL+γV

Where:
𝑇 = Duration of violation
L = Location severity weight
V = Vehicle type weight
α,β,γ = Tunable parameters

3️⃣ OCR & Reporting
Number plates are extracted using OCR
Violation metadata is stored in MongoDB
Evidence clips are saved
Structured reports can be generated for authorities

**Project Structure**
unpark/
│
├── app.py              # FastAPI server
├── inference.py        # Detection + tracking pipeline
├── database.py         # MongoDB connection
├── uploads/            # Input videos
├── outputs/            # Generated violation clips
└── models/             # YOLO model files

**Running the Project**
1️⃣ Install Dependencies
pip install -r requirements.txt
2️⃣ Start FastAPI Server
uvicorn app:app --reload
3️⃣ Access API

Open:
http://127.0.0.1:8000/docs
Upload a video and let UnPark process violations automatically.


**What Makes UnPark Unique**
End-to-end AI pipeline (Detection → Tracking → OCR → Backend → DB)
Urgency-based violation prioritization
AR-assisted enforcement concept
Scalable architecture for multi-camera environments

**Future Improvements**
Integrate full Automatic Number Plate Recognition (ANPR) with higher OCR accuracy.
Integrate payment or fine management systems for automated penalty workflows.
Collaborate with municipalities and commercial complexes.
Integrate AR-powered enforcement tools for real-time officer assistance.

**Author**
Developed by Raama Bhatia
