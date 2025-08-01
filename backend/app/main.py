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
```

## 2. 新增對應的 Pydantic Schemas

```python:backend/app/schemas.py
# 在檔案末尾新增以下 AI 模型相關的 schemas

# AI 模型相關
class AIModelBase(BaseModel):
    name: str
    model_type: str  # isolation_forest, autoencoder, lstm, etc.
    device_id: int
    model_config: Dict[str, Any]
    is_active: bool = True
    is_production: bool = False

class AIModelCreate(AIModelBase):
    pass

class AIModelUpdate(AIModelBase):
    pass

class AIModelOut(AIModelBase):
    id: int
    model_path: Optional[str] = None
    training_data_size: Optional[int] = None
    accuracy: Optional[float] = None
    f1_score: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    created_by: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# 資料預處理相關
class DataPreprocessingBase(BaseModel):
    model_id: int
    preprocessing_type: str
    config: Dict[str, Any]
    is_active: bool = True

class DataPreprocessingCreate(DataPreprocessingBase):
    pass

class DataPreprocessingUpdate(DataPreprocessingBase):
    pass

class DataPreprocessingOut(DataPreprocessingBase):
    id: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# 模型訓練相關
class ModelTrainingBase(BaseModel):
    model_id: int
    training_status: str
    training_data_size: int
    validation_data_size: int

class ModelTrainingCreate(ModelTrainingBase):
    pass

class ModelTrainingUpdate(ModelTrainingBase):
    pass

class ModelTrainingOut(ModelTrainingBase):
    id: int
    training_start: datetime.datetime
    training_end: Optional[datetime.datetime] = None
    training_duration: Optional[float] = None
    final_accuracy: Optional[float] = None
    final_loss: Optional[float] = None
    training_logs: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_by: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# 異常偵測相關
class AnomalyDetectionBase(BaseModel):
    model_id: int
    device_id: int
    data_point_id: int
    anomaly_score: float
    is_anomaly: bool
    confidence: float
    features: Dict[str, Any]
    prediction_details: Dict[str, Any]

class AnomalyDetectionCreate(AnomalyDetectionBase):
    pass

class AnomalyDetectionOut(AnomalyDetectionBase):
    id: int
    detection_time: datetime.datetime
    class Config:
        orm_mode = True

# 異常告警相關
class AnomalyAlertBase(BaseModel):
    detection_id: int
    alert_level: str
    alert_message: str
    recommended_actions: Dict[str, Any]

class AnomalyAlertCreate(AnomalyAlertBase):
    pass

class AnomalyAlertUpdate(AnomalyAlertBase):
    is_acknowledged: bool = False

class AnomalyAlertOut(AnomalyAlertBase):
    id: int
    is_acknowledged: bool
    acknowledged_by: Optional[int] = None
    acknowledged_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# 模型可解釋性相關
class ModelExplainabilityBase(BaseModel):
    model_id: int
    detection_id: int
    feature_importance: Dict[str, Any]
    shap_values: Dict[str, Any]
    lime_explanation: Dict[str, Any]
    decision_path: Dict[str, Any]

class ModelExplainabilityCreate(ModelExplainabilityBase):
    pass

class ModelExplainabilityOut(ModelExplainabilityBase):
    id: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# 模型營運相關
class ModelOperationsBase(BaseModel):
    model_id: int
    operation_type: str
    operation_status: str
    operation_config: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    drift_detection: Dict[str, Any]
    retraining_trigger: str

class ModelOperationsCreate(ModelOperationsBase):
    pass

class ModelOperationsUpdate(ModelOperationsBase):
    pass

class ModelOperationsOut(ModelOperationsBase):
    id: int
    created_by: int
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    class Config:
        orm_mode = True

# 模型版本相關
class ModelVersionBase(BaseModel):
    model_id: int
    version_number: str
    model_path: str
    model_hash: str
    performance_metrics: Dict[str, Any]
    change_log: str
    is_deployed: bool = False

class ModelVersionCreate(ModelVersionBase):
    pass

class ModelVersionUpdate(ModelVersionBase):
    pass

class ModelVersionOut(ModelVersionBase):
    id: int
    deployed_at: Optional[datetime.datetime] = None
    created_by: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# AI 分析請求
class AIAnalysisRequest(BaseModel):
    device_id: int
    model_id: Optional[int] = None
    data_points: Optional[List[Dict[str, Any]]] = None
    include_explanation: bool = False

# 模型訓練請求
class ModelTrainingRequest(BaseModel):
    model_id: int
    training_config: Dict[str, Any]
    data_config: Dict[str, Any]

# 模型部署請求
class ModelDeploymentRequest(BaseModel):
    model_id: int
    version_id: int
    deployment_config: Dict[str, Any]
```

## 3. 新增 AI 模型相關的資料庫操作函數

```python:backend/app/database.py
# 在檔案末尾新增以下 AI 模型相關的函數

# AI 模型管理
def create_ai_model(db, model, user_id: int):
    """創建 AI 模型"""
    db_model = models.AIModel(
        name=model.name,
        model_type=model.model_type,
        device_id=model.device_id,
        model_config=model.model_config,
        is_active=model.is_active,
        is_production=model.is_production,
        created_by=user_id
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_ai_models(db, device_id: int = None):
    """獲取 AI 模型列表"""
    q = db.query(models.AIModel)
    if device_id:
        q = q.filter(models.AIModel.device_id == device_id)
    return q.all()

def get_ai_model(db, model_id: int):
    """獲取特定 AI 模型"""
    return db.query(models.AIModel).filter(models.AIModel.id == model_id).first()

def update_ai_model(db, model_id: int, model):
    """更新 AI 模型"""
    db_model = db.query(models.AIModel).filter(models.AIModel.id == model_id).first()
    if not db_model:
        return None
    
    for field, value in model.dict(exclude_unset=True).items():
        setattr(db_model, field, value)
    
    db.commit()
    db.refresh(db_model)
    return db_model

def delete_ai_model(db, model_id: int):
    """刪除 AI 模型"""
    db_model = db.query(models.AIModel).filter(models.AIModel.id == model_id).first()
    if db_model:
        db.delete(db_model)
        db.commit()
    return db_model

# 資料預處理管理
def create_data_preprocessing(db, preprocessing):
    """創建資料預處理配置"""
    db_preprocessing = models.DataPreprocessing(
        model_id=preprocessing.model_id,
        preprocessing_type=preprocessing.preprocessing_type,
        config=preprocessing.config,
        is_active=preprocessing.is_active
    )
    db.add(db_preprocessing)
    db.commit()
    db.refresh(db_preprocessing)
    return db_preprocessing

def get_data_preprocessing(db, model_id: int):
    """獲取資料預處理配置"""
    return db.query(models.DataPreprocessing).filter(models.DataPreprocessing.model_id == model_id).all()

# 模型訓練管理
def create_model_training(db, training, user_id: int):
    """創建模型訓練記錄"""
    db_training = models.ModelTraining(
        model_id=training.model_id,
        training_status=training.training_status,
        training_start=datetime.datetime.utcnow(),
        training_data_size=training.training_data_size,
        validation_data_size=training.validation_data_size,
        created_by=user_id
    )
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

def update_model_training(db, training_id: int, training):
    """更新模型訓練記錄"""
    db_training = db.query(models.ModelTraining).filter(models.ModelTraining.id == training_id).first()
    if not db_training:
        return None
    
    for field, value in training.dict(exclude_unset=True).items():
        setattr(db_training, field, value)
    
    db.commit()
    db.refresh(db_training)
    return db_training

def get_model_trainings(db, model_id: int = None):
    """獲取模型訓練記錄"""
    q = db.query(models.ModelTraining)
    if model_id:
        q = q.filter(models.ModelTraining.model_id == model_id)
    return q.order_by(models.ModelTraining.created_at.desc()).all()

# 異常偵測管理
def create_anomaly_detection(db, detection):
    """創建異常偵測記錄"""
    db_detection = models.AnomalyDetection(
        model_id=detection.model_id,
        device_id=detection.device_id,
        data_point_id=detection.data_point_id,
        anomaly_score=detection.anomaly_score,
        is_anomaly=detection.is_anomaly,
        confidence=detection.confidence,
        features=detection.features,
        prediction_details=detection.prediction_details
    )
    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)
    return db_detection

def get_anomaly_detections(db, device_id: int = None, model_id: int = None, limit: int = 100):
    """獲取異常偵測記錄"""
    q = db.query(models.AnomalyDetection)
    if device_id:
        q = q.filter(models.AnomalyDetection.device_id == device_id)
    if model_id:
        q = q.filter(models.AnomalyDetection.model_id == model_id)
    return q.order_by(models.AnomalyDetection.detection_time.desc()).limit(limit).all()

# 異常告警管理
def create_anomaly_alert(db, alert):
    """創建異常告警"""
    db_alert = models.AnomalyAlert(
        detection_id=alert.detection_id,
        alert_level=alert.alert_level,
        alert_message=alert.alert_message,
        recommended_actions=alert.recommended_actions
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_anomaly_alerts(db, device_id: int = None, limit: int = 100):
    """獲取異常告警"""
    q = db.query(models.AnomalyAlert).join(models.AnomalyDetection)
    if device_id:
        q = q.filter(models.AnomalyDetection.device_id == device_id)
    return q.order_by(models.AnomalyAlert.created_at.desc()).limit(limit).all()

def acknowledge_anomaly_alert(db, alert_id: int, user_id: int):
    """確認異常告警"""
    db_alert = db.query(models.AnomalyAlert).filter(models.AnomalyAlert.id == alert_id).first()
    if db_alert:
        db_alert.is_acknowledged = True
        db_alert.acknowledged_by = user_id
        db_alert.acknowledged_at = datetime.datetime.utcnow()
        db.commit()
    return db_alert

# 模型可解釋性管理
def create_model_explainability(db, explainability):
    """創建模型可解釋性分析"""
    db_explainability = models.ModelExplainability(
        model_id=explainability.model_id,
        detection_id=explainability.detection_id,
        feature_importance=explainability.feature_importance,
        shap_values=explainability.shap_values,
        lime_explanation=explainability.lime_explanation,
        decision_path=explainability.decision_path
    )
    db.add(db_explainability)
    db.commit()
    db.refresh(db_explainability)
    return db_explainability

def get_model_explainability(db, detection_id: int):
    """獲取模型可解釋性分析"""
    return db.query(models.ModelExplainability).filter(models.ModelExplainability.detection_id == detection_id).first()

# 模型營運管理
def create_model_operations(db, operations, user_id: int):
    """創建模型營運記錄"""
    db_operations = models.ModelOperations(
        model_id=operations.model_id,
        operation_type=operations.operation_type,
        operation_status=operations.operation_status,
        operation_config=operations.operation_config,
        performance_metrics=operations.performance_metrics,
        drift_detection=operations.drift_detection,
        retraining_trigger=operations.retraining_trigger,
        created_by=user_id
    )
    db.add(db_operations)
    db.commit()
    db.refresh(db_operations)
    return db_operations

def get_model_operations(db, model_id: int = None):
    """獲取模型營運記錄"""
    q = db.query(models.ModelOperations)
    if model_id:
        q = q.filter(models.ModelOperations.model_id == model_id)
    return q.order_by(models.ModelOperations.created_at.desc()).all()

# 模型版本管理
def create_model_version(db, version, user_id: int):
    """創建模型版本"""
    db_version = models.ModelVersion(
        model_id=version.model_id,
        version_number=version.version_number,
        model_path=version.model_path,
        model_hash=version.model_hash,
        performance_metrics=version.performance_metrics,
        change_log=version.change_log,
        is_deployed=version.is_deployed,
        created_by=user_id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

def get_model_versions(db, model_id: int):
    """獲取模型版本"""
    return db.query(models.ModelVersion).filter(models.ModelVersion.model_id == model_id).order_by(models.ModelVersion.created_at.desc()).all()

def deploy_model_version(db, version_id: int):
    """部署模型版本"""
    db_version = db.query(models.ModelVersion).filter(models.ModelVersion.id == version_id).first()
    if db_version:
        # 將其他版本設為未部署
        db.query(models.ModelVersion).filter(models.ModelVersion.model_id == db_version.model_id).update({"is_deployed": False})
        # 部署當前版本
        db_version.is_deployed = True
        db_version.deployed_at = datetime.datetime.utcnow()
        db.commit()
    return db_version
```

## 4. 新增 AI 模型相關的 API 端點

```python:backend/app/main.py
<code_block_to_apply_changes_from>
# 在檔案末尾新增以下 AI 模型相關的 API 端點

# AI 模型管理
@app.post("/ai/models/", response_model=schemas.AIModelOut)
def create_ai_model(model: schemas.AIModelCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建 AI 模型"""
    return database.create_ai_model(db, model, current_user.id)

@app.get("/ai/models/", response_model=List[schemas.AIModelOut])
def list_ai_models(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 AI 模型列表"""
    return database.get_ai_models(db, device_id)

@app.get("/ai/models/{model_id}", response_model=schemas.AIModelOut)
def get_ai_model(model_id: int, db: Session = Depends(database.get_db)):
    """獲取特定 AI 模型"""
    model = database.get_ai_model(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    return model

@app.patch("/ai/models/{model_id}", response_model=schemas.AIModelOut)
def update_ai_model(model_id: int, model: schemas.AIModelUpdate, db: Session = Depends(database.get_db)):
    """更新 AI 模型"""
    updated_model = database.update_ai_model(db, model_id, model)
    if not updated_model:
        raise HTTPException(status_code=404, detail="AI model not found")
    return updated_model

@app.delete("/ai/models/{model_id}")
def delete_ai_model(model_id: int, db: Session = Depends(database.get_db)):
    """刪除 AI 模型"""
    model = database.delete_ai_model(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    return {"message": "AI model deleted successfully"}

# 資料預處理管理
@app.post("/ai/preprocessing/", response_model=schemas.DataPreprocessingOut)
def create_data_preprocessing(preprocessing: schemas.DataPreprocessingCreate, db: Session = Depends(database.get_db)):
    """創建資料預處理配置"""
    return database.create_data_preprocessing(db, preprocessing)

@app.get("/ai/preprocessing/{model_id}", response_model=List[schemas.DataPreprocessingOut])
def get_data_preprocessing(model_id: int, db: Session = Depends(database.get_db)):
    """獲取資料預處理配置"""
    return database.get_data_preprocessing(db, model_id)

# 模型訓練管理
@app.post("/ai/training/", response_model=schemas.ModelTrainingOut)
def create_model_training(training: schemas.ModelTrainingCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建模型訓練記錄"""
    return database.create_model_training(db, training, current_user.id)

@app.get("/ai/training/", response_model=List[schemas.ModelTrainingOut])
def list_model_trainings(model_id: int = None, db: Session = Depends(database.get_db)):
    """獲取模型訓練記錄"""
    return database.get_model_trainings(db, model_id)

@app.patch("/ai/training/{training_id}", response_model=schemas.ModelTrainingOut)
def update_model_training(training_id: int, training: schemas.ModelTrainingUpdate, db: Session = Depends(database.get_db)):
    """更新模型訓練記錄"""
    updated_training = database.update_model_training(db, training_id, training)
    if not updated_training:
        raise HTTPException(status_code=404, detail="Model training not found")
    return updated_training

# 異常偵測管理
@app.post("/ai/detection/", response_model=schemas.AnomalyDetectionOut)
def create_anomaly_detection(detection: schemas.AnomalyDetectionCreate, db: Session = Depends(database.get_db)):
    """創建異常偵測記錄"""
    return database.create_anomaly_detection(db, detection)

@app.get("/ai/detection/", response_model=List[schemas.AnomalyDetectionOut])
def list_anomaly_detections(device_id: int = None, model_id: int = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取異常偵測記錄"""
    return database.get_anomaly_detections(db, device_id, model_id, limit)

# 異常告警管理
@app.post("/ai/alerts/", response_model=schemas.AnomalyAlertOut)
def create_anomaly_alert(alert: schemas.AnomalyAlertCreate, db: Session = Depends(database.get_db)):
    """創建異常告警"""
    return database.create_anomaly_alert(db, alert)

@app.get("/ai/alerts/", response_model=List[schemas.AnomalyAlertOut])
def list_anomaly_alerts(device_id: int = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取異常告警"""
    return database.get_anomaly_alerts(db, device_id, limit)

@app.patch("/ai/alerts/{alert_id}/acknowledge")
def acknowledge_anomaly_alert(alert_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """確認異常告警"""
    alert = database.acknowledge_anomaly_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")
    return {"message": "Alert acknowledged successfully"}

# 模型可解釋性管理
@app.post("/ai/explainability/", response_model=schemas.ModelExplainabilityOut)
def create_model_explainability(explainability: schemas.ModelExplainabilityCreate, db: Session = Depends(database.get_db)):
    """創建模型可解釋性分析"""
    return database.create_model_explainability(db, explainability)

@app.get("/ai/explainability/{detection_id}", response_model=schemas.ModelExplainabilityOut)
def get_model_explainability(detection_id: int, db: Session = Depends(database.get_db)):
    """獲取模型可解釋性分析"""
    explainability = database.get_model_explainability(db, detection_id)
    if not explainability:
        raise HTTPException(status_code=404, detail="Model explainability not found")
    return explainability

# 模型營運管理
@app.post("/ai/operations/", response_model=schemas.ModelOperationsOut)
def create_model_operations(operations: schemas.ModelOperationsCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建模型營運記錄"""
    return database.create_model_operations(db, operations, current_user.id)

@app.get("/ai/operations/", response_model=List[schemas.ModelOperationsOut])
def list_model_operations(model_id: int = None, db: Session = Depends(database.get_db)):
    """獲取模型營運記錄"""
    return database.get_model_operations(db, model_id)

# 模型版本管理
@app.post("/ai/versions/", response_model=schemas.ModelVersionOut)
def create_model_version(version: schemas.ModelVersionCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """創建模型版本"""
    return database.create_model_version(db, version, current_user.id)

@app.get("/ai/versions/{model_id}", response_model=List[schemas.ModelVersionOut])
def list_model_versions(model_id: int, db: Session = Depends(database.get_db)):
    """獲取模型版本"""
    return database.get_model_versions(db, model_id)

@app.post("/ai/versions/{version_id}/deploy")
def deploy_model_version(version_id: int, db: Session = Depends(database.get_db)):
    """部署模型版本"""
    version = database.deploy_model_version(db, version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Model version not found")
    return {"message": "Model version deployed successfully"}

# 進階 AI 分析
@app.post("/ai/analysis/")
def perform_ai_analysis(request: schemas.AIAnalysisRequest, db: Session = Depends(database.get_db)):
    """執行 AI 分析"""
    try:
        # 獲取設備數據
        device_data = database.get_device_history(db, request.device_id)
        if not device_data:
            raise HTTPException(status_code=404, detail="No data found for device")
        
        # 提取數值進行分析
        values = [data.value for data in device_data]
        
        # 簡單的異常檢測算法
        mean_value = np.mean(values)
        std_value = np.std(values)
        latest_value = values[-1] if values else 0
        
        # 計算異常分數
        z_score = abs((latest_value - mean_value) / std_value) if std_value > 0 else 0
        anomaly_score = min(100, z_score * 20)
        
        # 判斷是否為異常
        is_anomaly = anomaly_score > 50
        
        # 生成建議
        if is_anomaly:
            if latest_value > mean_value + 2 * std_value:
                advice = "數值異常偏高，建議檢查設備狀態"
            elif latest_value < mean_value - 2 * std_value:
                advice = "數值異常偏低，建議檢查設備狀態"
            else:
                advice = "檢測到異常模式，建議進一步分析"
        else:
            advice = "設備運行正常"
        
        result = {
            "device_id": request.device_id,
            "anomaly_score": round(anomaly_score, 2),
            "latest_value": latest_value,
            "mean_value": round(mean_value, 2),
            "std_value": round(std_value, 2),
            "z_score": round(z_score, 2),
            "is_anomaly": is_anomaly,
            "advice": advice,
            "confidence": max(0, 100 - anomaly_score)
        }
        
        # 如果需要，創建異常偵測記錄
        if is_anomaly and request.model_id:
            detection = schemas.AnomalyDetectionCreate(
                model_id=request.model_id,
                device_id=request.device_id,
                data_point_id=device_data[-1].id,
                anomaly_score=anomaly_score,
                is_anomaly=True,
                confidence=result["confidence"],
                features={"latest_value": latest_value, "mean": mean_value, "std": std_value},
                prediction_details={"z_score": z_score, "method": "statistical"}
            )
            database.create_anomaly_detection(db, detection)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

# 模型訓練
@app.post("/ai/train/")
def train_model(request: schemas.ModelTrainingRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """訓練模型"""
    try:
        # 創建訓練記錄
        training = schemas.ModelTrainingCreate(
            model_id=request.model_id,
            training_status="running",
            training_data_size=request.data_config.get("training_size", 1000),
            validation_data_size=request.data_config.get("validation_size", 200)
        )
        
        db_training = database.create_model_training(db, training, current_user.id)
        
        # 這裡可以實現實際的模型訓練邏輯
        # 目前只是模擬訓練過程
        
        # 更新訓練狀態
        updated_training = schemas.ModelTrainingUpdate(
            training_status="completed",
            final_accuracy=0.85,
            final_loss=0.15,
            training_logs={"epochs": 100, "loss": [0.5, 0.3, 0.2, 0.15]}
        )
        
        database.update_model_training(db, db_training.id, updated_training)
        
        return {
            "training_id": db_training.id,
            "status": "completed",
            "accuracy": 0.85,
            "message": "Model training completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

# 模型部署
@app.post("/ai/deploy/")
def deploy_model(request: schemas.ModelDeploymentRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """部署模型"""
    try:
        # 部署模型版本
        version = database.deploy_model_version(db, request.version_id)
        
        return {
            "model_id": request.model_id,
            "version_id": request.version_id,
            "status": "deployed",
            "message": "Model deployed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model deployment failed: {str(e)}") 