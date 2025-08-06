#!/usr/bin/env python3
"""
資料庫初始化腳本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, test_database_connections
from app.models import *
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import logging

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """初始化資料庫"""
    logger.info("🔧 開始初始化資料庫...")
    
    # 測試資料庫連線
    logger.info("📊 測試資料庫連線...")
    connection_results = test_database_connections()
    
    for db_name, result in connection_results.items():
        if result['status'] == 'success':
            logger.info(f"✅ {db_name}: {result['message']}")
        else:
            logger.error(f"❌ {db_name}: {result['message']}")
            return False
    
    # 創建 PostgreSQL 表結構
    logger.info("📋 創建 PostgreSQL 表結構...")
    Base.metadata.create_all(bind=engine)
    
    # 創建初始數據
    logger.info("📝 創建初始數據...")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 創建預設角色
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
        
        # 創建預設用戶
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
        
        # 創建預設設備類別
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
        
        controller_category = DeviceCategory(
            name="controller",
            display_name="控制器",
            description="各種控制器設備",
            icon="controller",
            color="#faad14",
            is_active=True,
            is_system=True,
            created_by=1
        )
        db.add(controller_category)
        
        # 創建預設設備群組
        default_group = DeviceGroup(
            name="預設群組",
            description="系統預設設備群組"
        )
        db.add(default_group)
        
        # 創建預設資料庫連線
        postgres_connection = DatabaseConnection(
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
            description="系統主資料庫連線"
        )
        db.add(postgres_connection)
        
        mongo_connection = DatabaseConnection(
            name="MongoDB 文檔資料庫",
            db_type="mongodb",
            host="localhost",
            port=27017,
            database="iot_platform",
            username="iot_user",
            password="iot_password_2024",
            connection_string="mongodb://iot_user:iot_password_2024@localhost:27017/iot_platform",
            is_active=True,
            is_default=False,
            description="文檔資料庫連線"
        )
        db.add(mongo_connection)
        
        influx_connection = DatabaseConnection(
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
            description="時序資料庫連線"
        )
        db.add(influx_connection)
        
        db.commit()
        logger.info("✅ 初始數據創建完成")
        
    except Exception as e:
        logger.error(f"❌ 創建初始數據失敗: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()
    
    logger.info("🎉 資料庫初始化完成！")
    return True

if __name__ == "__main__":
    if init_database():
        logger.info("✅ 資料庫初始化成功")
        sys.exit(0)
    else:
        logger.error("❌ 資料庫初始化失敗")
        sys.exit(1) 