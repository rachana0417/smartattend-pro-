from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import engine, Base
from models.models import Student, Attendance, User
from routes.students import router as students_router
from routes.attendance import router as attendance_router
from routes.auth import router as auth_router
load_dotenv()

app = FastAPI(title="SmartAttend Pro", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(students_router)
app.include_router(attendance_router)
app.include_router(auth_router)
@app.get("/")
def root():
    return {"message": "SmartAttend Pro API is running ✅"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)