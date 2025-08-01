from sqlalchemy import Column, Integer, String, Float, DateTime, Table, ForeignKey, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

# 用戶角色關聯表
user_roles = Table('user_roles', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

# 用戶設備權限關聯表
user_device_permissions = Table('user_device_permissions', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('device_id', Integer, ForeignKey('devices.id')),
    Column('permission', String)  # read, write, control
)

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # admin, operator, viewer
    description = Column(String)
    permissions = Column(JSON)  # 權限列表

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    email = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime)

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    group = Column(Integer, ForeignKey("device_groups.id"), nullable=True)
    tags = Column(String, default="")
    # 設備管理新增欄位
    device_type = Column(String)  # sensor, actuator, controller
    status = Column(String, default="offline")  # online, offline, maintenance
    firmware_version = Column(String)
    last_heartbeat = Column(DateTime)
    battery_level = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    is_registered = Column(Boolean, default=False)
    registration_date = Column(DateTime)
    api_key = Column(String, unique=True)  # 設備API註冊金鑰

class DeviceData(Base):
    __tablename__ = "device_data"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    message = Column(String)

class DeviceGroup(Base):
    __tablename__ = "device_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

# OTA 更新相關
class Firmware(Base):
    __tablename__ = "firmwares"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, unique=True)
    description = Column(String)
    file_path = Column(String)
    device_type = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OTAUpdate(Base):
    __tablename__ = "ota_updates"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    firmware_id = Column(Integer)
    status = Column(String)  # pending, in_progress, completed, failed
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(String, nullable=True)

# 規則引擎相關
class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    conditions = Column(JSON)  # 條件邏輯
    actions = Column(JSON)  # 觸發動作
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 工作流程相關
class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    trigger_type = Column(String)  # event, schedule, manual
    trigger_conditions = Column(JSON)
    steps = Column(JSON)  # 工作流程步驟
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    status = Column(String)  # running, completed, failed
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime)
    result = Column(JSON, nullable=True)

# 審計日誌
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)  # login, logout, create, update, delete, control
    resource_type = Column(String)  # device, user, rule, workflow
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# 設備控制命令
class DeviceCommand(Base):
    __tablename__ = "device_commands"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    command_type = Column(String)  # restart, update_config, control
    parameters = Column(JSON)
    status = Column(String)  # pending, sent, acknowledged, completed, failed
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    result = Column(JSON, nullable=True)
    sent_by = Column(Integer, ForeignKey("users.id"))

# 通訊協定配置
class CommunicationProtocol(Base):
    __tablename__ = "communication_protocols"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    protocol_type = Column(String)  # mqtt, restful, modbus_tcp, opc_ua
    config = Column(JSON)  # 協定特定配置
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# MQTT 配置
class MQTTConfig(Base):
    __tablename__ = "mqtt_configs"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    broker_url = Column(String)
    broker_port = Column(Integer, default=1883)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    topic_prefix = Column(String)
    qos_level = Column(Integer, default=1)
    keep_alive = Column(Integer, default=60)
    is_ssl = Column(Boolean, default=False)

# Modbus TCP 配置
class ModbusTCPConfig(Base):
    __tablename__ = "modbus_tcp_configs"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    host = Column(String)
    port = Column(Integer, default=502)
    unit_id = Column(Integer, default=1)
    timeout = Column(Integer, default=10)
    retries = Column(Integer, default=3)

# OPC UA 配置
class OPCUAConfig(Base):
    __tablename__ = "opc_ua_configs"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    server_url = Column(String)
    namespace = Column(String, default="2")
    node_id = Column(String)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    security_policy = Column(String, default="Basic256Sha256")
    message_security_mode = Column(String, default="SignAndEncrypt") 

# 資料庫連線配置
class DatabaseConnection(Base):
    __tablename__ = "database_connections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 連線名稱
    db_type = Column(String)  # sqlite, mysql, postgresql, oracle, mssql
    host = Column(String, nullable=True)  # 主機地址
    port = Column(Integer, nullable=True)  # 端口
    database = Column(String)  # 資料庫名稱
    username = Column(String, nullable=True)  # 用戶名
    password = Column(String, nullable=True)  # 密碼
    connection_string = Column(String)  # 完整連線字串
    is_active = Column(Boolean, default=True)  # 是否啟用
    is_default = Column(Boolean, default=False)  # 是否為預設連線
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 資料表配置
class TableSchema(Base):
    __tablename__ = "table_schemas"
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, unique=True)  # 資料表名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    db_connection_id = Column(Integer, ForeignKey("database_connections.id"))  # 關聯的資料庫連線
    schema_definition = Column(JSON)  # 資料表結構定義
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 資料表欄位配置
class TableColumn(Base):
    __tablename__ = "table_columns"
    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("table_schemas.id"))  # 關聯的資料表
    column_name = Column(String)  # 欄位名稱
    display_name = Column(String)  # 顯示名稱
    data_type = Column(String)  # 資料類型 (varchar, int, float, datetime, etc.)
    length = Column(Integer, nullable=True)  # 長度
    is_nullable = Column(Boolean, default=True)  # 是否可為空
    is_primary_key = Column(Boolean, default=False)  # 是否為主鍵
    is_index = Column(Boolean, default=False)  # 是否為索引
    default_value = Column(String, nullable=True)  # 預設值
    description = Column(String)  # 描述
    order_index = Column(Integer, default=0)  # 排序索引
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 資料庫連線測試記錄
class DatabaseConnectionTest(Base):
    __tablename__ = "database_connection_tests"
    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("database_connections.id"))
    test_result = Column(String)  # success, failed
    error_message = Column(String, nullable=True)  # 錯誤訊息
    response_time = Column(Float, nullable=True)  # 回應時間 (秒)
    tested_at = Column(DateTime, default=datetime.datetime.utcnow)
    tested_by = Column(Integer, ForeignKey("users.id")) 