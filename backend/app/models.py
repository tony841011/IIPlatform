from sqlalchemy import Column, Integer, String, Float, DateTime, Table, ForeignKey, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
import datetime

Base = declarative_base()

# 權限分類
class PermissionCategory(Base):
    __tablename__ = "permission_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 分類名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    icon = Column(String)  # 圖示
    order_index = Column(Integer, default=0)  # 排序索引
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 權限定義
class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 權限名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    category_id = Column(Integer, ForeignKey("permission_categories.id"))  # 權限分類
    resource_type = Column(String)  # 資源類型 (device, user, rule, etc.)
    action = Column(String)  # 動作 (create, read, update, delete, control)
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 角色權限關聯
class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    permission_id = Column(Integer, ForeignKey("permissions.id"))
    granted = Column(Boolean, default=True)  # 是否授權
    granted_by = Column(Integer, ForeignKey("users.id"))  # 授權者
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

# 用戶權限關聯（覆蓋角色權限）
class UserPermission(Base):
    __tablename__ = "user_permissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    permission_id = Column(Integer, ForeignKey("permissions.id"))
    granted = Column(Boolean, default=True)  # 是否授權
    granted_by = Column(Integer, ForeignKey("users.id"))  # 授權者
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

# 角色
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 角色名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    level = Column(Integer, default=0)  # 角色等級 (0=最低, 999=最高)
    is_system = Column(Boolean, default=False)  # 是否為系統角色
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 用戶
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    display_name = Column(String)  # 顯示名稱
    hashed_password = Column(String)
    email = Column(String)
    phone = Column(String, nullable=True)  # 電話
    department = Column(String, nullable=True)  # 部門
    position = Column(String, nullable=True)  # 職位
    role_id = Column(Integer, ForeignKey("roles.id"))  # 主要角色
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)  # 超級管理員
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 用戶多角色關聯
class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_primary = Column(Boolean, default=False)  # 是否為主要角色
    assigned_by = Column(Integer, ForeignKey("users.id"))  # 分配者
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

# 資源權限（細粒度權限控制）
class ResourcePermission(Base):
    __tablename__ = "resource_permissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resource_type = Column(String)  # 資源類型
    resource_id = Column(Integer)  # 資源 ID
    permission = Column(String)  # 權限 (read, write, delete, control)
    granted = Column(Boolean, default=True)  # 是否授權
    granted_by = Column(Integer, ForeignKey("users.id"))  # 授權者
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

# 頁面分類
class PageCategory(Base):
    __tablename__ = "page_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 分類名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    icon = Column(String)  # 圖示
    order_index = Column(Integer, default=0)  # 排序索引
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 頁面
class Page(Base):
    __tablename__ = "pages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 頁面名稱
    display_name = Column(String)  # 顯示名稱
    path = Column(String)  # 路由路徑
    category_id = Column(Integer, ForeignKey("page_categories.id"))  # 頁面分類
    icon = Column(String)  # 圖示
    order_index = Column(Integer, default=0)  # 排序索引
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 角色頁面權限
class RolePagePermission(Base):
    __tablename__ = "role_page_permissions"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    page_id = Column(Integer, ForeignKey("pages.id"))
    granted = Column(Boolean, default=True)  # 是否授權
    granted_by = Column(Integer, ForeignKey("users.id"))  # 授權者
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

# 設備
class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    group = Column(Integer, ForeignKey("device_groups.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("device_categories.id"), nullable=True)  # 新增類別關聯
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
    
    # 關聯
    category = relationship("DeviceCategory", back_populates="devices")

# 設備數據
class DeviceData(Base):
    __tablename__ = "device_data"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# 告警
class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    message = Column(String)

# 設備群組
class DeviceGroup(Base):
    __tablename__ = "device_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

# 韌體
class Firmware(Base):
    __tablename__ = "firmwares"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, unique=True)
    description = Column(String)
    file_path = Column(String)
    device_type = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# OTA 更新
class OTAUpdate(Base):
    __tablename__ = "ota_updates"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    firmware_id = Column(Integer)
    status = Column(String)  # pending, in_progress, completed, failed
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(String, nullable=True)

# 規則
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

# 工作流程
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

# 工作流程執行
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

# 設備命令
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

# 通訊協定
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

# 資料庫連線
class DatabaseConnection(Base):
    __tablename__ = "database_connections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    db_type = Column(String(50), nullable=False)  # sqlite, mysql, postgresql, oracle, mssql, mongodb
    host = Column(String(255))
    port = Column(Integer)
    database = Column(String(100), nullable=False)
    username = Column(String(100))
    password = Column(String(255))
    connection_string = Column(Text)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_test_time = Column(DateTime)
    last_test_result = Column(String(50))  # success, failed
    last_test_error = Column(Text)
    response_time = Column(Float)  # 連線測試響應時間（秒）
    description = Column(Text)
    
    # MongoDB 特定欄位
    auth_source = Column(String(50))  # MongoDB 認證資料庫
    auth_mechanism = Column(String(50))  # MongoDB 認證機制
    replica_set = Column(String(100))  # MongoDB 複製集名稱
    ssl_enabled = Column(Boolean, default=False)  # MongoDB SSL 連線
    ssl_cert_reqs = Column(String(50))  # MongoDB SSL 憑證要求
    max_pool_size = Column(Integer, default=100)  # MongoDB 連線池大小
    min_pool_size = Column(Integer, default=0)  # MongoDB 最小連線池大小
    max_idle_time_ms = Column(Integer, default=30000)  # MongoDB 最大閒置時間
    server_selection_timeout_ms = Column(Integer, default=30000)  # MongoDB 伺服器選擇超時
    socket_timeout_ms = Column(Integer, default=20000)  # MongoDB Socket 超時
    connect_timeout_ms = Column(Integer, default=20000)  # MongoDB 連線超時
    retry_writes = Column(Boolean, default=True)  # MongoDB 重試寫入
    retry_reads = Column(Boolean, default=True)  # MongoDB 重試讀取
    read_preference = Column(String(50))  # MongoDB 讀取偏好
    write_concern = Column(String(50))  # MongoDB 寫入關注
    read_concern = Column(String(50))  # MongoDB 讀取關注
    journal = Column(Boolean, default=True)  # MongoDB 日誌寫入
    wtimeout = Column(Integer)  # MongoDB 寫入超時
    w = Column(String(50))  # MongoDB 寫入確認
    j = Column(Boolean, default=True)  # MongoDB 日誌確認
    fsync = Column(Boolean, default=False)  # MongoDB 檔案同步
    direct_connection = Column(Boolean, default=False)  # MongoDB 直接連線
    app_name = Column(String(100))  # MongoDB 應用程式名稱
    compressors = Column(String(100))  # MongoDB 壓縮器
    zlib_compression_level = Column(Integer)  # MongoDB Zlib 壓縮等級
    uuid_representation = Column(String(50))  # MongoDB UUID 表示
    unicode_decode_error_handler = Column(String(50))  # MongoDB Unicode 解碼錯誤處理
    tz_aware = Column(Boolean, default=False)  # MongoDB 時區感知
    connect = Column(Boolean, default=True)  # MongoDB 連線時機
    max_connecting = Column(Integer)  # MongoDB 最大連線數
    load_balanced = Column(Boolean, default=False)  # MongoDB 負載平衡
    server_api = Column(String(50))  # MongoDB 伺服器 API 版本
    heartbeat_frequency_ms = Column(Integer)  # MongoDB 心跳頻率
    local_threshold_ms = Column(Integer)  # MongoDB 本地閾值

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

# API Token
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

# Webhook
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

# Webhook 發送記錄
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

# API 文檔
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

# 設備類別
class DeviceCategory(Base):
    __tablename__ = "device_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # 類別名稱
    display_name = Column(String(200), nullable=False)  # 顯示名稱
    description = Column(Text)  # 描述
    icon = Column(String(100))  # 圖示
    color = Column(String(20))  # 顏色代碼
    parent_id = Column(Integer, ForeignKey("device_categories.id"), nullable=True)  # 父類別
    order_index = Column(Integer, default=0)  # 排序索引
    is_active = Column(Boolean, default=True)  # 是否啟用
    is_system = Column(Boolean, default=False)  # 是否為系統類別
    created_by = Column(Integer, ForeignKey("users.id"))  # 創建者
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # 關聯
    children = relationship("DeviceCategory", backref=backref("parent", remote_side=[id]))
    devices = relationship("Device", back_populates="category")