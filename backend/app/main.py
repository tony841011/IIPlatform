from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, database
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
import datetime
from typing import List
import numpy as np

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# 密碼雜湊

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# 產生 JWT token

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 取得目前用戶

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = database.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"msg": "IIoT Platform Backend"}

@app.post("/devices/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(database.get_db)):
    return database.create_device(db, device)

@app.get("/devices/", response_model=list[schemas.Device])
def list_devices(db: Session = Depends(database.get_db)):
    return database.get_devices(db)

@app.websocket("/ws/data")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # 保持連線
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 修改資料接收 API，收到資料時推播給前端
@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(database.get_db)):
    saved = database.save_device_data(db, data)
    import json
    import asyncio
    # 假設異常條件：value > 80
    if data.value > 80:
        alert = schemas.AlertCreate(device_id=data.device_id, value=data.value, timestamp=data.timestamp, message="數值異常: 超過80")
        database.create_alert(db, alert)
        asyncio.create_task(manager.broadcast(json.dumps({"type": "alert", "device_id": data.device_id, "value": data.value, "timestamp": str(data.timestamp), "message": "數值異常: 超過80"})))
    else:
        asyncio.create_task(manager.broadcast(json.dumps({"device_id": data.device_id, "value": data.value, "timestamp": str(data.timestamp)})))
    return saved

@app.get("/alerts/", response_model=list[schemas.AlertOut])
def get_alerts(device_id: int = None, db: Session = Depends(database.get_db)):
    return database.get_alerts(db, device_id)

@app.get("/history/", response_model=list[schemas.DeviceData])
def get_history(device_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.DeviceData).filter(models.DeviceData.device_id == device_id).order_by(models.DeviceData.timestamp.desc()).limit(100).all()

@app.get("/ai/anomaly/", response_model=dict)
def ai_anomaly(device_id: int, db: Session = Depends(database.get_db)):
    records = db.query(models.DeviceData).filter(models.DeviceData.device_id == device_id).order_by(models.DeviceData.timestamp.desc()).limit(50).all()
    values = [r.value for r in records][::-1]
    if len(values) < 5:
        return {"score": 0, "advice": "資料不足"}
    mean = np.mean(values)
    std = np.std(values)
    latest = values[-1]
    score = abs(latest - mean) / (std + 1e-6)
    advice = "正常" if score < 2 else "異常，請檢查設備"
    return {"score": float(score), "advice": advice, "mean": float(mean), "std": float(std), "latest": float(latest)}

# 註冊 API
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = database.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = schemas.UserCreate(username=user.username, password=hashed_password)
    return database.create_user(db, new_user)

# 登入 API
@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = database.get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 取得目前用戶資訊
@app.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user 

@app.post("/groups/", response_model=schemas.DeviceGroupOut)
def create_group(group: schemas.DeviceGroupCreate, db: Session = Depends(database.get_db)):
    return database.create_device_group(db, group)

@app.get("/groups/", response_model=list[schemas.DeviceGroupOut])
def list_groups(db: Session = Depends(database.get_db)):
    return database.get_device_groups(db)

@app.patch("/devices/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, update: schemas.DeviceUpdate, db: Session = Depends(database.get_db)):
    device = database.update_device(db, device_id, update)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device 