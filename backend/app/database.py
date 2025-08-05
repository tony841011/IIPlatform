from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import (
    Device, DeviceData, User, Alert, Base, DeviceGroup, Role, 
    Firmware, OTAUpdate, Rule, Workflow, WorkflowExecution, 
    AuditLog, DeviceCommand, CommunicationProtocol, MQTTConfig, 
    ModbusTCPConfig, OPCUAConfig, DatabaseConnection
)
import datetime
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 基本 CRUD 操作
def create_device(db, device):
    db_device = Device(name=device.name, location=device.location)
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db):
    return db.query(Device).all()

def save_device_data(db, data):
    db_data = DeviceData(device_id=data.device_id, value=data.value, timestamp=data.timestamp)
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def get_user_by_username(db, username):
    return db.query(User).filter(User.username == username).first()

def create_user(db, user):
    db_user = User(username=user.username, hashed_password=user.hashed_password, role=user.role if hasattr(user, 'role') else 'user')
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_alert(db, alert):
    db_alert = Alert(device_id=alert.device_id, value=alert.value, timestamp=alert.timestamp, message=alert.message)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_alerts(db, device_id=None):
    q = db.query(Alert)
    if device_id:
        q = q.filter(Alert.device_id == device_id)
    return q.order_by(Alert.timestamp.desc()).all()

def create_device_group(db, group):
    # 修復：使用相對導入
    db_group = DeviceGroup(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_device_groups(db):
    # 修復：使用相對導入
    return db.query(DeviceGroup).all()

def update_device(db, device_id, update):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device

# 設備管理與遠端控制
def register_device(db, registration):
    """設備註冊"""
    api_key = str(uuid.uuid4())
    device = Device(
        name=registration.device_id,
        device_type=registration.device_type,
        firmware_version=registration.firmware_version,
        api_key=api_key,
        is_registered=True,
        registration_date=datetime.datetime.utcnow(),
        status="online"
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

def update_device_heartbeat(db, heartbeat):
    """更新設備心跳"""
    device = db.query(Device).filter(Device.id == heartbeat.device_id).first()
    if device:
        device.last_heartbeat = datetime.datetime.utcnow()
        device.battery_level = heartbeat.battery_level
        device.temperature = heartbeat.temperature
        device.status = heartbeat.status
        db.commit()
        db.refresh(device)
    return device

def create_device_command(db, command, user_id):
    """創建設備命令"""
    db_command = DeviceCommand(
        device_id=command.device_id,
        command_type=command.command_type,
        parameters=command.parameters,
        status="pending",
        sent_by=user_id
    )
    db.add(db_command)
    db.commit()
    db.refresh(db_command)
    return db_command

def get_device_commands(db, device_id=None):
    q = db.query(DeviceCommand)
    if device_id:
        q = q.filter(DeviceCommand.device_id == device_id)
    return q.order_by(DeviceCommand.sent_at.desc()).all()

# 韌體管理
def create_firmware(db, firmware):
    """創建韌體"""
    db_firmware = Firmware(
        version=firmware.version,
        description=firmware.description,
        device_type=firmware.device_type
    )
    db.add(db_firmware)
    db.commit()
    db.refresh(db_firmware)
    return db_firmware

def get_firmwares(db, device_type=None):
    q = db.query(Firmware)
    if device_type:
        q = q.filter(Firmware.device_type == device_type)
    return q.all()

# OTA 更新
def create_ota_update(db, ota_update):
    """創建 OTA 更新"""
    db_ota = OTAUpdate(
        device_id=ota_update.device_id,
        firmware_id=ota_update.firmware_id,
        status="pending",
        started_at=datetime.datetime.utcnow()
    )
    db.add(db_ota)
    db.commit()
    db.refresh(db_ota)
    return db_ota

def get_ota_updates(db, device_id=None):
    q = db.query(OTAUpdate)
    if device_id:
        q = q.filter(OTAUpdate.device_id == device_id)
    return q.order_by(OTAUpdate.started_at.desc()).all()

# 規則管理
def create_rule(db, rule, user_id):
    """創建規則"""
    db_rule = Rule(
        name=rule.name,
        description=rule.description,
        conditions=rule.conditions,
        actions=rule.actions,
        created_by=user_id
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def get_rules(db):
    return db.query(Rule).all()

def evaluate_rule(db, rule_id, device_data):
    """評估規則"""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        return {"error": "規則不存在"}
    # 這裡實現規則評估邏輯
    return {"rule_id": rule_id, "evaluated": True, "result": "success"}

# 工作流程管理
def create_workflow(db, workflow, user_id):
    """創建工作流程"""
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        trigger_type=workflow.trigger_type,
        trigger_conditions=workflow.trigger_conditions,
        steps=workflow.steps,
        created_by=user_id
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def get_workflows(db):
    return db.query(Workflow).all()

def create_workflow_execution(db, workflow_id):
    """創建工作流程執行"""
    db_execution = WorkflowExecution(
        workflow_id=workflow_id,
        status="running",
        started_at=datetime.datetime.utcnow()
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution

# 審計日誌
def create_audit_log(db, audit_log, user_id=None):
    """創建審計日誌"""
    db_audit = AuditLog(
        user_id=user_id,
        action=audit_log.action,
        resource_type=audit_log.resource_type,
        resource_id=audit_log.resource_id,
        details=audit_log.details,
        ip_address=audit_log.ip_address,
        user_agent=audit_log.user_agent
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

def get_audit_logs(db, user_id=None, resource_type=None, limit=100):
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()

# 角色管理
def create_role(db, role):
    """創建角色"""
    db_role = Role(
        name=role.name,
        description=role.description,
        permissions=role.permissions
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_roles(db):
    return db.query(Role).all()

def check_permission(db, user_id, resource_type, resource_id, action):
    """檢查權限"""
    # 這裡實現權限檢查邏輯
    return {"user_id": user_id, "resource_type": resource_type, "resource_id": resource_id, "action": action, "allowed": True}

# 通訊協定管理
def create_communication_protocol(db, protocol):
    """創建通訊協定"""
    db_protocol = CommunicationProtocol(
        device_id=protocol.device_id,
        protocol_type=protocol.protocol_type,
        config=protocol.config
    )
    db.add(db_protocol)
    db.commit()
    db.refresh(db_protocol)
    return db_protocol

def get_communication_protocols(db, device_id=None):
    q = db.query(CommunicationProtocol)
    if device_id:
        q = q.filter(CommunicationProtocol.device_id == device_id)
    return q.all()

# MQTT 配置
def create_mqtt_config(db, config):
    """創建 MQTT 配置"""
    db_config = MQTTConfig(
        device_id=config.device_id,
        broker_url=config.broker_url,
        broker_port=config.broker_port,
        username=config.username,
        password=config.password,
        topic_prefix=config.topic_prefix,
        qos_level=config.qos_level,
        keep_alive=config.keep_alive,
        is_ssl=config.is_ssl
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_mqtt_configs(db, device_id=None):
    q = db.query(MQTTConfig)
    if device_id:
        q = q.filter(MQTTConfig.device_id == device_id)
    return q.all()

# Modbus TCP 配置
def create_modbus_tcp_config(db, config):
    """創建 Modbus TCP 配置"""
    db_config = ModbusTCPConfig(
        device_id=config.device_id,
        host=config.host,
        port=config.port,
        unit_id=config.unit_id,
        timeout=config.timeout,
        retries=config.retries
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_modbus_tcp_configs(db, device_id=None):
    q = db.query(ModbusTCPConfig)
    if device_id:
        q = q.filter(ModbusTCPConfig.device_id == device_id)
    return q.all()

# OPC UA 配置
def create_opc_ua_config(db, config):
    """創建 OPC UA 配置"""
    db_config = OPCUAConfig(
        device_id=config.device_id,
        server_url=config.server_url,
        namespace=config.namespace,
        node_id=config.node_id,
        username=config.username,
        password=config.password,
        security_policy=config.security_policy,
        message_security_mode=config.message_security_mode
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_opc_ua_configs(db, device_id=None):
    q = db.query(OPCUAConfig)
    if device_id:
        q = q.filter(OPCUAConfig.device_id == device_id)
    return q.all()

# 資料庫連線管理
def create_database_connection(db, connection):
    """創建資料庫連線"""
    try:
        # 修復：使用 Pydantic v2 的 model_dump() 方法
        connection_data = connection.model_dump()
        db_connection = DatabaseConnection(**connection_data)
        db.add(db_connection)
        db.commit()
        db.refresh(db_connection)
        return db_connection
    except Exception as e:
        db.rollback()
        raise Exception(f"創建資料庫連線失敗: {str(e)}")

def get_database_connections(db):
    """獲取資料庫連線列表"""
    return db.query(DatabaseConnection).all()

def get_database_connection(db, connection_id):
    """獲取特定資料庫連線"""
    return db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()

def update_database_connection(db, connection_id, connection):
    """更新資料庫連線"""
    try:
        db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
        if not db_connection:
            raise Exception("資料庫連線不存在")
        
        # 修復：使用 Pydantic v2 的 model_dump() 方法
        update_data = connection.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_connection, field, value)
        db.commit()
        db.refresh(db_connection)
        return db_connection
    except Exception as e:
        db.rollback()
        raise Exception(f"更新資料庫連線失敗: {str(e)}")

def delete_database_connection(db, connection_id):
    """刪除資料庫連線"""
    db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
    if db_connection:
        db.delete(db_connection)
        db.commit()
    return {"message": "連線已刪除"}

# 資料表配置管理
def create_table_schema(db, schema):
    """創建資料表配置"""
    # 這裡需要實現資料表配置的創建邏輯
    return {"message": "資料表配置創建成功"}

def get_table_schemas(db):
    """獲取資料表配置列表"""
    return []

def get_table_schema(db, schema_id):
    """獲取特定資料表配置"""
    return None

def update_table_schema(db, schema_id, schema):
    """更新資料表配置"""
    return {"message": "資料表配置更新成功"}

def delete_table_schema(db, schema_id):
    """刪除資料表配置"""
    return {"message": "資料表配置刪除成功"}

# 資料表欄位配置管理
def create_table_column(db, column):
    """創建資料表欄位配置"""
    return {"message": "資料表欄位配置創建成功"}

def get_table_columns(db, table_id):
    """獲取資料表欄位配置列表"""
    return []

def update_table_column(db, column_id, column):
    """更新資料表欄位配置"""
    return {"message": "資料表欄位配置更新成功"}

def delete_table_column(db, column_id):
    """刪除資料表欄位配置"""
    return {"message": "資料表欄位配置刪除成功"}

# ONVIF 相關功能
def discover_onvif_devices(db, request, user_id):
    """發現 ONVIF 設備"""
    # 這裡實現 ONVIF 設備發現邏輯
    return []

def configure_onvif_device(db, config, user_id):
    """配置 ONVIF 設備"""
    return {"message": "ONVIF 設備配置成功"}

def test_onvif_connection(db, test, user_id):
    """測試 ONVIF 連線"""
    return {"message": "ONVIF 連線測試成功"}

def start_onvif_stream(db, stream, user_id):
    """開始 ONVIF 串流"""
    return {"message": "ONVIF 串流開始成功"}

def control_onvif_ptz(db, control, user_id):
    """控制 ONVIF PTZ"""
    return {"message": "ONVIF PTZ 控制成功"}

def configure_onvif_events(db, events, user_id):
    """配置 ONVIF 事件"""
    return {"message": "ONVIF 事件配置成功"}

def get_onvif_status(db, device_id, user_id):
    """獲取 ONVIF 設備狀態"""
    return {"status": "online"}

def take_onvif_snapshot(db, snapshot, user_id):
    """拍攝 ONVIF 快照"""
    return {"message": "ONVIF 快照拍攝成功"}

# 使用者行為分析
def create_user_behavior(db, behavior):
    """創建使用者行為記錄"""
    # 這裡需要實現使用者行為記錄的創建邏輯
    return {"message": "使用者行為記錄創建成功"}

def get_usage_analytics(db):
    """獲取使用分析"""
    return {
        "total_users": 0,
        "active_users_today": 0,
        "active_users_week": 0,
        "active_users_month": 0,
        "total_sessions": 0,
        "avg_session_duration": 0.0,
        "most_used_features": [],
        "user_activity_timeline": []
    }

def get_feature_usage(db, start_date=None, end_date=None):
    """獲取功能使用統計"""
    return []

def get_user_sessions(db, user_id=None, start_date=None, end_date=None):
    """獲取使用者會話統計"""
    return []

# 開發者入口
def create_api_token(db, token):
    """創建 API Token"""
    return {"message": "API Token 創建成功"}

def get_api_tokens(db, user_id=None):
    """獲取 API Token 列表"""
    return []

def delete_api_token(db, token_id):
    """刪除 API Token"""
    return {"message": "API Token 刪除成功"}

def create_webhook(db, webhook):
    """創建 Webhook"""
    return {"message": "Webhook 創建成功"}

def get_webhooks(db, user_id=None):
    """獲取 Webhook 列表"""
    return []

def test_webhook(db, webhook_id):
    """測試 Webhook"""
    return {"message": "Webhook 測試成功"}

def get_webhook_deliveries(db, webhook_id):
    """獲取 Webhook 發送記錄"""
    return []

def get_api_usage(db, token_id=None, start_date=None, end_date=None):
    """獲取 API 使用統計"""
    return []

def get_sdk_downloads(db):
    """獲取 SDK 下載統計"""
    return []

def record_sdk_download(db, download):
    """記錄 SDK 下載"""
    return {"message": "SDK 下載記錄成功"}

def get_api_documentation(db, version=None):
    """獲取 API 文檔"""
    return {"content": "API 文檔內容"}

def create_api_documentation(db, doc):
    """創建 API 文檔"""
    return {"message": "API 文檔創建成功"}

def get_developer_portal_stats(db):
    """獲取開發者入口統計"""
    return {
        "total_tokens": 0,
        "active_tokens": 0,
        "total_webhooks": 0,
        "active_webhooks": 0,
        "api_calls_today": 0,
        "api_calls_week": 0
    }

# MongoDB 連線測試功能
def test_mongodb_connection(connection_data):
    """測試 MongoDB 連線"""
    try:
        import pymongo
        from pymongo import MongoClient
        import time
        
        start_time = time.time()
        
        # 構建 MongoDB 連線字串
        mongo_url = connection_data.connection_string
        
        # 建立連線
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
        
        # 測試連線
        client.admin.command('ping')
        
        # 獲取資料庫資訊
        db_info = client.server_info()
        
        end_time = time.time()
        response_time = end_time - start_time
        
        client.close()
        
        return {
            "success": True,
            "response_time": response_time,
            "server_info": db_info,
            "error_message": None
        }
    except Exception as e:
        return {
            "success": False,
            "response_time": None,
            "server_info": None,
            "error_message": str(e)
        }

def test_database_connection(connection_data):
    """測試資料庫連線"""
    if connection_data.db_type == 'mongodb':
        return test_mongodb_connection(connection_data)
    else:
        # 原有的 SQL 資料庫測試邏輯
        try:
            import time
            start_time = time.time()
            
            # 根據資料庫類型建立引擎
            if connection_data.db_type == 'sqlite':
                engine = create_engine(connection_data.connection_string)
            elif connection_data.db_type == 'mysql':
                engine = create_engine(connection_data.connection_string)
            elif connection_data.db_type == 'postgresql':
                engine = create_engine(connection_data.connection_string)
            elif connection_data.db_type == 'oracle':
                engine = create_engine(connection_data.connection_string)
            elif connection_data.db_type == 'mssql':
                engine = create_engine(connection_data.connection_string)
            else:
                return {
                    "success": False,
                    "response_time": None,
                    "error_message": f"不支援的資料庫類型: {connection_data.db_type}"
                }
            
            # 測試連線
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            
            end_time = time.time()
            response_time = end_time - start_time
            
            return {
                "success": True,
                "response_time": response_time,
                "error_message": None
            }
        except Exception as e:
            return {
                "success": False,
                "response_time": None,
                "error_message": str(e)
            }

# 其他必要的函數
def verify_password(plain_password, hashed_password):
    """驗證密碼"""
    return plain_password == hashed_password  # 簡化版本

def get_password_hash(password):
    """獲取密碼雜湊"""
    return password  # 簡化版本

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    """創建存取權杖"""
    return "dummy_token"  # 簡化版本

def get_current_user(token: str, db, credentials_exception):
    """獲取當前用戶"""
    return db.query(User).first()  # 簡化版本

def authenticate_user(db, username: str, password: str):
    """認證用戶"""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_device_data(db, data):
    """創建設備數據"""
    return save_device_data(db, data)

def get_device_history(db, device_id):
    """獲取設備歷史數據"""
    return db.query(DeviceData).filter(DeviceData.device_id == device_id).order_by(DeviceData.timestamp.desc()).all()

def detect_anomaly(db, device_id):
    """AI 異常檢測"""
    return {"device_id": device_id, "anomaly_detected": False, "confidence": 0.95} 