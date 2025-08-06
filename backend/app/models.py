from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# 用戶和權限相關
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 關聯
    role = relationship("Role", back_populates="users")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Integer, default=0)
    is_system = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 關聯
    users = relationship("User", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    module = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 關聯
    role_permissions = relationship("RolePermission", back_populates="permission")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 關聯
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="role_permissions")

# 設備相關
class DeviceCategory(Base):
    __tablename__ = "device_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    color = Column(String(20), nullable=True)
    parent_id = Column(Integer, ForeignKey("device_categories.id"), nullable=True)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    device_id = Column(String(100), unique=True, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("device_categories.id"), nullable=True)
    device_type = Column(String(50), nullable=False)
    protocol = Column(String(20), nullable=False)  # mqtt, modbus, opcua
    connection_info = Column(JSON, nullable=True)
    status = Column(String(20), default="offline")  # online, offline, error
    last_seen = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DeviceGroup(Base):
    __tablename__ = "device_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DeviceGroupMember(Base):
    __tablename__ = "device_group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("device_groups.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# 告警和通知相關
class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False)  # info, warning, error, critical
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # email, sms, push, webhook
    status = Column(String(20), default="pending")  # pending, sent, failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 資料庫連線管理
class DatabaseConnection(Base):
    __tablename__ = "database_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    db_type = Column(String(20), nullable=False)  # postgresql, mysql, mongodb, influxdb, oracle, sqlserver
    host = Column(String(100), nullable=True)
    port = Column(Integer, nullable=True)
    database = Column(String(100), nullable=False)
    username = Column(String(100), nullable=True)
    password = Column(String(255), nullable=True)
    connection_string = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    last_test_time = Column(DateTime, nullable=True)
    last_test_result = Column(String(20), nullable=True)  # success, failed
    last_test_error = Column(Text, nullable=True)
    response_time = Column(Float, nullable=True)
    
    # 連線設定
    timeout = Column(Integer, default=30)  # 連線超時時間 (秒)
    retry_attempts = Column(Integer, default=3)  # 重試次數
    connection_pool_size = Column(Integer, default=10)  # 連線池大小
    
    # MongoDB 特定欄位
    auth_source = Column(String(50), nullable=True)  # MongoDB 認證資料庫
    auth_mechanism = Column(String(50), nullable=True)  # MongoDB 認證機制
    replica_set = Column(String(100), nullable=True)  # MongoDB 複製集名稱
    ssl_enabled = Column(Boolean, default=False)  # MongoDB SSL 連線
    ssl_cert_reqs = Column(String(20), nullable=True)  # MongoDB SSL 憑證要求
    max_pool_size = Column(Integer, nullable=True)  # MongoDB 連線池大小
    min_pool_size = Column(Integer, nullable=True)  # MongoDB 最小連線池大小
    max_idle_time_ms = Column(Integer, nullable=True)  # MongoDB 最大閒置時間
    server_selection_timeout_ms = Column(Integer, nullable=True)  # MongoDB 伺服器選擇超時
    socket_timeout_ms = Column(Integer, nullable=True)  # MongoDB Socket 超時
    connect_timeout_ms = Column(Integer, nullable=True)  # MongoDB 連線超時
    retry_writes = Column(Boolean, default=True)  # MongoDB 重試寫入
    retry_reads = Column(Boolean, default=True)  # MongoDB 重試讀取
    read_preference = Column(String(20), nullable=True)  # MongoDB 讀取偏好
    write_concern = Column(String(20), nullable=True)  # MongoDB 寫入關注
    read_concern = Column(String(20), nullable=True)  # MongoDB 讀取關注
    journal = Column(Boolean, default=True)  # MongoDB 日誌寫入
    wtimeout = Column(Integer, nullable=True)  # MongoDB 寫入超時
    w = Column(String(20), nullable=True)  # MongoDB 寫入確認
    j = Column(Boolean, default=True)  # MongoDB 日誌確認
    fsync = Column(Boolean, default=False)  # MongoDB 檔案同步
    direct_connection = Column(Boolean, default=False)  # MongoDB 直接連線
    app_name = Column(String(100), nullable=True)  # MongoDB 應用程式名稱
    compressors = Column(String(100), nullable=True)  # MongoDB 壓縮器
    zlib_compression_level = Column(Integer, nullable=True)  # MongoDB Zlib 壓縮等級
    uuid_representation = Column(String(20), nullable=True)  # MongoDB UUID 表示
    unicode_decode_error_handler = Column(String(20), nullable=True)  # MongoDB Unicode 解碼錯誤處理
    tz_aware = Column(Boolean, default=False)  # MongoDB 時區感知
    connect = Column(Boolean, default=True)  # MongoDB 連線時機
    max_connecting = Column(Integer, nullable=True)  # MongoDB 最大連線數
    load_balanced = Column(Boolean, default=False)  # MongoDB 負載平衡
    server_api = Column(String(20), nullable=True)  # MongoDB 伺服器 API 版本
    heartbeat_frequency_ms = Column(Integer, nullable=True)  # MongoDB 心跳頻率
    local_threshold_ms = Column(Integer, nullable=True)  # MongoDB 本地閾值
    
    # InfluxDB 特定欄位
    token = Column(String(500), nullable=True)  # InfluxDB API Token
    org = Column(String(100), nullable=True)  # InfluxDB 組織
    bucket = Column(String(100), nullable=True)  # InfluxDB 儲存桶
    
    # MySQL 特定欄位
    charset = Column(String(20), default='utf8mb4')  # MySQL 字符集
    collation = Column(String(50), default='utf8mb4_unicode_ci')  # MySQL 排序規則
    autocommit = Column(Boolean, default=True)  # MySQL 自動提交
    sql_mode = Column(String(200), nullable=True)  # MySQL SQL 模式
    
    # Oracle 特定欄位
    service_name = Column(String(100), nullable=True)  # Oracle 服務名稱
    sid = Column(String(100), nullable=True)  # Oracle SID
    tns = Column(String(500), nullable=True)  # Oracle TNS 字串
    
    # SQL Server 特定欄位
    driver = Column(String(50), nullable=True)  # SQL Server 驅動程式
    trusted_connection = Column(Boolean, default=False)  # SQL Server 信任連線
    encrypt = Column(Boolean, default=False)  # SQL Server 加密
    trust_server_certificate = Column(Boolean, default=False)  # SQL Server 信任伺服器憑證
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DatabaseConnectionSettings(Base):
    """資料庫連線設定模型"""
    __tablename__ = "database_connection_settings"

    id = Column(Integer, primary_key=True, index=True)
    db_type = Column(String, nullable=False, index=True)  # postgresql, mongodb, influxdb
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    database = Column(String, nullable=False)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    auto_initialize = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)  # 創建者用戶名

    class Config:
        orm_mode = True

class SystemSettings(Base):
    """系統設定模型"""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    class Config:
        orm_mode = True

# 通訊協定相關
class CommunicationProtocol(Base):
    __tablename__ = "communication_protocols"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    protocol_type = Column(String(20), nullable=False)  # mqtt, modbus, opcua
    host = Column(String(100), nullable=True)
    port = Column(Integer, nullable=True)
    connection_info = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIModel(Base):
    """AI Model 模型"""
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    type = Column(String, nullable=False, index=True)  # llm, vision, audio, multimodal, embedding, custom
    framework = Column(String, nullable=False)  # pytorch, tensorflow, onnx, tensorrt, openvino, custom
    source = Column(String, nullable=False)  # huggingface, openai, anthropic, local, url, custom
    description = Column(Text, nullable=True)
    endpoint = Column(String, nullable=True)
    status = Column(String, default='inactive')  # active, inactive, uploading, error
    size = Column(String, nullable=True)  # 模型大小
    accuracy = Column(Float, nullable=True)  # 準確率
    latency = Column(Integer, nullable=True)  # 延遲 (ms)
    file_path = Column(String, nullable=True)  # 模型文件路徑
    config = Column(JSON, nullable=True)  # 模型配置
    tags = Column(JSON, nullable=True)  # 標籤
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)
    last_used = Column(DateTime, nullable=True)

    class Config:
        orm_mode = True

class AIModelUsage(Base):
    """AI Model 使用記錄"""
    __tablename__ = "ai_model_usage"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    user_id = Column(String, nullable=True)
    request_type = Column(String, nullable=False)  # inference, training, evaluation
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    processing_time = Column(Float, nullable=True)  # 處理時間 (秒)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    class Config:
        orm_mode = True

class AIModelPerformance(Base):
    """AI Model 性能監控"""
    __tablename__ = "ai_model_performance"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    cpu_usage = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    gpu_usage = Column(Float, nullable=True)
    gpu_memory_usage = Column(Float, nullable=True)
    request_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    avg_latency = Column(Float, nullable=True)
    throughput = Column(Float, nullable=True)  # 每秒請求數

    class Config:
        orm_mode = True

class PlatformContent(Base):
    """平台內容管理"""
    __tablename__ = "platform_content"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String, nullable=False, index=True)  # basic, features, modules, quickstart
    content_type = Column(String, nullable=False)  # title, subtitle, description, feature, module
    content_key = Column(String, nullable=False)  # 內容的鍵值
    content_value = Column(Text, nullable=True)  # 文字內容
    content_json = Column(JSON, nullable=True)  # JSON 格式內容
    sort_order = Column(Integer, default=0)  # 排序順序
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)

    class Config:
        orm_mode = True

class PlatformImage(Base):
    """平台圖片管理"""
    __tablename__ = "platform_images"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)  # 實際檔案名稱
    original_filename = Column(String, nullable=False)  # 原始檔案名稱
    file_path = Column(String, nullable=False)  # 檔案路徑
    file_size = Column(Integer, nullable=False)  # 檔案大小 (bytes)
    file_type = Column(String, nullable=False)  # 檔案類型 (MIME)
    alt_text = Column(String, nullable=True)  # 替代文字
    description = Column(Text, nullable=True)  # 圖片描述
    category = Column(String, nullable=False, index=True)  # 圖片分類
    width = Column(Integer, nullable=True)  # 圖片寬度
    height = Column(Integer, nullable=True)  # 圖片高度
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)

    class Config:
        orm_mode = True