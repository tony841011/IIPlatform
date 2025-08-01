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