from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
from inference import process_video
from database import videos_collection
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Illegal Parking Detection API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static folder for processed videos
app.mount(
    "/outputs",
    StaticFiles(directory=OUTPUT_DIR),
    name="outputs"
)


@app.get("/ping")
def ping():
    return {"status": "ok"}


import traceback

@app.post("/upload")
def upload_video(file: UploadFile = File(...)):
    print("🔥 UPLOAD HIT")

    input_path = os.path.join(UPLOAD_DIR, file.filename)
    base = os.path.splitext(file.filename)[0]
    output_path = os.path.join(OUTPUT_DIR, f"processed_{base}.mp4")

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("🔥 FILE SAVED")

    try:
        stats = process_video(input_path, output_path)
        # 🔥 SAVE TO MONGODB
        document = {
            "original_filename": file.filename,
            "upload_path": input_path,
            "output_path": output_path,
            "processed_at": datetime.utcnow(),
            "total_vehicles": stats["total_vehicles"],
            "illegal_vehicles": stats["illegal_vehicles"],
            "max_urgency": stats["max_urgency"],
            "violations": stats["violations"],
            
        }
        
        videos_collection.insert_one(document)
        print("🔥 PROCESS DONE")
    except Exception as e:
        print("❌ INFERENCE CRASHED")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Processing completed",
        "stats": stats,
        "output_url": f"/outputs/{os.path.basename(output_path)}"
    }


@app.get("/download/{filename}")
def download_file(filename: str):
    full_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=full_path,
        media_type="video/mp4",
        filename=filename
    )
