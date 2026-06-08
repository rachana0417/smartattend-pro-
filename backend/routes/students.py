from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import sys
import os
import json
import numpy as np
import cv2

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_db
from models.models import Student

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/")
def get_all_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students


@router.post("/register")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    parent_phone: str = Form(...),
    parent_email: str = Form(...),
    face_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if student already exists
    existing = db.query(Student).filter(
        Student.roll_number == roll_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already registered")

    # Read and process the face image
    image_bytes = await face_image.read()
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

   # Use InsightFace for real face embedding
    from utils.face_engine import face_app
    faces = face_app.get(img)
    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected in image — please retake photo")
    embedding = faces[0].embedding.tolist()

    # Save student to database
    student = Student(
        name=name,
        roll_number=roll_number,
        parent_phone=parent_phone,
        parent_email=parent_email,
        face_embedding=json.dumps(embedding)
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    return {
        "message": f"Student {name} registered successfully ✅",
        "student_id": student.id
    }


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted ✅"}