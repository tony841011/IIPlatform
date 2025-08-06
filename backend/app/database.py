import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime
import uuid
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from urllib.parse import quote_plus

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
            return self.mongo_db
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

# 全域資料庫管理器
db_manager = DatabaseManager()

# 密碼雜湊函數
def get_password_hash(password: str) -> str:
    """產生密碼雜湊"""
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
        with engine.connect() as conn:
            conn.execute("SELECT 1")
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