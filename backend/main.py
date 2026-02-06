from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os

from inference import process_video

app = FastAPI(title="Illegal Parking Detection API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static folder for processed videos
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/upload")
def upload_video(file: UploadFile = File(...)):
    print("🔥 UPLOAD HIT")   # <--- ADD THIS

    input_path = os.path.join(UPLOAD_DIR, file.filename)
    base = os.path.splitext(file.filename)[0]
    output_path = f"outputs/processed_{base}.mp4"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("🔥 FILE SAVED")

    stats = process_video(input_path, output_path)

    print("🔥 PROCESS DONE")

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
