from sqlalchemy import Column, Integer, String, Float, DateTime, Table, ForeignKey, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

# 在檔案開頭新增權限相關的模型

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

# 更新 Role 模型
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

# 更新 User 模型
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

# 用戶設備權限關聯表
user_device_permissions = Table('user_device_permissions', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('device_id', Integer, ForeignKey('devices.id')),
    Column('permission', String)  # read, write, control
)

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

# 在檔案末尾新增功能頁面分類相關模型

# 功能頁面分類
class PageCategory(Base):
    __tablename__ = "page_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 分類名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    icon = Column(String)  # 圖示
    color = Column(String)  # 顏色
    order_index = Column(Integer, default=0)  # 排序索引
    is_active = Column(Boolean, default=True)  # 是否啟用
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 功能頁面
class Page(Base):
    __tablename__ = "pages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)  # 頁面名稱
    display_name = Column(String)  # 顯示名稱
    description = Column(String)  # 描述
    path = Column(String)  # 路由路徑
    component = Column(String)  # 組件名稱
    icon = Column(String)  # 圖示
    category_id = Column(Integer, ForeignKey("page_categories.id"))  # 分類
    required_permission = Column(String)  # 所需權限
    is_active = Column(Boolean, default=True)  # 是否啟用
    is_system = Column(Boolean, default=False)  # 是否為系統頁面
    order_index = Column(Integer, default=0)  # 排序索引
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 角色頁面權限
class RolePagePermission(Base):
    __tablename__ = "role_page_permissions"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    page_id = Column(Integer, ForeignKey("pages.id"))
    can_access = Column(Boolean, default=True)  # 是否可以訪問
    can_edit = Column(Boolean, default=False)  # 是否可以編輯
    granted_by = Column(Integer, ForeignKey("users.id"))  # 授權者
    granted_at = Column(DateTime, default=datetime.datetime.utcnow) 

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