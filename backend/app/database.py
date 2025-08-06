import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import datetime
import uuid
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from urllib.parse import quote_plus
from datetime import timedelta
from sqlalchemy import text
from . import schemas

# 嘗試導入 dotenv，如果失敗則使用預設值
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ python-dotenv 載入成功")
except ImportError:
    print("⚠️  python-dotenv 未安裝，使用預設環境變數")
    # 設定預設環境變數
    os.environ.setdefault('POSTGRES_USER', 'iot_user')
    os.environ.setdefault('POSTGRES_PASSWORD', 'iot_password_2024')
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_PORT', '5432')
    os.environ.setdefault('POSTGRES_DB', 'iot_platform')
    os.environ.setdefault('MONGO_USER', '')
    os.environ.setdefault('MONGO_PASSWORD', '')
    os.environ.setdefault('MONGO_HOST', 'localhost')
    os.environ.setdefault('MONGO_PORT', '27017')
    os.environ.setdefault('MONGO_DB', 'iot_platform')
    os.environ.setdefault('INFLUXDB_URL', 'http://localhost:8086')
    os.environ.setdefault('INFLUXDB_TOKEN', '')
    os.environ.setdefault('INFLUXDB_ORG', 'IIPlatform')
    os.environ.setdefault('INFLUXDB_BUCKET', 'iot_platform')

# 嘗試導入 MongoDB 和 InfluxDB 客戶端
try:
    from pymongo import MongoClient
    MONGODB_AVAILABLE = True
    print("✅ pymongo 載入成功")
except ImportError:
    MONGODB_AVAILABLE = False
    print("⚠️  pymongo 未安裝，MongoDB 功能將不可用")

try:
    from influxdb_client import InfluxDBClient
    INFLUXDB_AVAILABLE = True
    print("✅ influxdb-client 載入成功")
except ImportError:
    INFLUXDB_AVAILABLE = False
    print("⚠️  influxdb-client 未安裝，InfluxDB 功能將不可用")

# PostgreSQL 連線設定
POSTGRES_USER = os.getenv('POSTGRES_USER', 'iot_user')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'iot_password_2024')
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'iot_platform')

# 嘗試建立 PostgreSQL 連線
try:
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    engine = create_engine(DATABASE_URL)
    print("✅ PostgreSQL 連線建立成功")
except Exception as e:
    print(f"❌ PostgreSQL 連線失敗: {e}")
    print("🔄 使用 SQLite 作為備用資料庫...")
    DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 資料庫管理類別
class DatabaseManager:
    def __init__(self):
        self.postgres_engine = engine
        self.mongo_client = None
        self.influx_client = None
        
        # 初始化 MongoDB 連線
        if MONGODB_AVAILABLE:
            try:
                mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017/')
                self.mongo_client = MongoClient(mongo_url)
                self.mongo_db = self.mongo_client.iot_platform
                print("✅ MongoDB 連線建立成功")
            except Exception as e:
                print(f"❌ MongoDB 連線失敗: {e}")
        
        # 初始化 InfluxDB 連線
        if INFLUXDB_AVAILABLE:
            try:
                influx_url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
                influx_token = os.getenv('INFLUXDB_TOKEN', '')
                influx_org = os.getenv('INFLUXDB_ORG', 'IIPlatform')
                self.influx_client = InfluxDBClient(url=influx_url, token=influx_token, org=influx_org)
                print("✅ InfluxDB 連線建立成功")
            except Exception as e:
                print(f"❌ InfluxDB 連線失敗: {e}")
    
    def get_postgres_session(self):
        """取得 PostgreSQL 會話"""
        return SessionLocal()
    
    def get_mongo_db(self):
        """取得 MongoDB 資料庫"""
        if self.mongo_client:
            return self.mongo_client.iot_platform
        return None
    
    def get_influx_client(self):
        """取得 InfluxDB 客戶端"""
        return self.influx_client
    
    def close_connections(self):
        """關閉所有資料庫連線"""
        if self.mongo_client:
            self.mongo_client.close()
        if self.influx_client:
            self.influx_client.close()

# 密碼雜湊相關函數
def get_password_hash(password: str) -> str:
    """生成密碼雜湊"""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證密碼"""
    return get_password_hash(plain_password) == hashed_password

# 測試資料庫連線
def test_database_connections():
    """測試所有資料庫連線"""
    results = {}
    
    # 測試 PostgreSQL
    try:
        db = get_postgres_session()
        db.execute(text("SELECT 1"))
        db.close()
        results['PostgreSQL'] = {'status': 'success', 'message': '連線正常'}
    except Exception as e:
        results['PostgreSQL'] = {'status': 'error', 'message': f'連線失敗: {e}'}
    
    # 測試 MongoDB
    if MONGODB_AVAILABLE and db_manager.mongo_client:
        try:
            db_manager.mongo_client.admin.command('ping')
            results['MongoDB'] = {'status': 'success', 'message': '連線正常'}
        except Exception as e:
            results['MongoDB'] = {'status': 'error', 'message': f'連線失敗: {e}'}
    else:
        results['MongoDB'] = {'status': 'error', 'message': 'MongoDB 客戶端未初始化'}
    
    # 測試 InfluxDB
    if INFLUXDB_AVAILABLE and db_manager.influx_client:
        try:
            health = db_manager.influx_client.health()
            results['InfluxDB'] = {'status': 'success', 'message': '連線正常'}
        except Exception as e:
            results['InfluxDB'] = {'status': 'error', 'message': f'連線失敗: {e}'}
    else:
        results['InfluxDB'] = {'status': 'error', 'message': 'InfluxDB 客戶端未初始化'}
    
    return results

# 設備數據相關函數
def create_device_data(device_id: str, data: dict):
    """創建設備數據"""
    # 儲存到 PostgreSQL
    from .models import Device
    db = get_postgres_session()
    try:
        device = db.query(Device).filter(Device.device_id == device_id).first()
        if device:
            device.last_seen = datetime.datetime.utcnow()
            db.commit()
    except Exception as e:
        print(f"PostgreSQL 設備數據更新失敗: {e}")
    finally:
        db.close()
    
    # 儲存到 InfluxDB
    if INFLUXDB_AVAILABLE and db_manager.influx_client:
        try:
            from influxdb_client import Point
            from influxdb_client.client.write_api import SYNCHRONOUS
            
            bucket = os.getenv('INFLUXDB_BUCKET', 'iot_platform')
            write_api = db_manager.influx_client.write_api(write_options=SYNCHRONOUS)
            
            point = Point("device_sensor_data")\
                .tag("device_id", device_id)\
                .field("temperature", data.get('temperature', 0))\
                .field("humidity", data.get('humidity', 0))\
                .field("pressure", data.get('pressure', 0))
            
            write_api.write(bucket=bucket, record=point)
            print(f"InfluxDB 設備數據儲存成功: {device_id}")
        except Exception as e:
            print(f"InfluxDB 設備數據儲存失敗: {e}")

def get_device_history(device_id: str, hours: int = 24):
    """取得設備歷史數據"""
    if INFLUXDB_AVAILABLE and db_manager.influx_client:
        try:
            from datetime import datetime, timedelta
            
            bucket = os.getenv('INFLUXDB_BUCKET', 'iot_platform')
            query_api = db_manager.influx_client.query_api()
            
            start_time = datetime.utcnow() - timedelta(hours=hours)
            
            query = f'''
            from(bucket: "{bucket}")
                |> range(start: {start_time.isoformat()})
                |> filter(fn: (r) => r["device_id"] == "{device_id}")
                |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            '''
            
            result = query_api.query(query)
            return result
        except Exception as e:
            print(f"InfluxDB 查詢失敗: {e}")
            return []
    return []

# 取得資料庫會話
def get_postgres_session():
    """取得 PostgreSQL 會話"""
    return SessionLocal()

# 取得 MongoDB 資料庫
def get_mongo_db():
    """取得 MongoDB 資料庫"""
    return db_manager.get_mongo_db()

# 取得 InfluxDB 客戶端
def get_influx_client():
    """取得 InfluxDB 客戶端"""
    return db_manager.get_influx_client()

# 用戶認證相關函數
def get_user_by_username(db: Session, username: str):
    """根據用戶名獲取用戶"""
    from .models import User
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    """驗證用戶"""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    """創建訪問令牌"""
    import jwt
    from datetime import datetime, timedelta
    
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "your-secret-key", algorithm="HS256")
    return encoded_jwt

def get_current_user(token: str, db: Session, credentials_exception):
    """獲取當前用戶"""
    import jwt
    from .models import User
    
    try:
        payload = jwt.decode(token, "your-secret-key", algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

def create_user(db: Session, user):
    """創建用戶"""
    from .models import User
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        display_name=user.display_name,
        role_id=user.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 設備管理相關函數
def create_device(db: Session, device):
    """創建設備"""
    from .models import Device
    db_device = Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db: Session, category_id: int = None):
    """獲取設備列表"""
    from .models import Device
    query = db.query(Device)
    if category_id:
        query = query.filter(Device.category_id == category_id)
    return query.all()

def update_device(db: Session, device_id: int, update):
    """更新設備"""
    from .models import Device
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    
    for key, value in update.dict(exclude_unset=True).items():
        setattr(device, key, value)
    
    db.commit()
    db.refresh(device)
    return device

# 設備類別管理相關函數
def create_device_category(db: Session, category, created_by: int):
    """創建設備類別"""
    from .models import DeviceCategory
    db_category = DeviceCategory(**category.dict(), created_by=created_by)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_device_categories(db: Session, parent_id: int = None, include_inactive: bool = False):
    """獲取設備類別列表"""
    from .models import DeviceCategory
    query = db.query(DeviceCategory)
    if parent_id is not None:
        query = query.filter(DeviceCategory.parent_id == parent_id)
    if not include_inactive:
        query = query.filter(DeviceCategory.is_active == True)
    return query.all()

def get_device_category_tree(db: Session):
    """獲取設備類別樹狀結構"""
    from .models import DeviceCategory
    
    def build_tree(parent_id=None):
        categories = db.query(DeviceCategory).filter(
            DeviceCategory.parent_id == parent_id,
            DeviceCategory.is_active == True
        ).all()
        
        tree = []
        for category in categories:
            node = {
                "id": category.id,
                "name": category.name,
                "display_name": category.display_name,
                "description": category.description,
                "icon": category.icon,
                "color": category.color,
                "children": build_tree(category.id)
            }
            tree.append(node)
        return tree
    
    return build_tree()

def get_device_category(db: Session, category_id: int):
    """獲取單個設備類別"""
    from .models import DeviceCategory
    return db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()

def update_device_category(db: Session, category_id: int, category):
    """更新設備類別"""
    from .models import DeviceCategory
    db_category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not db_category:
        return None
    
    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_device_category(db: Session, category_id: int):
    """刪除設備類別"""
    from .models import DeviceCategory
    category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not category:
        return False
    
    # 檢查是否有子類別
    children = db.query(DeviceCategory).filter(DeviceCategory.parent_id == category_id).count()
    if children > 0:
        raise ValueError("無法刪除有子類別的類別")
    
    # 檢查是否有設備使用此類別
    from .models import Device
    devices = db.query(Device).filter(Device.category_id == category_id).count()
    if devices > 0:
        raise ValueError("無法刪除有設備使用的類別")
    
    db.delete(category)
    db.commit()
    return True

# 警報管理相關函數
def get_alerts(db: Session, device_id: int = None):
    """獲取警報列表"""
    from .models import Alert
    query = db.query(Alert)
    if device_id:
        query = query.filter(Alert.device_id == device_id)
    return query.all()

# 資料庫連線設定管理
def create_database_connection_setting(db: Session, setting: schemas.DatabaseConnectionSettingsCreate, created_by: str = None):
    """創建資料庫連線設定"""
    db_setting = models.DatabaseConnectionSettings(
        **setting.dict(),
        created_by=created_by
    )
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def get_database_connection_settings(db: Session, skip: int = 0, limit: int = 100):
    """獲取所有資料庫連線設定"""
    return db.query(models.DatabaseConnectionSettings).offset(skip).limit(limit).all()

def get_database_connection_setting_by_type(db: Session, db_type: str):
    """根據類型獲取資料庫連線設定"""
    return db.query(models.DatabaseConnectionSettings).filter(
        models.DatabaseConnectionSettings.db_type == db_type,
        models.DatabaseConnectionSettings.is_active == True
    ).first()

def get_active_database_connection_settings(db: Session):
    """獲取所有活躍的資料庫連線設定"""
    return db.query(models.DatabaseConnectionSettings).filter(
        models.DatabaseConnectionSettings.is_active == True
    ).all()

def update_database_connection_setting(db: Session, setting_id: int, setting: schemas.DatabaseConnectionSettingsUpdate):
    """更新資料庫連線設定"""
    db_setting = db.query(models.DatabaseConnectionSettings).filter(
        models.DatabaseConnectionSettings.id == setting_id
    ).first()
    if db_setting:
        update_data = setting.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_setting, field, value)
        db_setting.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_setting)
    return db_setting

def delete_database_connection_setting(db: Session, setting_id: int):
    """刪除資料庫連線設定"""
    db_setting = db.query(models.DatabaseConnectionSettings).filter(
        models.DatabaseConnectionSettings.id == setting_id
    ).first()
    if db_setting:
        db.delete(db_setting)
        db.commit()
    return db_setting

def check_first_time_setup(db: Session):
    """檢查是否為首次設定"""
    # 檢查是否有任何資料庫連線設定
    settings_count = db.query(models.DatabaseConnectionSettings).count()
    return settings_count == 0

def get_system_setting(db: Session, key: str):
    """獲取系統設定"""
    return db.query(models.SystemSettings).filter(
        models.SystemSettings.key == key
    ).first()

def create_or_update_system_setting(db: Session, key: str, value: str, description: str = None):
    """創建或更新系統設定"""
    db_setting = get_system_setting(db, key)
    if db_setting:
        db_setting.value = value
        db_setting.description = description
        db_setting.updated_at = datetime.utcnow()
    else:
        db_setting = models.SystemSettings(
            key=key,
            value=value,
            description=description
        )
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def mark_setup_completed(db: Session):
    """標記設定完成"""
    return create_or_update_system_setting(
        db, 
        "first_time_setup_completed", 
        "true", 
        "首次設定已完成"
    )

# AI Model 管理
def create_ai_model(db: Session, model: schemas.AIModelCreate, created_by: str = None):
    """創建 AI Model"""
    db_model = models.AIModel(
        **model.dict(),
        created_by=created_by
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_ai_models(db: Session, skip: int = 0, limit: int = 100, type_filter: str = None):
    """獲取 AI Model 列表"""
    query = db.query(models.AIModel)
    if type_filter:
        query = query.filter(models.AIModel.type == type_filter)
    return query.offset(skip).limit(limit).all()

def get_ai_model(db: Session, model_id: int):
    """根據 ID 獲取 AI Model"""
    return db.query(models.AIModel).filter(models.AIModel.id == model_id).first()

def update_ai_model(db: Session, model_id: int, model: schemas.AIModelUpdate):
    """更新 AI Model"""
    db_model = get_ai_model(db, model_id)
    if db_model:
        update_data = model.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_model, field, value)
        db_model.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_model)
    return db_model

def delete_ai_model(db: Session, model_id: int):
    """刪除 AI Model"""
    db_model = get_ai_model(db, model_id)
    if db_model:
        db.delete(db_model)
        db.commit()
    return db_model

def toggle_ai_model_status(db: Session, model_id: int):
    """切換 AI Model 狀態"""
    db_model = get_ai_model(db, model_id)
    if db_model:
        db_model.status = 'active' if db_model.status == 'inactive' else 'inactive'
        db_model.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_model)
    return db_model

def create_ai_model_usage(db: Session, usage: schemas.AIModelUsageCreate):
    """創建 AI Model 使用記錄"""
    db_usage = models.AIModelUsage(**usage.dict())
    db.add(db_usage)
    
    # 更新模型的最後使用時間
    db_model = get_ai_model(db, usage.model_id)
    if db_model:
        db_model.last_used = datetime.utcnow()
    
    db.commit()
    db.refresh(db_usage)
    return db_usage

def get_ai_model_usage(db: Session, model_id: int, skip: int = 0, limit: int = 100):
    """獲取 AI Model 使用記錄"""
    return db.query(models.AIModelUsage).filter(
        models.AIModelUsage.model_id == model_id
    ).offset(skip).limit(limit).all()

def create_ai_model_performance(db: Session, performance: schemas.AIModelPerformanceCreate):
    """創建 AI Model 性能記錄"""
    db_performance = models.AIModelPerformance(**performance.dict())
    db.add(db_performance)
    db.commit()
    db.refresh(db_performance)
    return db_performance

def get_ai_model_performance(db: Session, model_id: int, hours: int = 24):
    """獲取 AI Model 性能記錄"""
    from datetime import timedelta
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    return db.query(models.AIModelPerformance).filter(
        models.AIModelPerformance.model_id == model_id,
        models.AIModelPerformance.timestamp >= start_time
    ).order_by(models.AIModelPerformance.timestamp.desc()).all()

def get_ai_model_stats(db: Session):
    """獲取 AI Model 統計信息"""
    total_models = db.query(models.AIModel).count()
    active_models = db.query(models.AIModel).filter(models.AIModel.status == 'active').count()
    uploading_models = db.query(models.AIModel).filter(models.AIModel.status == 'uploading').count()
    
    # 獲取不同類型的模型數量
    type_counts = db.query(
        models.AIModel.type,
        db.func.count(models.AIModel.id)
    ).group_by(models.AIModel.type).all()
    
    return {
        'total': total_models,
        'active': active_models,
        'uploading': uploading_models,
        'types': dict(type_counts)
    }

# 平台內容管理
def create_platform_content(db: Session, content: schemas.PlatformContentCreate, created_by: str = None):
    """創建平台內容"""
    db_content = models.PlatformContent(
        **content.dict(),
        created_by=created_by
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

def get_platform_content(db: Session, section: str = None, content_type: str = None):
    """獲取平台內容"""
    query = db.query(models.PlatformContent).filter(models.PlatformContent.is_active == True)
    
    if section:
        query = query.filter(models.PlatformContent.section == section)
    if content_type:
        query = query.filter(models.PlatformContent.content_type == content_type)
    
    return query.order_by(models.PlatformContent.sort_order).all()

def update_platform_content(db: Session, content_id: int, content: schemas.PlatformContentUpdate):
    """更新平台內容"""
    db_content = db.query(models.PlatformContent).filter(models.PlatformContent.id == content_id).first()
    if db_content:
        update_data = content.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_content, field, value)
        db_content.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_content)
    return db_content

def delete_platform_content(db: Session, content_id: int):
    """刪除平台內容"""
    db_content = db.query(models.PlatformContent).filter(models.PlatformContent.id == content_id).first()
    if db_content:
        db.delete(db_content)
        db.commit()
    return db_content

def get_platform_content_full(db: Session):
    """獲取完整的平台內容結構"""
    contents = get_platform_content(db)
    
    # 組織內容結構
    result = {
        'basic': {},
        'features': [],
        'modules': [],
        'quickstart': [],
        'images': []
    }
    
    for content in contents:
        if content.section == 'basic':
            result['basic'][content.content_key] = content.content_value
        elif content.section == 'features':
            if content.content_json:
                result['features'].append(content.content_json)
        elif content.section == 'modules':
            if content.content_json:
                result['modules'].append(content.content_json)
        elif content.section == 'quickstart':
            if content.content_json:
                result['quickstart'].append(content.content_json)
    
    return result

# 平台圖片管理
def create_platform_image(db: Session, image: schemas.PlatformImageCreate, created_by: str = None):
    """創建平台圖片記錄"""
    db_image = models.PlatformImage(
        **image.dict(),
        created_by=created_by
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_platform_images(db: Session, category: str = None, is_active: bool = True):
    """獲取平台圖片"""
    query = db.query(models.PlatformImage).filter(models.PlatformImage.is_active == is_active)
    
    if category:
        query = query.filter(models.PlatformImage.category == category)
    
    return query.order_by(models.PlatformImage.created_at.desc()).all()

def get_platform_image(db: Session, image_id: int):
    """根據 ID 獲取平台圖片"""
    return db.query(models.PlatformImage).filter(models.PlatformImage.id == image_id).first()

def update_platform_image(db: Session, image_id: int, image: schemas.PlatformImageUpdate):
    """更新平台圖片"""
    db_image = get_platform_image(db, image_id)
    if db_image:
        update_data = image.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_image, field, value)
        db_image.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_image)
    return db_image

def delete_platform_image(db: Session, image_id: int):
    """刪除平台圖片"""
    db_image = get_platform_image(db, image_id)
    if db_image:
        # 這裡可以添加實際檔案刪除邏輯
        db.delete(db_image)
        db.commit()
    return db_image

def get_platform_images_by_category(db: Session):
    """按分類獲取圖片統計"""
    categories = db.query(
        models.PlatformImage.category,
        db.func.count(models.PlatformImage.id)
    ).filter(models.PlatformImage.is_active == True).group_by(models.PlatformImage.category).all()
    
    return dict(categories)

# 初始化資料庫管理器
db_manager = DatabaseManager() 