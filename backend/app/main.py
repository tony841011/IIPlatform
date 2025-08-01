from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, database
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
import datetime
from typing import List
import numpy as np
import json

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

# 審計日誌中間件
async def log_audit(request: Request, user_id: int = None, action: str = None, resource_type: str = None, resource_id: int = None):
    db = next(database.get_db())
    audit_log = schemas.AuditLogCreate(
        action=action or request.method,
        resource_type=resource_type or "api",
        resource_id=resource_id,
        details={"path": request.url.path, "method": request.method},
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    database.create_audit_log(db, audit_log, user_id)

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

# 基本 API
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
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(database.get_db)):
    saved = database.save_device_data(db, data)
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

# 用戶認證
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = database.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = schemas.UserCreate(username=user.username, password=hashed_password)
    return database.create_user(db, new_user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = database.get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

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

# 設備管理與遠端控制
@app.post("/devices/register", response_model=schemas.Device)
def register_device(registration: schemas.DeviceRegistration, db: Session = Depends(database.get_db)):
    """設備註冊 API"""
    return database.register_device(db, registration)

@app.post("/devices/heartbeat")
def update_heartbeat(heartbeat: schemas.DeviceHeartbeat, db: Session = Depends(database.get_db)):
    """設備心跳更新"""
    return database.update_device_heartbeat(db, heartbeat)

@app.post("/devices/{device_id}/command", response_model=schemas.DeviceCommandOut)
def send_device_command(device_id: int, command: schemas.DeviceCommandCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """發送設備控制命令"""
    return database.create_device_command(db, command, current_user.id)

@app.get("/devices/{device_id}/commands", response_model=list[schemas.DeviceCommandOut])
def get_device_commands(device_id: int, db: Session = Depends(database.get_db)):
    """獲取設備命令歷史"""
    return database.get_device_commands(db, device_id)

# OTA 更新
@app.post("/firmware/", response_model=schemas.FirmwareOut)
def create_firmware(firmware: schemas.FirmwareCreate, db: Session = Depends(database.get_db)):
    """創建韌體"""
    return database.create_firmware(db, firmware)

@app.get("/firmware/", response_model=list[schemas.FirmwareOut])
def list_firmwares(device_type: str = None, db: Session = Depends(database.get_db)):
    """獲取韌體列表"""
    return database.get_firmwares(db, device_type)

@app.post("/ota/update", response_model=schemas.OTAUpdateOut)
def create_ota_update(ota_update: schemas.OTAUpdateCreate, db: Session = Depends(database.get_db)):
    """創建 OTA 更新任務"""
    return database.create_ota_update(db, ota_update)

@app.get("/ota/updates", response_model=list[schemas.OTAUpdateOut])
def list_ota_updates(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 OTA 更新列表"""
    return database.get_ota_updates(db, device_id)

# 規則引擎
@app.post("/rules/", response_model=schemas.RuleOut)
def create_rule(rule: schemas.RuleCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建規則"""
    return database.create_rule(db, rule, current_user.id)

@app.get("/rules/", response_model=list[schemas.RuleOut])
def list_rules(db: Session = Depends(database.get_db)):
    """獲取規則列表"""
    return database.get_rules(db)

@app.post("/rules/{rule_id}/evaluate")
def evaluate_rule(rule_id: int, device_data: dict, db: Session = Depends(database.get_db)):
    """評估規則"""
    rule = db.query(models.Rule).filter(models.Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    result = database.evaluate_rule(db, rule, device_data)
    return {"rule_id": rule_id, "result": result}

# 工作流程
@app.post("/workflows/", response_model=schemas.WorkflowOut)
def create_workflow(workflow: schemas.WorkflowCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建工作流程"""
    return database.create_workflow(db, workflow, current_user.id)

@app.get("/workflows/", response_model=list[schemas.WorkflowOut])
def list_workflows(db: Session = Depends(database.get_db)):
    """獲取工作流程列表"""
    return database.get_workflows(db)

@app.post("/workflows/{workflow_id}/execute", response_model=schemas.WorkflowExecutionOut)
def execute_workflow(workflow_id: int, db: Session = Depends(database.get_db)):
    """執行工作流程"""
    return database.create_workflow_execution(db, workflow_id)

# 審計日誌
@app.get("/audit-logs/", response_model=list[schemas.AuditLogOut])
def get_audit_logs(user_id: int = None, resource_type: str = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取審計日誌"""
    return database.get_audit_logs(db, user_id, resource_type, limit)

# 角色權限
@app.post("/roles/", response_model=schemas.RoleOut)
def create_role(role: schemas.RoleCreate, db: Session = Depends(database.get_db)):
    """創建角色"""
    return database.create_role(db, role)

@app.get("/roles/", response_model=list[schemas.RoleOut])
def list_roles(db: Session = Depends(database.get_db)):
    """獲取角色列表"""
    return database.get_roles(db)

@app.post("/permissions/check")
def check_permission(permission: schemas.PermissionCheck, db: Session = Depends(database.get_db)):
    """檢查權限"""
    result = database.check_permission(db, permission.user_id, permission.resource_type, permission.resource_id, permission.action)
    return {"has_permission": result} 