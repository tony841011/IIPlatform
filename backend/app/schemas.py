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