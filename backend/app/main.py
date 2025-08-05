from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import hashlib
import secrets

import models
import schemas
import database

app = FastAPI(title="工業物聯網平台 API", version="1.0.0")

# 資料庫依賴
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 認證相關
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return database.verify_password(plain_password, hashed_password)

def get_password_hash(password):
    return database.get_password_hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    return database.create_access_token(data, expires_delta)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return database.get_current_user(token, db, credentials_exception)

# 審計日誌中間件
async def log_audit(request: Request, user_id: int = None, action: str = None, resource_type: str = None, resource_id: int = None):
    """記錄審計日誌"""
    audit_log = {
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": datetime.utcnow()
    }
    # 這裡可以將審計日誌寫入資料庫或日誌檔案
    print(f"Audit Log: {audit_log}")

# 基本端點
@app.get("/")
def read_root():
    return {"message": "工業物聯網平台 API", "version": "1.0.0"}

# 設備管理 API
@app.post("/devices/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(database.get_db)):
    """創建設備"""
    return database.create_device(db, device)

@app.get("/devices/", response_model=list[schemas.Device])
def list_devices(db: Session = Depends(database.get_db)):
    """獲取設備列表"""
    return database.get_devices(db)

@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(database.get_db)):
    """接收設備數據"""
    return database.create_device_data(db, data)

@app.get("/alerts/", response_model=list[schemas.AlertOut])
def get_alerts(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取告警列表"""
    return database.get_alerts(db, device_id)

@app.get("/history/", response_model=list[schemas.DeviceData])
def get_history(device_id: int, db: Session = Depends(database.get_db)):
    """獲取歷史數據"""
    return database.get_device_history(db, device_id)

@app.get("/ai/anomaly/", response_model=dict)
def ai_anomaly(device_id: int, db: Session = Depends(database.get_db)):
    """AI 異常檢測"""
    return database.detect_anomaly(db, device_id)

# 用戶認證 API
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """用戶註冊"""
    return database.create_user(db, user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """用戶登入"""
    return database.authenticate_user(db, form_data.username, form_data.password)

@app.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """獲取當前用戶資訊"""
    return current_user

# 設備群組 API
@app.post("/groups/", response_model=schemas.DeviceGroupOut)
def create_group(group: schemas.DeviceGroupCreate, db: Session = Depends(database.get_db)):
    """創建設備群組"""
    return database.create_device_group(db, group)

@app.get("/groups/", response_model=list[schemas.DeviceGroupOut])
def list_groups(db: Session = Depends(database.get_db)):
    """獲取設備群組列表"""
    return database.get_device_groups(db)

# 設備更新 API
@app.patch("/devices/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, update: schemas.DeviceUpdate, db: Session = Depends(database.get_db)):
    """更新設備"""
    return database.update_device(db, device_id, update)

@app.post("/devices/register", response_model=schemas.Device)
def register_device(registration: schemas.DeviceRegistration, db: Session = Depends(database.get_db)):
    """註冊新設備"""
    return database.register_device(db, registration)

@app.post("/devices/heartbeat")
def update_heartbeat(heartbeat: schemas.DeviceHeartbeat, db: Session = Depends(database.get_db)):
    """更新設備心跳"""
    return database.update_device_heartbeat(db, heartbeat)

# 設備命令 API
@app.post("/devices/{device_id}/command", response_model=schemas.DeviceCommandOut)
def send_device_command(device_id: int, command: schemas.DeviceCommandCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """發送設備命令"""
    return database.send_device_command(db, device_id, command, current_user.id)

@app.get("/devices/{device_id}/commands", response_model=list[schemas.DeviceCommandOut])
def get_device_commands(device_id: int, db: Session = Depends(database.get_db)):
    """獲取設備命令歷史"""
    return database.get_device_commands(db, device_id)

# 韌體管理 API
@app.post("/firmware/", response_model=schemas.FirmwareOut)
def create_firmware(firmware: schemas.FirmwareCreate, db: Session = Depends(database.get_db)):
    """創建韌體"""
    return database.create_firmware(db, firmware)

@app.get("/firmware/", response_model=list[schemas.FirmwareOut])
def list_firmwares(device_type: str = None, db: Session = Depends(database.get_db)):
    """獲取韌體列表"""
    return database.get_firmwares(db, device_type)

# OTA 更新 API
@app.post("/ota/update", response_model=schemas.OTAUpdateOut)
def create_ota_update(ota_update: schemas.OTAUpdateCreate, db: Session = Depends(database.get_db)):
    """創建 OTA 更新"""
    return database.create_ota_update(db, ota_update)

@app.get("/ota/updates", response_model=list[schemas.OTAUpdateOut])
def list_ota_updates(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 OTA 更新列表"""
    return database.get_ota_updates(db, device_id)

# 規則引擎 API
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
    return database.evaluate_rule(db, rule_id, device_data)

# 工作流程 API
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
    return database.execute_workflow(db, workflow_id)

# 審計日誌 API
@app.get("/audit-logs/", response_model=list[schemas.AuditLogOut])
def get_audit_logs(user_id: int = None, resource_type: str = None, limit: int = 100, db: Session = Depends(database.get_db)):
    """獲取審計日誌"""
    return database.get_audit_logs(db, user_id, resource_type, limit)

# 角色管理 API
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
    return database.check_permission(db, permission)

# 通訊協議 API
@app.post("/protocols/", response_model=schemas.CommunicationProtocolOut)
def create_protocol(protocol: schemas.CommunicationProtocolCreate, db: Session = Depends(database.get_db)):
    """創建通訊協議"""
    return database.create_communication_protocol(db, protocol)

@app.get("/protocols/", response_model=list[schemas.CommunicationProtocolOut])
def list_protocols(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取通訊協議列表"""
    return database.get_communication_protocols(db, device_id)

# MQTT 配置 API
@app.post("/protocols/mqtt/", response_model=schemas.MQTTConfigOut)
def create_mqtt_config(config: schemas.MQTTConfigCreate, db: Session = Depends(database.get_db)):
    """創建 MQTT 配置"""
    return database.create_mqtt_config(db, config)

@app.get("/protocols/mqtt/", response_model=list[schemas.MQTTConfigOut])
def list_mqtt_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 MQTT 配置列表"""
    return database.get_mqtt_configs(db, device_id)

# Modbus TCP 配置 API
@app.post("/protocols/modbus-tcp/", response_model=schemas.ModbusTCPConfigOut)
def create_modbus_tcp_config(config: schemas.ModbusTCPConfigCreate, db: Session = Depends(database.get_db)):
    """創建 Modbus TCP 配置"""
    return database.create_modbus_tcp_config(db, config)

@app.get("/protocols/modbus-tcp/", response_model=list[schemas.ModbusTCPConfigOut])
def list_modbus_tcp_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 Modbus TCP 配置列表"""
    return database.get_modbus_tcp_configs(db, device_id)

# OPC UA 配置 API
@app.post("/protocols/opc-ua/", response_model=schemas.OPCUAConfigOut)
def create_opc_ua_config(config: schemas.OPCUAConfigCreate, db: Session = Depends(database.get_db)):
    """創建 OPC UA 配置"""
    return database.create_opc_ua_config(db, config)

@app.get("/protocols/opc-ua/", response_model=list[schemas.OPCUAConfigOut])
def list_opc_ua_configs(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取 OPC UA 配置列表"""
    return database.get_opc_ua_configs(db, device_id)

# 協議測試 API
@app.post("/protocols/test")
def test_protocol(test: schemas.ProtocolTest, db: Session = Depends(database.get_db)):
    """測試通訊協議"""
    return database.test_protocol(db, test)

# 資料庫連線管理 API
@app.post("/database-connections/", response_model=schemas.DatabaseConnectionOut)
def create_database_connection(connection: schemas.DatabaseConnectionCreate, db: Session = Depends(database.get_db)):
    """創建資料庫連線"""
    return database.create_database_connection(db, connection)

@app.get("/database-connections/", response_model=List[schemas.DatabaseConnectionOut])
def list_database_connections(db: Session = Depends(database.get_db)):
    """獲取資料庫連線列表"""
    return database.get_database_connections(db)

@app.get("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def get_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """獲取特定資料庫連線"""
    connection = database.get_database_connection(db, connection_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return connection

@app.patch("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def update_database_connection(connection_id: int, connection: schemas.DatabaseConnectionUpdate, db: Session = Depends(database.get_db)):
    """更新資料庫連線"""
    return database.update_database_connection(db, connection_id, connection)

@app.delete("/database-connections/{connection_id}")
def delete_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """刪除資料庫連線"""
    return database.delete_database_connection(db, connection_id)

@app.post("/database-connections/{connection_id}/test")
def test_database_connection(connection_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """測試資料庫連線"""
    return database.test_database_connection(db, connection_id)

# 表格結構管理 API
@app.post("/table-schemas/", response_model=schemas.TableSchemaOut)
def create_table_schema(schema: schemas.TableSchemaCreate, db: Session = Depends(database.get_db)):
    """創建表格結構"""
    return database.create_table_schema(db, schema)

@app.get("/table-schemas/", response_model=List[schemas.TableSchemaOut])
def list_table_schemas(db: Session = Depends(database.get_db)):
    """獲取表格結構列表"""
    return database.get_table_schemas(db)

@app.get("/table-schemas/{schema_id}", response_model=schemas.TableSchemaOut)
def get_table_schema(schema_id: int, db: Session = Depends(database.get_db)):
    """獲取特定表格結構"""
    schema = database.get_table_schema(db, schema_id)
    if schema is None:
        raise HTTPException(status_code=404, detail="Table schema not found")
    return schema

@app.patch("/table-schemas/{schema_id}", response_model=schemas.TableSchemaOut)
def update_table_schema(schema_id: int, schema: schemas.TableSchemaUpdate, db: Session = Depends(database.get_db)):
    """更新表格結構"""
    return database.update_table_schema(db, schema_id, schema)

@app.delete("/table-schemas/{schema_id}")
def delete_table_schema(schema_id: int, db: Session = Depends(database.get_db)):
    """刪除表格結構"""
    return database.delete_table_schema(db, schema_id)

# 表格欄位管理 API
@app.post("/table-columns/", response_model=schemas.TableColumnOut)
def create_table_column(column: schemas.TableColumnCreate, db: Session = Depends(database.get_db)):
    """創建表格欄位"""
    return database.create_table_column(db, column)

@app.get("/table-columns/{table_id}", response_model=List[schemas.TableColumnOut])
def list_table_columns(table_id: int, db: Session = Depends(database.get_db)):
    """獲取表格欄位列表"""
    return database.get_table_columns(db, table_id)

@app.patch("/table-columns/{column_id}", response_model=schemas.TableColumnOut)
def update_table_column(column_id: int, column: schemas.TableColumnUpdate, db: Session = Depends(database.get_db)):
    """更新表格欄位"""
    return database.update_table_column(db, column_id, column)

@app.delete("/table-columns/{column_id}")
def delete_table_column(column_id: int, db: Session = Depends(database.get_db)):
    """刪除表格欄位"""
    return database.delete_table_column(db, column_id)

# ONVIF 相關 API
@app.post("/onvif/discover")
def discover_onvif_devices(request: schemas.ONVIFDiscoveryRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """發現 ONVIF 設備"""
    devices = database.discover_onvif_devices(db, request, current_user.id)
    return {"devices": devices, "total": len(devices)}

@app.post("/onvif/configure")
def configure_onvif_device(config: schemas.ONVIFConfigRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """配置 ONVIF 設備"""
    return database.configure_onvif_device(db, config, current_user.id)

@app.post("/onvif/test-connection")
def test_onvif_connection(test: schemas.ONVIFConnectionTest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """測試 ONVIF 連線"""
    return database.test_onvif_connection(db, test, current_user.id)

@app.post("/onvif/stream")
def start_onvif_stream(stream: schemas.ONVIFStreamRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """開始 ONVIF 串流"""
    return database.start_onvif_stream(db, stream, current_user.id)

@app.post("/onvif/ptz-control")
def control_onvif_ptz(control: schemas.ONVIFPTZControl, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """控制 ONVIF PTZ"""
    return database.control_onvif_ptz(db, control, current_user.id)

@app.post("/onvif/events")
def configure_onvif_events(events: schemas.ONVIFEventConfig, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """配置 ONVIF 事件"""
    return database.configure_onvif_events(db, events, current_user.id)

@app.get("/onvif/status/{device_id}")
def get_onvif_status(device_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """獲取 ONVIF 設備狀態"""
    return database.get_onvif_status(db, device_id, current_user.id)

@app.post("/onvif/snapshot")
def take_onvif_snapshot(snapshot: schemas.ONVIFSnapshotRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """拍攝 ONVIF 快照"""
    return database.take_onvif_snapshot(db, snapshot, current_user.id)

# 使用者行為分析 API
@app.post("/analytics/user-behavior/", response_model=schemas.UserBehaviorOut)
def create_user_behavior(behavior: schemas.UserBehaviorCreate, db: Session = Depends(database.get_db)):
    """記錄使用者行為"""
    return database.create_user_behavior(db, behavior)

@app.get("/analytics/usage/", response_model=schemas.UsageAnalytics)
def get_usage_analytics(db: Session = Depends(database.get_db)):
    """獲取使用分析統計"""
    return database.get_usage_analytics(db)

@app.get("/analytics/feature-usage/")
def get_feature_usage(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """獲取功能使用統計"""
    return database.get_feature_usage(db, start_date, end_date)

@app.get("/analytics/user-sessions/")
def get_user_sessions(
    user_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """獲取使用者會話統計"""
    return database.get_user_sessions(db, user_id, start_date, end_date)

# 開發者平台 API
@app.post("/developer/tokens/", response_model=schemas.APITokenOut)
def create_api_token(token: schemas.APITokenCreate, db: Session = Depends(database.get_db)):
    """創建 API Token"""
    return database.create_api_token(db, token)

@app.get("/developer/tokens/")
def get_api_tokens(user_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    """獲取 API Token 列表"""
    return database.get_api_tokens(db, user_id)

@app.delete("/developer/tokens/{token_id}")
def delete_api_token(token_id: int, db: Session = Depends(database.get_db)):
    """刪除 API Token"""
    return database.delete_api_token(db, token_id)

@app.post("/developer/webhooks/", response_model=schemas.WebhookOut)
def create_webhook(webhook: schemas.WebhookCreate, db: Session = Depends(database.get_db)):
    """創建 Webhook"""
    return database.create_webhook(db, webhook)

@app.get("/developer/webhooks/")
def get_webhooks(user_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    """獲取 Webhook 列表"""
    return database.get_webhooks(db, user_id)

@app.post("/developer/webhooks/{webhook_id}/test")
def test_webhook(webhook_id: int, db: Session = Depends(database.get_db)):
    """測試 Webhook"""
    return database.test_webhook(db, webhook_id)

@app.get("/developer/webhooks/{webhook_id}/deliveries")
def get_webhook_deliveries(webhook_id: int, db: Session = Depends(database.get_db)):
    """獲取 Webhook 傳遞記錄"""
    return database.get_webhook_deliveries(db, webhook_id)

@app.get("/developer/api-usage/")
def get_api_usage(
    token_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """獲取 API 使用統計"""
    return database.get_api_usage(db, token_id, start_date, end_date)

@app.get("/developer/sdk-downloads/")
def get_sdk_downloads(db: Session = Depends(database.get_db)):
    """獲取 SDK 下載統計"""
    return database.get_sdk_downloads(db)

@app.post("/developer/sdk-downloads/")
def record_sdk_download(download: schemas.SDKDownloadCreate, db: Session = Depends(database.get_db)):
    """記錄 SDK 下載"""
    return database.record_sdk_download(db, download)

@app.get("/developer/documentation/")
def get_api_documentation(version: Optional[str] = None, db: Session = Depends(database.get_db)):
    """獲取 API 文檔"""
    return database.get_api_documentation(db, version)

@app.post("/developer/documentation/", response_model=schemas.APIDocumentationOut)
def create_api_documentation(doc: schemas.APIDocumentationCreate, db: Session = Depends(database.get_db)):
    """創建 API 文檔"""
    return database.create_api_documentation(db, doc)

@app.get("/developer/portal-stats/", response_model=schemas.DeveloperPortalStats)
def get_developer_portal_stats(db: Session = Depends(database.get_db)):
    """獲取開發者平台統計"""
    return database.get_developer_portal_stats(db)

# Swagger UI 端點
@app.get("/docs")
def get_swagger_ui():
    """Swagger UI 文檔"""
    return {"message": "Swagger UI available at /docs"}

@app.get("/redoc")
def get_redoc():
    """ReDoc 文檔"""
    return {"message": "ReDoc available at /redoc"} 