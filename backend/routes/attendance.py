from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
import sys
import os
import base64
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_db
from models.models import Student, Attendance
from utils.face_engine import (
    decode_image, get_all_faces, compare_embeddings,
    check_liveness, detect_proxy, detect_emotion
)
from utils.email_alerts import send_absence_alert, send_late_alert
router = APIRouter(prefix="/attendance", tags=["Attendance"])

class ScanRequest(BaseModel):
    image_base64: str
    class_name: str = "Computer Science"

@router.post("/scan")
def scan_classroom(request: ScanRequest, db: Session = Depends(get_db)):
    # Decode the image
    image = decode_image(request.image_base64)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # Detect all faces in classroom
    faces = get_all_faces(image)
    if len(faces) == 0:
        return {"message": "No faces detected", "results": []}

    # Check for proxy attempts
    proxy_detected, suspicious_pairs = detect_proxy(faces)

    # Load all registered students
    students = db.query(Student).all()
    if not students:
        return {"message": "No students registered yet", "results": []}

    results = []

    for face in faces:
        # Liveness check
        is_live = check_liveness(image, face)
        if not is_live:
            results.append({
                "name": "Unknown",
                "status": "rejected",
                "reason": "Liveness check failed — possible photo spoofing"
            })
            continue

        # Match face against all students
        face_embedding = face.embedding.tolist()
        best_match = None
        best_score = 0

        for student in students:
            if not student.face_embedding:
                continue
            stored_embedding = json.loads(student.face_embedding)
            is_match, score = compare_embeddings(face_embedding, stored_embedding)
            if is_match and score > best_score:
                best_score = score
                best_match = student

        if best_match:
            # Detect emotion
            emotion_label, emotion_score = detect_emotion(image, face)

            # Check if already marked today
            today = datetime.utcnow().date()
            existing = db.query(Attendance).filter(
                Attendance.student_id == best_match.id,
                Attendance.date >= datetime(today.year, today.month, today.day)
            ).first()

            if not existing:
                now = datetime.utcnow()
                class_start = now.replace(hour=9, minute=0, second=0)
                status = "late" if now > class_start else "present"

                attendance = Attendance(
                    student_id=best_match.id,
                    status=status,
                    entry_time=now,
                    date=now,
                    emotion=emotion_label,
                    engagement_score=emotion_score
                )
                db.add(attendance)
                db.commit()

                # Send email alert if late
                if status == "late" and best_match.parent_email:
                    send_late_alert(
                        best_match.parent_email,
                        best_match.name,
                        now.strftime("%I:%M %p")
                    )
            results.append({
                "student_id": best_match.id,
                "name": best_match.name,
                "roll": best_match.roll_number,
                "status": "present",
                "confidence": round(best_score * 100, 1),
                "proxy_warning": proxy_detected,
                "emotion": emotion_label
            })
        else:
            results.append({
                "name": "Unknown face",
                "status": "unrecognized",
                "confidence": 0
            })

    return {
        "total_faces": len(faces),
        "recognized": len([r for r in results if r["status"] == "present"]),
        "proxy_detected": proxy_detected,
        "results": results
    }


@router.get("/today")
def get_today_attendance(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    records = db.query(Attendance).filter(
        Attendance.date >= datetime(today.year, today.month, today.day)
    ).all()
    return records

@router.post("/send-absent-alerts")
def send_absent_alerts(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    all_students = db.query(Student).all()
    present_today = db.query(Attendance).filter(
        Attendance.date >= datetime(today.year, today.month, today.day)
    ).all()
    present_ids = [a.student_id for a in present_today]
    absent_students = [s for s in all_students if s.id not in present_ids]
    sent = 0
    for student in absent_students:
        if student.parent_email:
            send_absence_alert(
                student.parent_email,
                student.name,
                today.strftime("%B %d, %Y")
            )
            sent += 1
    return {"message": f"Sent {sent} absence alerts ✅"}