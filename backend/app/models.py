from sqlalchemy import Column, Integer, String, Float, DateTime, Table, ForeignKey
from .database import Base
import datetime

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)

class DeviceData(Base):
    __tablename__ = "device_data"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")

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

Device.group = Column(Integer, ForeignKey("device_groups.id"), nullable=True)
Device.tags = Column(String, default="") 