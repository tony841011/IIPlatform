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