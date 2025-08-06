from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# 設備相關
class DeviceBase(BaseModel):
    name: str
    location: str

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    group: Optional[int] = None
    tags: Optional[str] = None
    device_type: Optional[str] = None
    status: Optional[str] = None
    firmware_version: Optional[str] = None
    last_heartbeat: Optional[datetime] = None
    battery_level: Optional[float] = None
    temperature: Optional[float] = None
    is_registered: Optional[bool] = None
    registration_date: Optional[datetime] = None
    api_key: Optional[str] = None
    class Config:
        from_attributes = True

class DeviceData(BaseModel):
    device_id: int
    value: float
    timestamp: datetime = None

# 告警相關
class AlertBase(BaseModel):
    device_id: int
    value: float
    timestamp: datetime = None
    message: str

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    id: int
    class Config:
        from_attributes = True

# 用戶相關
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    email: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True

# Token 相關
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# 設備群組相關
class DeviceGroupBase(BaseModel):
    name: str

class DeviceGroupCreate(DeviceGroupBase):
    pass

class DeviceGroupOut(DeviceGroupBase):
    id: int
    class Config:
        from_attributes = True

# 設備更新
class DeviceUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    group: int | None = None
    tags: str | None = None
    device_type: str | None = None
    status: str | None = None

# 角色相關
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class RoleCreate(RoleBase):
    pass

class RoleOut(RoleBase):
    id: int
    class Config:
        from_attributes = True

# 韌體相關
class FirmwareBase(BaseModel):
    version: str
    description: Optional[str] = None
    device_type: str

class FirmwareCreate(FirmwareBase):
    pass

class FirmwareOut(FirmwareBase):
    id: int
    file_path: Optional[str] = None
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# OTA 更新相關
class OTAUpdateBase(BaseModel):
    device_id: int
    firmware_id: int

class OTAUpdateCreate(OTAUpdateBase):
    pass

class OTAUpdateOut(OTAUpdateBase):
    id: int
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    class Config:
        from_attributes = True

# 規則相關
class RuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    conditions: Dict[str, Any]
    actions: Dict[str, Any]

class RuleCreate(RuleBase):
    pass

class RuleOut(RuleBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

# 工作流程相關
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_conditions: Dict[str, Any]
    steps: Dict[str, Any]

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowOut(WorkflowBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

# 工作流程執行相關
class WorkflowExecutionBase(BaseModel):
    workflow_id: int

class WorkflowExecutionCreate(WorkflowExecutionBase):
    pass

class WorkflowExecutionOut(WorkflowExecutionBase):
    id: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

# 審計日誌相關
class AuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogOut(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime
    class Config:
        from_attributes = True

# 設備命令相關
class DeviceCommandBase(BaseModel):
    device_id: int
    command_type: str
    parameters: Dict[str, Any]

class DeviceCommandCreate(DeviceCommandBase):
    pass

class DeviceCommandOut(DeviceCommandBase):
    id: int
    status: str
    sent_at: datetime
    acknowledged_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    sent_by: int
    class Config:
        from_attributes = True

# 設備註冊
class DeviceRegistration(BaseModel):
    device_id: str
    api_key: str
    device_type: str
    firmware_version: str
    capabilities: Dict[str, Any]

# 設備心跳
class DeviceHeartbeat(BaseModel):
    device_id: int
    battery_level: Optional[float] = None
    temperature: Optional[float] = None
    status: str

# 權限檢查
class PermissionCheck(BaseModel):
    user_id: int
    resource_type: str
    resource_id: int
    action: str

# 通訊協定相關
class CommunicationProtocolBase(BaseModel):
    device_id: int
    protocol_type: str  # mqtt, restful, modbus_tcp, opc_ua
    config: Dict[str, Any]

class CommunicationProtocolCreate(CommunicationProtocolBase):
    pass

class CommunicationProtocolOut(CommunicationProtocolBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# MQTT 配置
class MQTTConfigBase(BaseModel):
    device_id: int
    broker_url: str
    broker_port: int = 1883
    username: Optional[str] = None
    password: Optional[str] = None
    topic_prefix: str
    qos_level: int = 1
    keep_alive: int = 60
    is_ssl: bool = False

class MQTTConfigCreate(MQTTConfigBase):
    pass

class MQTTConfigOut(MQTTConfigBase):
    id: int
    class Config:
        from_attributes = True

# Modbus TCP 配置
class ModbusTCPConfigBase(BaseModel):
    device_id: int
    host: str
    port: int = 502
    unit_id: int = 1
    timeout: int = 10
    retries: int = 3

class ModbusTCPConfigCreate(ModbusTCPConfigBase):
    pass

class ModbusTCPConfigOut(ModbusTCPConfigBase):
    id: int
    class Config:
        from_attributes = True

# OPC UA 配置
class OPCUAConfigBase(BaseModel):
    device_id: int
    server_url: str
    namespace: str = "2"
    node_id: str
    username: Optional[str] = None
    password: Optional[str] = None
    security_policy: str = "Basic256Sha256"
    message_security_mode: str = "SignAndEncrypt"

class OPCUAConfigCreate(OPCUAConfigBase):
    pass

class OPCUAConfigOut(OPCUAConfigBase):
    id: int
    class Config:
        from_attributes = True

# 協定測試
class ProtocolTest(BaseModel):
    device_id: int
    protocol_type: str
    test_data: Dict[str, Any]

# 資料庫連線相關
class DatabaseConnectionBase(BaseModel):
    name: str
    db_type: str  # sqlite, mysql, postgresql, oracle, mssql, mongodb
    host: Optional[str] = None
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    connection_string: str
    is_active: bool = True
    is_default: bool = False
    description: Optional[str] = None  # 添加 description 欄位
    # MongoDB 特定欄位
    auth_source: Optional[str] = None  # MongoDB 認證資料庫
    auth_mechanism: Optional[str] = None  # MongoDB 認證機制
    replica_set: Optional[str] = None  # MongoDB 複製集名稱
    ssl_enabled: bool = False  # MongoDB SSL 連線
    ssl_cert_reqs: Optional[str] = None  # MongoDB SSL 憑證要求
    max_pool_size: Optional[int] = None  # MongoDB 連線池大小
    min_pool_size: Optional[int] = None  # MongoDB 最小連線池大小
    max_idle_time_ms: Optional[int] = None  # MongoDB 最大閒置時間
    server_selection_timeout_ms: Optional[int] = None  # MongoDB 伺服器選擇超時
    socket_timeout_ms: Optional[int] = None  # MongoDB Socket 超時
    connect_timeout_ms: Optional[int] = None  # MongoDB 連線超時
    retry_writes: bool = True  # MongoDB 重試寫入
    retry_reads: bool = True  # MongoDB 重試讀取
    read_preference: Optional[str] = None  # MongoDB 讀取偏好
    write_concern: Optional[str] = None  # MongoDB 寫入關注
    read_concern: Optional[str] = None  # MongoDB 讀取關注
    journal: bool = True  # MongoDB 日誌寫入
    wtimeout: Optional[int] = None  # MongoDB 寫入超時
    w: Optional[str] = None  # MongoDB 寫入確認
    j: bool = True  # MongoDB 日誌確認
    fsync: bool = False  # MongoDB 檔案同步
    direct_connection: bool = False  # MongoDB 直接連線
    app_name: Optional[str] = None  # MongoDB 應用程式名稱
    compressors: Optional[str] = None  # MongoDB 壓縮器
    zlib_compression_level: Optional[int] = None  # MongoDB Zlib 壓縮等級
    uuid_representation: Optional[str] = None  # MongoDB UUID 表示
    unicode_decode_error_handler: Optional[str] = None  # MongoDB Unicode 解碼錯誤處理
    tz_aware: bool = False  # MongoDB 時區感知
    connect: bool = True  # MongoDB 連線時機
    max_connecting: Optional[int] = None  # MongoDB 最大連線數
    load_balanced: bool = False  # MongoDB 負載平衡
    server_api: Optional[str] = None  # MongoDB 伺服器 API 版本
    heartbeat_frequency_ms: Optional[int] = None  # MongoDB 心跳頻率
    local_threshold_ms: Optional[int] = None  # MongoDB 本地閾值

class DatabaseConnectionCreate(DatabaseConnectionBase):
    pass

class DatabaseConnectionUpdate(DatabaseConnectionBase):
    pass

class DatabaseConnectionOut(DatabaseConnectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_test_time: Optional[datetime] = None
    last_test_result: Optional[str] = None
    last_test_error: Optional[str] = None
    response_time: Optional[float] = None
    class Config:
        from_attributes = True

# 表格結構相關
class TableSchemaBase(BaseModel):
    table_name: str
    display_name: str
    description: Optional[str] = None
    db_connection_id: int
    schema_definition: Dict[str, Any]
    is_active: bool = True

class TableSchemaCreate(TableSchemaBase):
    pass

class TableSchemaUpdate(TableSchemaBase):
    pass

class TableSchemaOut(TableSchemaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# 表格欄位相關
class TableColumnBase(BaseModel):
    table_id: int
    column_name: str
    display_name: str
    data_type: str
    length: Optional[int] = None
    is_nullable: bool = True
    is_primary_key: bool = False
    is_index: bool = False
    default_value: Optional[str] = None
    description: Optional[str] = None
    order_index: int = 0

class TableColumnCreate(TableColumnBase):
    pass

class TableColumnUpdate(TableColumnBase):
    pass

class TableColumnOut(TableColumnBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# 資料庫連線測試相關
class DatabaseConnectionTestBase(BaseModel):
    connection_id: int
    test_result: str
    error_message: Optional[str] = None
    response_time: Optional[float] = None

class DatabaseConnectionTestCreate(DatabaseConnectionTestBase):
    pass

class DatabaseConnectionTestOut(DatabaseConnectionTestBase):
    id: int
    tested_at: datetime
    tested_by: Optional[int] = None
    class Config:
        from_attributes = True

class DatabaseConnectionTestRequest(BaseModel):
    connection_id: int

# AI 模型相關
class AIModelBase(BaseModel):
    name: str
    model_type: str  # isolation_forest, autoencoder, lstm, etc.
    device_id: int
    configuration: Dict[str, Any]  # 改名為 configuration 避免與 Pydantic 保留字衝突
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
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

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
    created_at: datetime
    class Config:
        from_attributes = True

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
    training_start: datetime
    training_end: Optional[datetime] = None
    training_duration: Optional[float] = None
    final_accuracy: Optional[float] = None
    final_loss: Optional[float] = None
    training_logs: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

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
    detection_time: datetime
    class Config:
        from_attributes = True

# 異常告警相關
class AnomalyAlertBase(BaseModel):
    detection_id: int
    alert_level: str
    alert_message: str
    is_acknowledged: bool = False

class AnomalyAlertCreate(AnomalyAlertBase):
    pass

class AnomalyAlertUpdate(AnomalyAlertBase):
    is_acknowledged: bool = False

class AnomalyAlertOut(AnomalyAlertBase):
    id: int
    is_acknowledged: bool
    acknowledged_by: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

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
    created_at: datetime
    class Config:
        from_attributes = True

# 模型操作相關
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
    created_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

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
    deployed_at: Optional[datetime] = None
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

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
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# GPU 監控相關
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
    timestamp: datetime
    class Config:
        from_attributes = True

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
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_by: int
    class Config:
        from_attributes = True

# GPU 告警相關
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
    acknowledged_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# GPU 效能配置相關
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
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# GPU 資源使用
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

# 使用者行為分析相關
class UserBehaviorBase(BaseModel):
    user_id: int
    session_id: str
    page_path: str
    page_name: str
    action_type: str
    action_details: Optional[Dict[str, Any]] = None
    duration: Optional[int] = None
    ip_address: str
    user_agent: str
    referrer: Optional[str] = None

class UserBehaviorCreate(UserBehaviorBase):
    pass

class UserBehaviorOut(UserBehaviorBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class UserSessionBase(BaseModel):
    user_id: int
    session_id: str
    login_time: datetime
    logout_time: Optional[datetime] = None
    duration: Optional[int] = None
    ip_address: str
    user_agent: str
    is_active: bool = True
    last_activity: datetime

class UserSessionCreate(UserSessionBase):
    pass

class UserSessionOut(UserSessionBase):
    id: int
    class Config:
        from_attributes = True

class FeatureUsageBase(BaseModel):
    feature_name: str
    feature_path: str
    user_id: int
    usage_count: int = 1
    total_duration: int = 0
    first_used: datetime
    last_used: datetime

class FeatureUsageCreate(FeatureUsageBase):
    pass

class FeatureUsageOut(FeatureUsageBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# 開發者入口相關
class APITokenBase(BaseModel):
    name: str
    user_id: int
    permissions: List[str]
    is_active: bool = True
    expires_at: Optional[datetime] = None

class APITokenCreate(APITokenBase):
    pass

class APITokenOut(APITokenBase):
    id: int
    token_hash: str
    last_used: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class WebhookBase(BaseModel):
    name: str
    url: str
    events: List[str]
    headers: Optional[Dict[str, str]] = None
    is_active: bool = True
    secret_key: str
    retry_count: int = 3
    timeout: int = 30
    created_by: int

class WebhookCreate(WebhookBase):
    pass

class WebhookOut(WebhookBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class WebhookDeliveryBase(BaseModel):
    webhook_id: int
    event_type: str
    payload: Dict[str, Any]
    response_status: int
    response_body: str
    response_time: float
    is_success: bool
    error_message: Optional[str] = None
    retry_count: int = 0

class WebhookDeliveryCreate(WebhookDeliveryBase):
    pass

class WebhookDeliveryOut(WebhookDeliveryBase):
    id: int
    sent_at: datetime
    class Config:
        from_attributes = True

class APIUsageBase(BaseModel):
    token_id: int
    endpoint: str
    method: str
    status_code: int
    response_time: float
    request_size: int
    response_size: int
    ip_address: str
    user_agent: str

class APIUsageCreate(APIUsageBase):
    pass

class APIUsageOut(APIUsageBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class SDKDownloadBase(BaseModel):
    sdk_name: str
    version: str
    download_count: int = 1
    ip_address: str
    user_agent: str

class SDKDownloadCreate(SDKDownloadBase):
    pass

class SDKDownloadOut(SDKDownloadBase):
    id: int
    downloaded_at: datetime
    class Config:
        from_attributes = True

class APIDocumentationBase(BaseModel):
    version: str
    title: str
    description: str
    content: Dict[str, Any]
    is_active: bool = True
    is_default: bool = False
    created_by: int

class APIDocumentationCreate(APIDocumentationBase):
    pass

class APIDocumentationOut(APIDocumentationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# 統計資料
class UsageAnalytics(BaseModel):
    total_users: int
    active_users_today: int
    active_users_week: int
    active_users_month: int
    total_sessions: int
    avg_session_duration: float
    most_used_features: List[Dict[str, Any]]
    user_activity_timeline: List[Dict[str, Any]]

class DeveloperPortalStats(BaseModel):
    total_tokens: int
    active_tokens: int
    total_webhooks: int
    active_webhooks: int
    api_calls_today: int
    api_calls_week: int 

# ONVIF 相關 Schema
class ONVIFDiscoveryRequest(BaseModel):
    network_interface: Optional[str] = None
    timeout: int = 5
    max_devices: int = 10

class ONVIFConfigRequest(BaseModel):
    device_id: int
    ip_address: str
    port: int = 80
    username: Optional[str] = None
    password: Optional[str] = None
    profile: str = "Profile_1"

class ONVIFConnectionTest(BaseModel):
    device_id: int
    test_type: str = "basic"  # basic, advanced, streaming

class ONVIFStreamRequest(BaseModel):
    device_id: int
    stream_type: str = "RTP"  # RTP, RTSP, HTTP
    profile: str = "Profile_1"
    quality: str = "high"  # low, medium, high

class ONVIFPTZControl(BaseModel):
    device_id: int
    action: str  # pan, tilt, zoom, home, preset
    direction: Optional[str] = None  # left, right, up, down, in, out
    speed: float = 1.0
    preset_number: Optional[int] = None

class ONVIFEventConfig(BaseModel):
    device_id: int
    event_types: List[str]  # motion, tampering, audio, etc.
    notification_url: Optional[str] = None
    is_active: bool = True

class ONVIFSnapshotRequest(BaseModel):
    device_id: int
    profile: str = "Profile_1"
    quality: str = "high"
    format: str = "JPEG"  # JPEG, PNG 

# 新增設備類別相關的 Schema
class DeviceCategoryBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None
    order_index: int = 0
    is_active: bool = True

class DeviceCategoryCreate(DeviceCategoryBase):
    pass

class DeviceCategoryUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

# 修復 DeviceCategoryOut 類別
class DeviceCategoryOut(DeviceCategoryBase):
    id: int
    is_system: bool
    created_by: Optional[int]
    created_at: datetime  # 改為 datetime.datetime
    updated_at: datetime  # 改為 datetime.datetime
    children_count: Optional[int] = 0
    devices_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# 更新設備相關的 Schema
class DeviceCreate(BaseModel):
    name: str
    location: str
    category_id: Optional[int] = None
    group: Optional[int] = None
    tags: Optional[str] = ""
    device_type: Optional[str] = None
    firmware_version: Optional[str] = None

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    category_id: Optional[int] = None
    group: Optional[int] = None
    tags: Optional[str] = None
    device_type: Optional[str] = None
    firmware_version: Optional[str] = None
    status: Optional[str] = None

# 同時修復 DeviceOut 類別中的 datetime 問題
class DeviceOut(BaseModel):
    id: int
    name: str
    location: str
    category_id: Optional[int]
    category_name: Optional[str] = None
    group: Optional[int]
    tags: str
    device_type: Optional[str]
    status: str
    firmware_version: Optional[str]
    last_heartbeat: Optional[datetime]  # 改為 datetime.datetime
    battery_level: Optional[float]
    temperature: Optional[float]
    is_registered: bool
    registration_date: Optional[datetime]  # 改為 datetime.datetime
    api_key: Optional[str]
    
    class Config:
        from_attributes = True 