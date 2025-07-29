from pydantic import BaseModel
import datetime

class DeviceBase(BaseModel):
    name: str
    location: str

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    class Config:
        orm_mode = True

class DeviceData(BaseModel):
    device_id: int
    value: float
    timestamp: datetime.datetime = None 

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None 

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