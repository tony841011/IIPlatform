from pydantic import BaseModel
import datetime
from typing import Optional, List, Dict, Any

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
    last_heartbeat: Optional[datetime.datetime] = None
    battery_level: Optional[float] = None
    temperature: Optional[float] = None
    is_registered: Optional[bool] = None
    registration_date: Optional[datetime.datetime] = None
    api_key: Optional[str] = None
    class Config:
        orm_mode = True

class DeviceData(BaseModel):
    device_id: int
    value: float
    timestamp: datetime.datetime = None

class AlertBase(BaseModel):
    device_id: int
    value: float
    timestamp: datetime.datetime = None
    message: str

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    email: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    last_login: Optional[datetime.datetime] = None
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class DeviceGroupBase(BaseModel):
    name: str

class DeviceGroupCreate(DeviceGroupBase):
    pass

class DeviceGroupOut(DeviceGroupBase):
    id: int
    class Config:
        orm_mode = True

class DeviceUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    group: int | None = None
    tags: str | None = None
    device_type: str | None = None
    status: str | None = None

# 角色權限相關
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class RoleCreate(RoleBase):
    pass

class RoleOut(RoleBase):
    id: int
    class Config:
        orm_mode = True

# OTA 更新相關
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
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class OTAUpdateBase(BaseModel):
    device_id: int
    firmware_id: int

class OTAUpdateCreate(OTAUpdateBase):
    pass

class OTAUpdateOut(OTAUpdateBase):
    id: int
    status: str
    started_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    error_message: Optional[str] = None
    class Config:
        orm_mode = True

# 規則引擎相關
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
    created_at: datetime.datetime
    class Config:
        orm_mode = True

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
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class WorkflowExecutionBase(BaseModel):
    workflow_id: int

class WorkflowExecutionCreate(WorkflowExecutionBase):
    pass

class WorkflowExecutionOut(WorkflowExecutionBase):
    id: int
    status: str
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    result: Optional[Dict[str, Any]] = None
    class Config:
        orm_mode = True

# 審計日誌
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
    timestamp: datetime.datetime
    class Config:
        orm_mode = True

# 設備控制命令
class DeviceCommandBase(BaseModel):
    device_id: int
    command_type: str
    parameters: Dict[str, Any]

class DeviceCommandCreate(DeviceCommandBase):
    pass

class DeviceCommandOut(DeviceCommandBase):
    id: int
    status: str
    sent_at: datetime.datetime
    acknowledged_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    result: Optional[Dict[str, Any]] = None
    sent_by: int
    class Config:
        orm_mode = True

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
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

# 通訊協定測試
class ProtocolTest(BaseModel):
    device_id: int
    protocol_type: str
    test_data: Dict[str, Any] 

# 資料庫連線相關
class DatabaseConnectionBase(BaseModel):
    name: str
    db_type: str  # sqlite, mysql, postgresql, oracle, mssql
    host: Optional[str] = None
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    connection_string: str
    is_active: bool = True
    is_default: bool = False

class DatabaseConnectionCreate(DatabaseConnectionBase):
    pass

class DatabaseConnectionUpdate(DatabaseConnectionBase):
    pass

class DatabaseConnectionOut(DatabaseConnectionBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# 資料表配置相關
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
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# 資料表欄位配置相關
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
    created_at: datetime.datetime
    class Config:
        orm_mode = True

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
    tested_at: datetime.datetime
    tested_by: Optional[int] = None
    class Config:
        orm_mode = True

# 資料庫連線測試請求
class DatabaseConnectionTestRequest(BaseModel):
    connection_id: int 

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

# 在檔案末尾新增以下 GPU 監測相關的 schemas

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
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 監測相關
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
    timestamp: datetime.datetime
    class Config:
        orm_mode = True

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
    started_at: datetime.datetime
    ended_at: Optional[datetime.datetime] = None
    created_by: int
    class Config:
        orm_mode = True

# GPU 警報相關
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
    acknowledged_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 效能設定相關
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
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        orm_mode = True

# GPU 資源使用統計
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