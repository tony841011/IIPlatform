#!/usr/bin/env python3
"""
完整資料庫初始化腳本
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# 設定環境變數
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

def init_postgresql():
    """初始化 PostgreSQL"""
    print("🔧 初始化 PostgreSQL...")
    
    try:
        postgres_url = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"
        engine = create_engine(postgres_url)
        
        # 測試連線
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ PostgreSQL 連線成功")
        
        # 創建表結構
        from app.models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ PostgreSQL 表結構創建成功")
        
        # 創建初始數據
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # 創建預設角色
            from app.models import Role
            admin_role = Role(
                name="admin",
                display_name="系統管理員",
                description="擁有所有權限的系統管理員",
                level=999,
                is_system=True,
                is_active=True
            )
            db.add(admin_role)
            
            operator_role = Role(
                name="operator",
                display_name="操作員",
                description="設備操作和監控權限",
                level=100,
                is_system=True,
                is_active=True
            )
            db.add(operator_role)
            
            viewer_role = Role(
                name="viewer",
                display_name="檢視者",
                description="僅有檢視權限",
                level=10,
                is_system=True,
                is_active=True
            )
            db.add(viewer_role)
            
            db.commit()
            print("✅ PostgreSQL 預設角色創建成功")
            
            # 創建預設用戶
            from app.models import User
            from app.database import get_password_hash
            
            admin_user = User(
                username="admin",
                display_name="系統管理員",
                hashed_password=get_password_hash("admin123"),
                email="admin@iiplatform.com",
                role_id=1,
                is_active=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ PostgreSQL 預設用戶創建成功")
            
            # 創建預設設備類別
            from app.models import DeviceCategory
            sensor_category = DeviceCategory(
                name="sensor",
                display_name="感測器",
                description="各種感測器設備",
                icon="sensor",
                color="#1890ff",
                is_active=True,
                is_system=True,
                created_by=1
            )
            db.add(sensor_category)
            
            actuator_category = DeviceCategory(
                name="actuator",
                display_name="執行器",
                description="各種執行器設備",
                icon="actuator",
                color="#52c41a",
                is_active=True,
                is_system=True,
                created_by=1
            )
            db.add(actuator_category)
            
            gateway_category = DeviceCategory(
                name="gateway",
                display_name="閘道器",
                description="邊緣閘道設備",
                icon="gateway",
                color="#faad14",
                is_active=True,
                is_system=True,
                created_by=1
            )
            db.add(gateway_category)
            
            db.commit()
            print("✅ PostgreSQL 預設設備類別創建成功")
            
            # 創建預設資料庫連線
            from app.models import DatabaseConnection
            postgres_conn = DatabaseConnection(
                name="PostgreSQL 主資料庫",
                db_type="postgresql",
                host="localhost",
                port=5432,
                database="iot_platform",
                username="iot_user",
                password="iot_password_2024",
                connection_string="postgresql://iot_user:iot_password_2024@localhost:5432/iot_platform",
                is_active=True,
                is_default=True,
                description="主要業務資料庫"
            )
            db.add(postgres_conn)
            
            mongo_conn = DatabaseConnection(
                name="MongoDB 文檔資料庫",
                db_type="mongodb",
                host="localhost",
                port=27017,
                database="iot_platform",
                username="",
                password="",
                connection_string="mongodb://localhost:27017/iot_platform",
                is_active=True,
                is_default=False,
                description="非結構化資料儲存"
            )
            db.add(mongo_conn)
            
            influx_conn = DatabaseConnection(
                name="InfluxDB 時序資料庫",
                db_type="influxdb",
                host="localhost",
                port=8086,
                database="iot_platform",
                username="",
                password="",
                connection_string="http://localhost:8086",
                is_active=True,
                is_default=False,
                description="時序資料儲存"
            )
            db.add(influx_conn)
            
            db.commit()
            print("✅ PostgreSQL 預設資料庫連線創建成功")
            
        except Exception as e:
            print(f"❌ PostgreSQL 初始數據創建失敗: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ PostgreSQL 初始化失敗: {e}")
        print("🔄 使用 SQLite 作為備用資料庫...")
        
        # 使用 SQLite
        engine = create_engine("sqlite:///./iot.db")
        from app.models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ SQLite 資料庫初始化成功")

def init_mongodb():
    """初始化 MongoDB"""
    print("🔧 初始化 MongoDB...")
    
    try:
        from app.mongodb_init import init_mongodb_collections
        init_mongodb_collections()
        print("✅ MongoDB 初始化成功")
    except Exception as e:
        print(f"❌ MongoDB 初始化失敗: {e}")

def init_influxdb():
    """初始化 InfluxDB"""
    print("🔧 初始化 InfluxDB...")
    
    try:
        from app.influxdb_init import init_influxdb_measurements
        init_influxdb_measurements()
        print("✅ InfluxDB 初始化成功")
    except Exception as e:
        print(f"❌ InfluxDB 初始化失敗: {e}")

def main():
    """主函數"""
    print("🚀 開始初始化所有資料庫...")
    
    # 初始化 PostgreSQL
    init_postgresql()
    
    # 初始化 MongoDB
    init_mongodb()
    
    # 初始化 InfluxDB
    init_influxdb()
    
    print("🎉 所有資料庫初始化完成！")
    print("\n📊 初始化摘要：")
    print("  • PostgreSQL: 用戶、角色、設備、告警等核心業務數據")
    print("  • MongoDB: 設備配置、AI模型、日誌、報表等非結構化數據")
    print("  • InfluxDB: 感測器數據、系統指標、AI分析結果等時序數據")
    print("\n🔑 預設登入帳號：admin / admin123")

if __name__ == "__main__":
    main() 