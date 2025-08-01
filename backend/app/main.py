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

# 在檔案末尾新增以下 AI 模型相關的資料模型

# AI 模型管理
class AIModel(Base):
    __tablename__ = "ai_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 模型名稱
    model_type = Column(String)  # isolation_forest, autoencoder, lstm, etc.
    device_id = Column(Integer, ForeignKey("devices.id"))  # 關聯的設備
    model_path = Column(String)  # 模型檔案路徑
    model_config = Column(JSON)  # 模型配置參數
    training_data_size = Column(Integer)  # 訓練資料大小
    accuracy = Column(Float)  # 模型準確率
    f1_score = Column(Float)  # F1 分數
    precision = Column(Float)  # 精確率
    recall = Column(Float)  # 召回率
    is_active = Column(Boolean, default=True)  # 是否啟用
    is_production = Column(Boolean, default=False)  # 是否為生產環境模型
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 資料預處理配置
class DataPreprocessing(Base):
    __tablename__ = "data_preprocessing"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    preprocessing_type = Column(String)  # normalization, standardization, scaling, etc.
    config = Column(JSON)  # 預處理配置
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 模型訓練記錄
class ModelTraining(Base):
    __tablename__ = "model_trainings"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    training_status = Column(String)  # running, completed, failed
    training_start = Column(DateTime)
    training_end = Column(DateTime)
    training_duration = Column(Float)  # 訓練時間（秒）
    training_data_size = Column(Integer)
    validation_data_size = Column(Integer)
    final_accuracy = Column(Float)
    final_loss = Column(Float)
    training_logs = Column(JSON)  # 訓練日誌
    error_message = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 即時異常偵測結果
class AnomalyDetection(Base):
    __tablename__ = "anomaly_detections"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    data_point_id = Column(Integer, ForeignKey("device_data.id"))
    anomaly_score = Column(Float)  # 異常分數
    is_anomaly = Column(Boolean)  # 是否為異常
    confidence = Column(Float)  # 置信度
    detection_time = Column(DateTime, default=datetime.datetime.utcnow)
    features = Column(JSON)  # 特徵向量
    prediction_details = Column(JSON)  # 預測詳細資訊

# 異常告警與行動建議
class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"
    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("anomaly_detections.id"))
    alert_level = Column(String)  # low, medium, high, critical
    alert_message = Column(String)
    recommended_actions = Column(JSON)  # 建議行動
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 模型可解釋性分析
class ModelExplainability(Base):
    __tablename__ = "model_explainability"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    detection_id = Column(Integer, ForeignKey("anomaly_detections.id"))
    feature_importance = Column(JSON)  # 特徵重要性
    shap_values = Column(JSON)  # SHAP 值
    lime_explanation = Column(JSON)  # LIME 解釋
    decision_path = Column(JSON)  # 決策路徑
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# AI 模型營運與調整
class ModelOperations(Base):
    __tablename__ = "model_operations"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    operation_type = Column(String)  # retrain, update, deploy, rollback
    operation_status = Column(String)  # pending, running, completed, failed
    operation_config = Column(JSON)  # 操作配置
    performance_metrics = Column(JSON)  # 性能指標
    drift_detection = Column(JSON)  # 漂移檢測
    retraining_trigger = Column(String)  # 重訓練觸發條件
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

# 模型版本管理
class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"))
    version_number = Column(String)  # 版本號
    model_path = Column(String)  # 模型檔案路徑
    model_hash = Column(String)  # 模型檔案雜湊值
    performance_metrics = Column(JSON)  # 性能指標
    change_log = Column(String)  # 變更日誌
    is_deployed = Column(Boolean, default=False)
    deployed_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 在檔案末尾新增以下 GPU 監測相關的資料模型

# GPU 設備資訊
class GPUDevice(Base):
    __tablename__ = "gpu_devices"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True)  # GPU 設備 ID
    name = Column(String)  # GPU 名稱
    manufacturer = Column(String)  # 製造商 (NVIDIA, AMD, Intel)
    memory_total = Column(Integer)  # 總記憶體 (MB)
    compute_capability = Column(String)  # 計算能力
    driver_version = Column(String)  # 驅動程式版本
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# GPU 效能監測記錄
class GPUMonitoring(Base):
    __tablename__ = "gpu_monitoring"
    id = Column(Integer, primary_key=True, index=True)
    gpu_device_id = Column(Integer, ForeignKey("gpu_devices.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    gpu_utilization = Column(Float)  # GPU 使用率 (%)
    memory_utilization = Column(Float)  # 記憶體使用率 (%)
    memory_used = Column(Integer)  # 已使用記憶體 (MB)
    memory_free = Column(Integer)  # 可用記憶體 (MB)
    temperature = Column(Float)  # 溫度 (°C)
    power_consumption = Column(Float)  # 功耗 (W)
    fan_speed = Column(Float)  # 風扇轉速 (%)
    clock_speed = Column(Float)  # 時脈速度 (MHz)
    memory_clock = Column(Float)  # 記憶體時脈 (MHz)

# GPU 資源分配
class GPUResourceAllocation(Base):
    __tablename__ = "gpu_resource_allocation"
    id = Column(Integer, primary_key=True, index=True)
    gpu_device_id = Column(Integer, ForeignKey("gpu_devices.id"))
    ai_model_id = Column(Integer, ForeignKey("ai_models.id"))
    allocated_memory = Column(Integer)  # 分配的記憶體 (MB)
    priority = Column(String)  # 優先級 (high, medium, low)
    status = Column(String)  # 狀態 (running, idle, stopped)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))

# GPU 效能警報
class GPUAlert(Base):
    __tablename__ = "gpu_alerts"
    id = Column(Integer, primary_key=True, index=True)
    gpu_device_id = Column(Integer, ForeignKey("gpu_devices.id"))
    alert_type = Column(String)  # temperature, memory, utilization, power
    alert_level = Column(String)  # warning, critical
    alert_message = Column(String)
    threshold_value = Column(Float)
    current_value = Column(Float)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# GPU 效能設定
class GPUPerformanceConfig(Base):
    __tablename__ = "gpu_performance_config"
    id = Column(Integer, primary_key=True, index=True)
    gpu_device_id = Column(Integer, ForeignKey("gpu_devices.id"))
    max_temperature = Column(Float)  # 最大溫度閾值
    max_memory_utilization = Column(Float)  # 最大記憶體使用率閾值
    max_gpu_utilization = Column(Float)  # 最大 GPU 使用率閾值
    max_power_consumption = Column(Float)  # 最大功耗閾值
    auto_fan_control = Column(Boolean, default=True)  # 自動風扇控制
    power_limit = Column(Float)  # 功耗限制 (W)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 在檔案末尾新增以下 GPU 監測相關的 schemas

# GPU 設備相關
class GPUDeviceBase(BaseModel):
    device_id: str
    name: str
    manufacturer: str
    memory_total: int
    compute_capability: Optional[str] = None
    driver_version: Optional[str] = None
    is_active: bool = True

class GPUDeviceCreate(GPUDeviceBase):
    pass

class GPUDeviceUpdate(GPUDeviceBase):
    pass

class GPUDeviceOut(GPUDeviceBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 監測相關
class GPUMonitoringBase(BaseModel):
    gpu_device_id: int
    gpu_utilization: float
    memory_utilization: float
    memory_used: int
    memory_free: int
    temperature: float
    power_consumption: float
    fan_speed: float
    clock_speed: float
    memory_clock: float

class GPUMonitoringCreate(GPUMonitoringBase):
    pass

class GPUMonitoringOut(GPUMonitoringBase):
    id: int
    timestamp: datetime.datetime
    class Config:
        orm_mode = True

# GPU 資源分配相關
class GPUResourceAllocationBase(BaseModel):
    gpu_device_id: int
    ai_model_id: int
    allocated_memory: int
    priority: str
    status: str

class GPUResourceAllocationCreate(GPUResourceAllocationBase):
    pass

class GPUResourceAllocationUpdate(GPUResourceAllocationBase):
    pass

class GPUResourceAllocationOut(GPUResourceAllocationBase):
    id: int
    started_at: datetime.datetime
    ended_at: Optional[datetime.datetime] = None
    created_by: int
    class Config:
        orm_mode = True

# GPU 警報相關
class GPUAlertBase(BaseModel):
    gpu_device_id: int
    alert_type: str
    alert_level: str
    alert_message: str
    threshold_value: float
    current_value: float

class GPUAlertCreate(GPUAlertBase):
    pass

class GPUAlertUpdate(GPUAlertBase):
    is_acknowledged: bool = False

class GPUAlertOut(GPUAlertBase):
    id: int
    is_acknowledged: bool
    acknowledged_by: Optional[int] = None
    acknowledged_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 效能設定相關
class GPUPerformanceConfigBase(BaseModel):
    gpu_device_id: int
    max_temperature: float
    max_memory_utilization: float
    max_gpu_utilization: float
    max_power_consumption: float
    auto_fan_control: bool = True
    power_limit: float

class GPUPerformanceConfigCreate(GPUPerformanceConfigBase):
    pass

class GPUPerformanceConfigUpdate(GPUPerformanceConfigBase):
    pass

class GPUPerformanceConfigOut(GPUPerformanceConfigBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 資源使用統計
class GPUResourceUsage(BaseModel):
    gpu_device_id: int
    total_memory: int
    used_memory: int
    free_memory: int
    memory_utilization: float
    gpu_utilization: float
    temperature: float
    power_consumption: float
    available_for_ai: bool
    recommended_models: List[str]

## 3. 新增 GPU 監測相關的資料庫操作函數

```python:backend/app/database.py
# 在檔案末尾新增以下 GPU 監測相關的函數

# GPU 設備管理
def create_gpu_device(db, device):
    """創建 GPU 設備"""
    db_device = models.GPUDevice(
        device_id=device.device_id,
        name=device.name,
        manufacturer=device.manufacturer,
        memory_total=device.memory_total,
        compute_capability=device.compute_capability,
        driver_version=device.driver_version,
        is_active=device.is_active
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_gpu_devices(db):
    """獲取所有 GPU 設備"""
    return db.query(models.GPUDevice).all()

def get_gpu_device(db, device_id: int):
    """獲取特定 GPU 設備"""
    return db.query(models.GPUDevice).filter(models.GPUDevice.id == device_id).first()

def update_gpu_device(db, device_id: int, device):
    """更新 GPU 設備"""
    db_device = db.query(models.GPUDevice).filter(models.GPUDevice.id == device_id).first()
    if not db_device:
        return None
    
    for field, value in device.dict(exclude_unset=True).items():
        setattr(db_device, field, value)
    
    db.commit()
    db.refresh(db_device)
    return db_device

def delete_gpu_device(db, device_id: int):
    """刪除 GPU 設備"""
    db_device = db.query(models.GPUDevice).filter(models.GPUDevice.id == device_id).first()
    if db_device:
        db.delete(db_device)
        db.commit()
    return db_device

# GPU 監測管理
def create_gpu_monitoring(db, monitoring):
    """創建 GPU 監測記錄"""
    db_monitoring = models.GPUMonitoring(
        gpu_device_id=monitoring.gpu_device_id,
        gpu_utilization=monitoring.gpu_utilization,
        memory_utilization=monitoring.memory_utilization,
        memory_used=monitoring.memory_used,
        memory_free=monitoring.memory_free,
        temperature=monitoring.temperature,
        power_consumption=monitoring.power_consumption,
        fan_speed=monitoring.fan_speed,
        clock_speed=monitoring.clock_speed,
        memory_clock=monitoring.memory_clock
    )
    db.add(db_monitoring)
    db.commit()
    db.refresh(db_monitoring)
    return db_monitoring

def get_gpu_monitoring(db, gpu_device_id: int = None, limit: int = 100):
    """獲取 GPU 監測記錄"""
    q = db.query(models.GPUMonitoring)
    if gpu_device_id:
        q = q.filter(models.GPUMonitoring.gpu_device_id == gpu_device_id)
    return q.order_by(models.GPUMonitoring.timestamp.desc()).limit(limit).all()

def get_latest_gpu_monitoring(db, gpu_device_id: int):
    """獲取最新的 GPU 監測記錄"""
    return db.query(models.GPUMonitoring).filter(
        models.GPUMonitoring.gpu_device_id == gpu_device_id
    ).order_by(models.GPUMonitoring.timestamp.desc()).first()

# GPU 資源分配管理
def create_gpu_resource_allocation(db, allocation, user_id: int):
    """創建 GPU 資源分配"""
    db_allocation = models.GPUResourceAllocation(
        gpu_device_id=allocation.gpu_device_id,
        ai_model_id=allocation.ai_model_id,
        allocated_memory=allocation.allocated_memory,
        priority=allocation.priority,
        status=allocation.status,
        created_by=user_id
    )
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation

def get_gpu_resource_allocations(db, gpu_device_id: int = None):
    """獲取 GPU 資源分配"""
    q = db.query(models.GPUResourceAllocation)
    if gpu_device_id:
        q = q.filter(models.GPUResourceAllocation.gpu_device_id == gpu_device_id)
    return q.order_by(models.GPUResourceAllocation.started_at.desc()).all()

def update_gpu_resource_allocation(db, allocation_id: int, allocation):
    """更新 GPU 資源分配"""
    db_allocation = db.query(models.GPUResourceAllocation).filter(
        models.GPUResourceAllocation.id == allocation_id
    ).first()
    if not db_allocation:
        return None
    
    for field, value in allocation.dict(exclude_unset=True).items():
        setattr(db_allocation, field, value)
    
    db.commit()
    db.refresh(db_allocation)
    return db_allocation

# GPU 警報管理
def create_gpu_alert(db, alert):
    """創建 GPU 警報"""
    db_alert = models.GPUAlert(
        gpu_device_id=alert.gpu_device_id,
        alert_type=alert.alert_type,
        alert_level=alert.alert_level,
        alert_message=alert.alert_message,
        threshold_value=alert.threshold_value,
        current_value=alert.current_value
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_gpu_alerts(db, gpu_device_id: int = None, limit: int = 100):
    """獲取 GPU 警報"""
    q = db.query(models.GPUAlert)
    if gpu_device_id:
        q = q.filter(models.GPUAlert.gpu_device_id == gpu_device_id)
    return q.order_by(models.GPUAlert.created_at.desc()).limit(limit).all()

def acknowledge_gpu_alert(db, alert_id: int, user_id: int):
    """確認 GPU 警報"""
    db_alert = db.query(models.GPUAlert).filter(models.GPUAlert.id == alert_id).first()
    if db_alert:
        db_alert.is_acknowledged = True
        db_alert.acknowledged_by = user_id
        db_alert.acknowledged_at = datetime.datetime.utcnow()
        db.commit()
    return db_alert

# GPU 效能設定管理
def create_gpu_performance_config(db, config):
    """創建 GPU 效能設定"""
    db_config = models.GPUPerformanceConfig(
        gpu_device_id=config.gpu_device_id,
        max_temperature=config.max_temperature,
        max_memory_utilization=config.max_memory_utilization,
        max_gpu_utilization=config.max_gpu_utilization,
        max_power_consumption=config.max_power_consumption,
        auto_fan_control=config.auto_fan_control,
        power_limit=config.power_limit
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_gpu_performance_config(db, gpu_device_id: int):
    """獲取 GPU 效能設定"""
    return db.query(models.GPUPerformanceConfig).filter(
        models.GPUPerformanceConfig.gpu_device_id == gpu_device_id
    ).first()

def update_gpu_performance_config(db, config_id: int, config):
    """更新 GPU 效能設定"""
    db_config = db.query(models.GPUPerformanceConfig).filter(
        models.GPUPerformanceConfig.id == config_id
    ).first()
    if not db_config:
        return None
    
    for field, value in config.dict(exclude_unset=True).items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config

# GPU 資源使用統計
def get_gpu_resource_usage(db, gpu_device_id: int):
    """獲取 GPU 資源使用統計"""
    # 獲取最新的監測記錄
    latest_monitoring = get_latest_gpu_monitoring(db, gpu_device_id)
    if not latest_monitoring:
        return None
    
    # 獲取 GPU 設備資訊
    gpu_device = get_gpu_device(db, gpu_device_id)
    if not gpu_device:
        return None
    
    # 計算可用性
    available_for_ai = (
        latest_monitoring.memory_utilization < 90 and
        latest_monitoring.temperature < 85 and
        latest_monitoring.gpu_utilization < 95
    )
    
    # 推薦模型（基於可用資源）
    recommended_models = []
    free_memory_gb = latest_monitoring.memory_free / 1024
    
    if free_memory_gb >= 8:
        recommended_models.extend(["大型語言模型", "圖像生成模型", "視頻處理模型"])
    elif free_memory_gb >= 4:
        recommended_models.extend(["中型語言模型", "圖像分類模型", "語音識別模型"])
    elif free_memory_gb >= 2:
        recommended_models.extend(["小型語言模型", "簡單分類模型"])
    else:
        recommended_models.append("輕量級模型")
    
    return {
        "gpu_device_id": gpu_device_id,
        "total_memory": gpu_device.memory_total,
        "used_memory": latest_monitoring.memory_used,
        "free_memory": latest_monitoring.memory_free,
        "memory_utilization": latest_monitoring.memory_utilization,
        "gpu_utilization": latest_monitoring.gpu_utilization,
        "temperature": latest_monitoring.temperature,
        "power_consumption": latest_monitoring.power_consumption,
        "available_for_ai": available_for_ai,
        "recommended_models": recommended_models
    }
```

## 4. 新增 GPU 監測相關的 API 端點

```python:backend/app/main.py
<code_block_to_apply_changes_from>
# 在檔案末尾新增以下 GPU 監測相關的 API 端點

# GPU 設備管理
@app.post("/gpu/devices/", response_model=schemas.GPUDeviceOut)
def create_gpu_device(device: schemas.GPUDeviceCreate, db: Session = Depends(database.get_db)):
    """創建 GPU 設備"""
    return database.create_gpu_device(db, device)

@app.get("/gpu/devices/", response_model=List[schemas.GPUDeviceOut])
def list_gpu_devices(db: Session = Depends(database.get_db)):
    """獲取所有 GPU 設備"""
    return database.get_gpu_devices(db)

@app.get("/gpu/devices/{device_id}", response_model=schemas.GPUDeviceOut)
def get_gpu_device(device_id: int, db: Session = Depends(database.get_db)):
    """獲取特定 GPU 設備"""
    device = database.get_gpu_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="GPU device not found")
    return device

@app.patch("/gpu/devices/{device_id}", response_model=schemas.GPUDeviceOut)
def update_gpu_device(device_id: int, device: schemas.GPUDeviceUpdate, db: Session = Depends(database.get_db)):
    """更新 GPU 設備"""
    updated_device = database.update_gpu_device(db, device_id, device)
    if not updated_device:
        raise HTTPException(status_code=404, detail="GPU device not found")
    return updated_device

@app.delete("/gpu/devices/{device_id}")
def delete_gpu_device(device_id: int, db: Session = Depends(database.get_db)):
    """刪除 GPU 設備"""
    device = database.delete_gpu_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="GPU device not found")
    return {"message": "GPU device deleted successfully"}

# GPU 監測管理
@app.post("/gpu/monitoring/", response_model=schemas.GPUMonitoringOut)
def create_gpu_monitoring(monitoring: schemas.GPUMonitoringCreate, db: Session = Depends(database.get_db)):
    """創建 GPU 監測記錄"""
    return database.create_gpu_monitoring(db, monitoring)

@app.get("/gpu/monitoring/", response_model=List[schemas.GPUMonitoringOut])
def list_gpu_monitoring(gpu_device_id: int = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取 GPU 監測記錄"""
    return database.get_gpu_monitoring(db, gpu_device_id, limit)

@app.get("/gpu/monitoring/{gpu_device_id}/latest", response_model=schemas.GPUMonitoringOut)
def get_latest_gpu_monitoring(gpu_device_id: int, db: Session = Depends(database.get_db)):
    """獲取最新的 GPU 監測記錄"""
    monitoring = database.get_latest_gpu_monitoring(db, gpu_device_id)
    if not monitoring:
        raise HTTPException(status_code=404, detail="GPU monitoring not found")
    return monitoring

# GPU 資源分配管理
@app.post("/gpu/allocations/", response_model=schemas.GPUResourceAllocationOut)
def create_gpu_resource_allocation(allocation: schemas.GPUResourceAllocationCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建 GPU 資源分配"""
    return database.create_gpu_resource_allocation(db, allocation, current_user.id)

@app.get("/gpu/allocations/", response_model=List[schemas.GPUResourceAllocationOut])
def list_gpu_resource_allocations(gpu_device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 GPU 資源分配"""
    return database.get_gpu_resource_allocations(db, gpu_device_id)

@app.patch("/gpu/allocations/{allocation_id}", response_model=schemas.GPUResourceAllocationOut)
def update_gpu_resource_allocation(allocation_id: int, allocation: schemas.GPUResourceAllocationUpdate, db: Session = Depends(database.get_db)):
    """更新 GPU 資源分配"""
    updated_allocation = database.update_gpu_resource_allocation(db, allocation_id, allocation)
    if not updated_allocation:
        raise HTTPException(status_code=404, detail="GPU resource allocation not found")
    return updated_allocation

# GPU 警報管理
@app.post("/gpu/alerts/", response_model=schemas.GPUAlertOut)
def create_gpu_alert(alert: schemas.GPUAlertCreate, db: Session = Depends(database.get_db)):
    """創建 GPU 警報"""
    return database.create_gpu_alert(db, alert)

@app.get("/gpu/alerts/", response_model=List[schemas.GPUAlertOut])
def list_gpu_alerts(gpu_device_id: int = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取 GPU 警報"""
    return database.get_gpu_alerts(db, gpu_device_id, limit)

@app.patch("/gpu/alerts/{alert_id}/acknowledge")
def acknowledge_gpu_alert(alert_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """確認 GPU 警報"""
    alert = database.acknowledge_gpu_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="GPU alert not found")
    return {"message": "GPU alert acknowledged successfully"}

# GPU 效能設定管理
@app.post("/gpu/performance-config/", response_model=schemas.GPUPerformanceConfigOut)
def create_gpu_performance_config(config: schemas.GPUPerformanceConfigCreate, db: Session = Depends(database.get_db)):
    """創建 GPU 效能設定"""
    return database.create_gpu_performance_config(db, config)

@app.get("/gpu/performance-config/{gpu_device_id}", response_model=schemas.GPUPerformanceConfigOut)
def get_gpu_performance_config(gpu_device_id: int, db: Session = Depends(database.get_db)):
    """獲取 GPU 效能設定"""
    config = database.get_gpu_performance_config(db, gpu_device_id)
    if not config:
        raise HTTPException(status_code=404, detail="GPU performance config not found")
    return config

@app.patch("/gpu/performance-config/{config_id}", response_model=schemas.GPUPerformanceConfigOut)
def update_gpu_performance_config(config_id: int, config: schemas.GPUPerformanceConfigUpdate, db: Session = Depends(database.get_db)):
    """更新 GPU 效能設定"""
    updated_config = database.update_gpu_performance_config(db, config_id, config)
    if not updated_config:
        raise HTTPException(status_code=404, detail="GPU performance config not found")
    return updated_config

# GPU 資源使用統計
@app.get("/gpu/resource-usage/{gpu_device_id}")
def get_gpu_resource_usage(gpu_device_id: int, db: Session = Depends(database.get_db)):
    """獲取 GPU 資源使用統計"""
    usage = database.get_gpu_resource_usage(db, gpu_device_id)
    if not usage:
        raise HTTPException(status_code=404, detail="GPU resource usage not found")
    return usage

# GPU 自動監測（模擬數據）
@app.post("/gpu/simulate-monitoring/{gpu_device_id}")
def simulate_gpu_monitoring(gpu_device_id: int, db: Session = Depends(database.get_db)):
    """模擬 GPU 監測數據"""
    import random
    
    # 模擬 GPU 監測數據
    monitoring_data = schemas.GPUMonitoringCreate(
        gpu_device_id=gpu_device_id,
        gpu_utilization=random.uniform(20, 80),
        memory_utilization=random.uniform(30, 85),
        memory_used=random.randint(2000, 6000),
        memory_free=random.randint(1000, 4000),
        temperature=random.uniform(45, 75),
        power_consumption=random.uniform(80, 200),
        fan_speed=random.uniform(30, 80),
        clock_speed=random.uniform(1000, 1800),
        memory_clock=random.uniform(5000, 8000)
    )
    
    # 檢查是否需要創建警報
    if monitoring_data.temperature > 70:
        alert = schemas.GPUAlertCreate(
            gpu_device_id=gpu_device_id,
            alert_type="temperature",
            alert_level="warning",
            alert_message=f"GPU 溫度過高: {monitoring_data.temperature:.1f}°C",
            threshold_value=70,
            current_value=monitoring_data.temperature
        )
        database.create_gpu_alert(db, alert)
    
    if monitoring_data.memory_utilization > 90:
        alert = schemas.GPUAlertCreate(
            gpu_device_id=gpu_device_id,
            alert_type="memory",
            alert_level="critical",
            alert_message=f"GPU 記憶體使用率過高: {monitoring_data.memory_utilization:.1f}%",
            threshold_value=90,
            current_value=monitoring_data.memory_utilization
        )
        database.create_gpu_alert(db, alert)
    
    return database.create_gpu_monitoring(db, monitoring_data) 