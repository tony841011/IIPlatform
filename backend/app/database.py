from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .models import Device, DeviceData, User, Alert

SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_device(db, device):
    db_device = Device(name=device.name, location=device.location)
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db):
    return db.query(Device).all()

def save_device_data(db, data):
    db_data = DeviceData(device_id=data.device_id, value=data.value, timestamp=data.timestamp)
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def get_user_by_username(db, username):
    return db.query(User).filter(User.username == username).first()

def create_user(db, user):
    db_user = User(username=user.username, hashed_password=user.hashed_password, role=user.role if hasattr(user, 'role') else 'user')
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user 

def create_alert(db, alert):
    db_alert = Alert(device_id=alert.device_id, value=alert.value, timestamp=alert.timestamp, message=alert.message)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_alerts(db, device_id=None):
    q = db.query(Alert)
    if device_id:
        q = q.filter(Alert.device_id == device_id)
    return q.order_by(Alert.timestamp.desc()).all() 

def create_device_group(db, group):
    db_group = models.DeviceGroup(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_device_groups(db):
    return db.query(models.DeviceGroup).all()

def update_device(db, device_id, update):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device 