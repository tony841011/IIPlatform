from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import (
    Device, DeviceData, User, Alert, Base, DeviceGroup, Role, 
    Firmware, OTAUpdate, Rule, Workflow, WorkflowExecution, 
    AuditLog, DeviceCommand, CommunicationProtocol, MQTTConfig, 
    ModbusTCPConfig, OPCUAConfig
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
    from models import DeviceGroup
    db_group = DeviceGroup(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_device_groups(db):
    from models import DeviceGroup
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
    """創建設備控制命令"""
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
    """獲取設備命令"""
    q = db.query(DeviceCommand)
    if device_id:
        q = q.filter(DeviceCommand.device_id == device_id)
    return q.order_by(DeviceCommand.sent_at.desc()).all()

# OTA 更新
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
    """獲取韌體列表"""
    q = db.query(Firmware).filter(Firmware.is_active == True)
    if device_type:
        q = q.filter(Firmware.device_type == device_type)
    return q.all()

def create_ota_update(db, ota_update):
    """創建 OTA 更新任務"""
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
    """獲取 OTA 更新列表"""
    q = db.query(OTAUpdate)
    if device_id:
        q = q.filter(OTAUpdate.device_id == device_id)
    return q.order_by(OTAUpdate.started_at.desc()).all()

# 規則引擎
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
    """獲取規則列表"""
    return db.query(Rule).filter(Rule.is_active == True).all()

def evaluate_rule(db, rule, device_data):
    """評估規則條件"""
    # 這裡實現規則評估邏輯
    conditions = rule.conditions
    # 簡單的條件評估示例
    if "temperature" in conditions:
        if device_data.get("temperature", 0) > conditions["temperature"]:
            return True
    return False

# 工作流程
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
    """獲取工作流程列表"""
    return db.query(Workflow).filter(Workflow.is_active == True).all()

def create_workflow_execution(db, workflow_id):
    """創建工作流程執行"""
    db_execution = WorkflowExecution(
        workflow_id=workflow_id,
        status="running"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution

# 審計日誌
def create_audit_log(db, audit_log, user_id=None):
    """創建審計日誌"""
    db_log = AuditLog(
        user_id=user_id,
        action=audit_log.action,
        resource_type=audit_log.resource_type,
        resource_id=audit_log.resource_id,
        details=audit_log.details,
        ip_address=audit_log.ip_address,
        user_agent=audit_log.user_agent
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_audit_logs(db, user_id=None, resource_type=None, limit=100):
    """獲取審計日誌"""
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()

# 角色權限
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
    """獲取角色列表"""
    return db.query(Role).all()

def check_permission(db, user_id, resource_type, resource_id, action):
    """檢查用戶權限"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    # 管理員擁有所有權限
    if user.role == "admin":
        return True
    
    # 這裡可以實現更複雜的權限檢查邏輯
    return True

# 通訊協定相關
def create_communication_protocol(db, protocol):
    """創建通訊協定配置"""
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
    """獲取通訊協定配置"""
    q = db.query(CommunicationProtocol)
    if device_id:
        q = q.filter(CommunicationProtocol.device_id == device_id)
    return q.all()

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
    """獲取 MQTT 配置"""
    q = db.query(MQTTConfig)
    if device_id:
        q = q.filter(MQTTConfig.device_id == device_id)
    return q.all()

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
    """獲取 Modbus TCP 配置"""
    q = db.query(ModbusTCPConfig)
    if device_id:
        q = q.filter(ModbusTCPConfig.device_id == device_id)
    return q.all()

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
    """獲取 OPC UA 配置"""
    q = db.query(OPCUAConfig)
    if device_id:
        q = q.filter(OPCUAConfig.device_id == device_id)
    return q.all() 

# 在檔案末尾新增使用者行為分析相關模型

# 使用者行為分析
class UserBehavior(Base):
    __tablename__ = "user_behaviors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String)  # 會話 ID
    page_path = Column(String)  # 頁面路徑
    page_name = Column(String)  # 頁面名稱
    action_type = Column(String)  # 動作類型 (view, click, submit, etc.)
    action_details = Column(JSON)  # 動作詳細資訊
    duration = Column(Integer, nullable=True)  # 停留時間 (秒)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String)
    user_agent = Column(String)
    referrer = Column(String, nullable=True)  # 來源頁面

# 使用者會話
class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String, unique=True)
    login_time = Column(DateTime, default=datetime.datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # 會話持續時間 (秒)
    ip_address = Column(String)
    user_agent = Column(String)
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime, default=datetime.datetime.utcnow)

# 功能使用統計
class FeatureUsage(Base):
    __tablename__ = "feature_usage"
    id = Column(Integer, primary_key=True, index=True)
    feature_name = Column(String)  # 功能名稱
    feature_path = Column(String)  # 功能路徑
    user_id = Column(Integer, ForeignKey("users.id"))
    usage_count = Column(Integer, default=1)  # 使用次數
    total_duration = Column(Integer, default=0)  # 總使用時間 (秒)
    first_used = Column(DateTime, default=datetime.datetime.utcnow)
    last_used = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 開發者平台相關模型

# API Token 管理
class APIToken(Base):
    __tablename__ = "api_tokens"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Token 名稱
    token_hash = Column(String, unique=True)  # Token 雜湊值
    user_id = Column(Integer, ForeignKey("users.id"))
    permissions = Column(JSON)  # 權限列表
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # 過期時間
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Webhook 管理
class Webhook(Base):
    __tablename__ = "webhooks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Webhook 名稱
    url = Column(String)  # 目標 URL
    events = Column(JSON)  # 觸發事件列表
    headers = Column(JSON)  # 自定義標頭
    is_active = Column(Boolean, default=True)
    secret_key = Column(String)  # 簽名密鑰
    retry_count = Column(Integer, default=3)  # 重試次數
    timeout = Column(Integer, default=30)  # 超時時間 (秒)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Webhook 發送歷史
class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    id = Column(Integer, primary_key=True, index=True)
    webhook_id = Column(Integer, ForeignKey("webhooks.id"))
    event_type = Column(String)  # 事件類型
    payload = Column(JSON)  # 發送內容
    response_status = Column(Integer)  # 回應狀態碼
    response_body = Column(String)  # 回應內容
    response_time = Column(Float)  # 回應時間 (秒)
    is_success = Column(Boolean)  # 是否成功
    error_message = Column(String, nullable=True)  # 錯誤訊息
    retry_count = Column(Integer, default=0)  # 重試次數
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

# API 使用統計
class APIUsage(Base):
    __tablename__ = "api_usage"
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("api_tokens.id"))
    endpoint = Column(String)  # API 端點
    method = Column(String)  # HTTP 方法
    status_code = Column(Integer)  # 狀態碼
    response_time = Column(Float)  # 回應時間 (秒)
    request_size = Column(Integer)  # 請求大小 (bytes)
    response_size = Column(Integer)  # 回應大小 (bytes)
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# SDK 下載統計
class SDKDownload(Base):
    __tablename__ = "sdk_downloads"
    id = Column(Integer, primary_key=True, index=True)
    sdk_name = Column(String)  # SDK 名稱 (python, javascript, go)
    version = Column(String)  # 版本號
    download_count = Column(Integer, default=1)  # 下載次數
    ip_address = Column(String)
    user_agent = Column(String)
    downloaded_at = Column(DateTime, default=datetime.datetime.utcnow)

# API 文檔版本
class APIDocumentation(Base):
    __tablename__ = "api_documentation"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String)  # 文檔版本
    title = Column(String)  # 標題
    description = Column(String)  # 描述
    content = Column(JSON)  # 文檔內容 (OpenAPI 格式)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # 是否為預設版本
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow) 