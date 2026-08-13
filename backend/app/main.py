import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# The frontend runs on a different port, so the browser treats it as a separate
# origin and blocks requests unless the backend explicitly allows it.
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# backend/uploads/ - listed in .gitignore, so saved videos are never committed.
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


@dataclass
class Meeting:
    """One uploaded meeting.

    Only plain, JSON-friendly values belong here. Never store the UploadFile
    itself: it is a live handle that the server closes once the request ends,
    and it cannot be converted to JSON.

    Field names are camelCase to match the JSON the frontend sends and reads.
    """

    meetingId: str
    filename: str
    sizeBytes: int
    title: str
    meetingDate: str
    notes: str
    analysisMode: str


# In-memory store. This is deliberately simple for now, but it means every
# meeting is forgotten when the server restarts (including on --reload).
# Replacing this with a real database is a later task.
meetings = []

def is_video_file(upload: UploadFile) -> bool:
    """Mirror of the frontend check: trust the content type, fall back to the extension."""
    if upload.content_type:
        return upload.content_type.startswith("video/")

    return Path(upload.filename or "").suffix.lower() in VIDEO_EXTENSIONS


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
def upload_meeting(
    file: UploadFile = File(...),
    title: str = Form(""),
    meetingDate: str = Form(""),
    notes: str = Form(""),
    analysisMode: str = Form("audio"),
):
    if not is_video_file(file):
        raise HTTPException(
            status_code=400,
            detail="Please upload a video file, such as MP4, MOV, AVI, MKV or WebM.",
        )

    # A random id keeps two meetings both named "recording.mp4" from overwriting
    # each other, and avoids trusting a filename that came from the browser.
    meeting_id = str(uuid.uuid4())
    extension = Path(file.filename or "").suffix.lower()

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    saved_path = UPLOAD_DIR / f"{meeting_id}{extension}"

    # copyfileobj streams the video to disk in chunks instead of loading the
    # whole thing into memory, which matters for large recordings.
    with saved_path.open("wb") as saved_file:
        shutil.copyfileobj(file.file, saved_file)

    meeting = Meeting(
        meetingId=meeting_id,
        filename=file.filename or saved_path.name,
        sizeBytes=saved_path.stat().st_size,
        title=title,
        meetingDate=meetingDate,
        notes=notes,
        analysisMode=analysisMode,
    )
    meetings.append(meeting)

    # Return only the meeting that was just created. Returning the whole list
    # would make every response grow as more meetings are uploaded.
    return {"status": "ok", "meeting": meeting}


@app.get("/meetings")
def list_meetings():
    return {"status": "ok", "meetings": meetings}
