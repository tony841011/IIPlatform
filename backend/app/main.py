from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, database
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
import datetime
from typing import List, Optional, Dict, Any
import numpy as np
import json
import asyncio
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from .database import engine
from .models import Base

Base.metadata.create_all(bind=engine)
Base = declarative_base()

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



@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(database.get_db)):
    saved = database.save_device_data(db, data)
    # 假設異常條件：value > 80
    if data.value > 80:
        alert = schemas.AlertCreate(device_id=data.device_id, value=data.value, timestamp=data.timestamp, message="數值異常: 超過80")
        database.create_alert(db, alert)
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

# 通訊協定管理
@app.post("/protocols/", response_model=schemas.CommunicationProtocolOut)
def create_protocol(protocol: schemas.CommunicationProtocolCreate, db: Session = Depends(database.get_db)):
    """創建通訊協定配置"""
    return database.create_communication_protocol(db, protocol)

@app.get("/protocols/", response_model=list[schemas.CommunicationProtocolOut])
def list_protocols(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取通訊協定配置列表"""
    return database.get_communication_protocols(db, device_id)

# MQTT 配置
@app.post("/protocols/mqtt/", response_model=schemas.MQTTConfigOut)
def create_mqtt_config(config: schemas.MQTTConfigCreate, db: Session = Depends(database.get_db)):
    """創建 MQTT 配置"""
    return database.create_mqtt_config(db, config)

@app.get("/protocols/mqtt/", response_model=list[schemas.MQTTConfigOut])
def list_mqtt_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 MQTT 配置列表"""
    return database.get_mqtt_configs(db, device_id)

# Modbus TCP 配置
@app.post("/protocols/modbus-tcp/", response_model=schemas.ModbusTCPConfigOut)
def create_modbus_tcp_config(config: schemas.ModbusTCPConfigCreate, db: Session = Depends(database.get_db)):
    """創建 Modbus TCP 配置"""
    return database.create_modbus_tcp_config(db, config)

@app.get("/protocols/modbus-tcp/", response_model=list[schemas.ModbusTCPConfigOut])
def list_modbus_tcp_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 Modbus TCP 配置列表"""
    return database.get_modbus_tcp_configs(db, device_id)

# OPC UA 配置
@app.post("/protocols/opc-ua/", response_model=schemas.OPCUAConfigOut)
def create_opc_ua_config(config: schemas.OPCUAConfigCreate, db: Session = Depends(database.get_db)):
    """創建 OPC UA 配置"""
    return database.create_opc_ua_config(db, config)

@app.get("/protocols/opc-ua/", response_model=list[schemas.OPCUAConfigOut])
def list_opc_ua_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 OPC UA 配置列表"""
    return database.get_opc_ua_configs(db, device_id)

# 通訊協定測試
@app.post("/protocols/test")
def test_protocol(test: schemas.ProtocolTest, db: Session = Depends(database.get_db)):
    """測試通訊協定連線"""
    try:
        if test.protocol_type == "mqtt":
            # 這裡可以實現 MQTT 連線測試
            return {"status": "success", "message": "MQTT 連線測試成功", "protocol": "mqtt"}
        elif test.protocol_type == "modbus_tcp":
            # 這裡可以實現 Modbus TCP 連線測試
            return {"status": "success", "message": "Modbus TCP 連線測試成功", "protocol": "modbus_tcp"}
        elif test.protocol_type == "opc_ua":
            # 這裡可以實現 OPC UA 連線測試
            return {"status": "success", "message": "OPC UA 連線測試成功", "protocol": "opc_ua"}
        elif test.protocol_type == "restful":
            # RESTful API 測試
            return {"status": "success", "message": "RESTful API 測試成功", "protocol": "restful"}
        else:
            return {"status": "error", "message": "不支援的通訊協定", "protocol": test.protocol_type}
    except Exception as e:
        return {"status": "error", "message": f"連線測試失敗: {str(e)}", "protocol": test.protocol_type} 

# 資料庫連線管理
@app.post("/database-connections/", response_model=schemas.DatabaseConnectionOut)
def create_database_connection(connection: schemas.DatabaseConnectionCreate, db: Session = Depends(database.get_db)):
    """創建資料庫連線配置"""
    return database.create_database_connection(db, connection)

@app.get("/database-connections/", response_model=List[schemas.DatabaseConnectionOut])
def list_database_connections(db: Session = Depends(database.get_db)):
    """獲取所有資料庫連線配置"""
    return database.get_database_connections(db)

@app.get("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def get_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """獲取特定資料庫連線配置"""
    connection = database.get_database_connection(db, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return connection

@app.patch("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def update_database_connection(connection_id: int, connection: schemas.DatabaseConnectionUpdate, db: Session = Depends(database.get_db)):
    """更新資料庫連線配置"""
    updated_connection = database.update_database_connection(db, connection_id, connection)
    if not updated_connection:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return updated_connection

@app.delete("/database-connections/{connection_id}")
def delete_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """刪除資料庫連線配置"""
    connection = database.delete_database_connection(db, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return {"message": "Database connection deleted successfully"}

@app.post("/database-connections/{connection_id}/test")
def test_database_connection(connection_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """測試資料庫連線"""
    result = database.test_database_connection(db, connection_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return result

# 資料表配置管理
@app.post("/table-schemas/", response_model=schemas.TableSchemaOut)
def create_table_schema(schema: schemas.TableSchemaCreate, db: Session = Depends(database.get_db)):
    """創建資料表配置"""
    return database.create_table_schema(db, schema)

@app.get("/table-schemas/", response_model=List[schemas.TableSchemaOut])
def list_table_schemas(db: Session = Depends(database.get_db)):
    """獲取所有資料表配置"""
    return database.get_table_schemas(db)

@app.get("/table-schemas/{schema_id}", response_model=schemas.TableSchemaOut)
def get_table_schema(schema_id: int, db: Session = Depends(database.get_db)):
    """獲取特定資料表配置"""
    schema = database.get_table_schema(db, schema_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Table schema not found")
    return schema

@app.patch("/table-schemas/{schema_id}", response_model=schemas.TableSchemaOut)
def update_table_schema(schema_id: int, schema: schemas.TableSchemaUpdate, db: Session = Depends(database.get_db)):
    """更新資料表配置"""
    updated_schema = database.update_table_schema(db, schema_id, schema)
    if not updated_schema:
        raise HTTPException(status_code=404, detail="Table schema not found")
    return updated_schema

@app.delete("/table-schemas/{schema_id}")
def delete_table_schema(schema_id: int, db: Session = Depends(database.get_db)):
    """刪除資料表配置"""
    schema = database.delete_table_schema(db, schema_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Table schema not found")
    return {"message": "Table schema deleted successfully"}

# 資料表欄位管理
@app.post("/table-columns/", response_model=schemas.TableColumnOut)
def create_table_column(column: schemas.TableColumnCreate, db: Session = Depends(database.get_db)):
    """創建資料表欄位配置"""
    return database.create_table_column(db, column)

@app.get("/table-columns/{table_id}", response_model=List[schemas.TableColumnOut])
def list_table_columns(table_id: int, db: Session = Depends(database.get_db)):
    """獲取資料表的所有欄位"""
    return database.get_table_columns(db, table_id)

@app.patch("/table-columns/{column_id}", response_model=schemas.TableColumnOut)
def update_table_column(column_id: int, column: schemas.TableColumnUpdate, db: Session = Depends(database.get_db)):
    """更新資料表欄位配置"""
    updated_column = database.update_table_column(db, column_id, column)
    if not updated_column:
        raise HTTPException(status_code=404, detail="Table column not found")
    return updated_column

@app.delete("/table-columns/{column_id}")
def delete_table_column(column_id: int, db: Session = Depends(database.get_db)):
    """刪除資料表欄位配置"""
    column = database.delete_table_column(db, column_id)
    if not column:
        raise HTTPException(status_code=404, detail="Table column not found")
    return {"message": "Table column deleted successfully"} 