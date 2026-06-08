import cv2
import numpy as np
import json
import base64
from insightface.app import FaceAnalysis
from deepface import DeepFace

face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def decode_image(base64_string):
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def get_face_embedding(image):
    faces = face_app.get(image)
    if len(faces) == 0:
        return None
    return faces[0].embedding.tolist()

def get_all_faces(image):
    faces = face_app.get(image)
    return faces

def compare_embeddings(embedding1, embedding2, threshold=0.5):
    e1 = np.array(embedding1)
    e2 = np.array(embedding2)
    similarity = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
    return similarity > threshold, float(similarity)

def check_liveness(image, face):
    h, w = image.shape[:2]
    bbox = face.bbox
    face_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
    image_area = h * w
    ratio = face_area / image_area
    return ratio > 0.01

def detect_proxy(faces):
    if len(faces) < 2:
        return False, []
    suspicious = []
    for i, face1 in enumerate(faces):
        for j, face2 in enumerate(faces):
            if i >= j:
                continue
            bbox1 = face1.bbox
            bbox2 = face2.bbox
            center1 = ((bbox1[0]+bbox1[2])/2, (bbox1[1]+bbox1[3])/2)
            center2 = ((bbox2[0]+bbox2[2])/2, (bbox2[1]+bbox2[3])/2)
            distance = np.sqrt((center1[0]-center2[0])**2 + (center1[1]-center2[1])**2)
            if distance < 150:
                suspicious.append((i, j))
    return len(suspicious) > 0, suspicious

def detect_emotion(image, face):
    try:
        bbox = face.bbox
        x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
        # Add padding around face
        pad = 20
        h, w = image.shape[:2]
        x1 = max(0, x1 - pad)
        y1 = max(0, y1 - pad)
        x2 = min(w, x2 + pad)
        y2 = min(h, y2 + pad)
        face_crop = image[y1:y2, x1:x2]
        if face_crop.size == 0:
            return "neutral", 0.0
        result = DeepFace.analyze(
            face_crop,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )
        emotion = result[0]['dominant_emotion']
        score = result[0]['emotion'][emotion]
        # Map to our categories
        emotion_map = {
            'happy':   ('attentive',  '😊'),
            'neutral': ('neutral',    '😐'),
            'sad':     ('distracted', '😢'),
            'angry':   ('distracted', '😠'),
            'fear':    ('confused',   '😨'),
            'disgust': ('distracted', '😒'),
            'surprise':('attentive',  '😮'),
        }
        mapped, emoji = emotion_map.get(emotion, ('neutral', '😐'))
        return f"{emoji} {mapped.capitalize()}", round(score, 1)
    except Exception:
        return "😐 Neutral", 0.0