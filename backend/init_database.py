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

# 導入新的資料庫設定
from app.config.database_settings import get_database_configs, get_default_databases

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
        
        # 從配置檔案創建預設資料庫連線
        logger.info("🔗 創建預設資料庫連線...")
        database_configs = get_database_configs()
        
        for db_type, config in database_configs.items():
            if config.get("is_default", False):
                # 生成連線字串
                connection_string = generate_connection_string(db_type, config)
                
                # 創建資料庫連線記錄
                db_connection = DatabaseConnection(
                    name=f"{db_type.upper()} 資料庫",
                    db_type=db_type,
                    host=config.get("host", ""),
                    port=config.get("port", ""),
                    database=config.get("database", ""),
                    username=config.get("username", ""),
                    password=config.get("password", ""),
                    connection_string=connection_string,
                    is_active=True,
                    is_default=config.get("is_default", False),
                    description=f"從配置檔案自動創建的 {db_type} 資料庫連線"
                )
                db.add(db_connection)
                logger.info(f"✅ 創建 {db_type} 資料庫連線: {config.get('host', '')}:{config.get('port', '')}/{config.get('database', '')}")
        
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

def generate_connection_string(db_type, config):
    """生成資料庫連線字串"""
    from urllib.parse import quote_plus
    
    host = config.get("host", "")
    port = config.get("port", "")
    database = config.get("database", "")
    username = config.get("username", "")
    password = config.get("password", "")
    
    if db_type == "postgresql":
        if username and password:
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            return f"postgresql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
        else:
            return f"postgresql://{host}:{port}/{database}"
    
    elif db_type == "mongodb":
        if username and password:
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            return f"mongodb://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
        else:
            return f"mongodb://{host}:{port}/{database}"
    
    elif db_type == "influxdb":
        return f"http://{host}:{port}"
    
    elif db_type == "mysql":
        if username and password:
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            return f"mysql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
        else:
            return f"mysql://{host}:{port}/{database}"
    
    else:
        return ""

if __name__ == "__main__":
    if init_database():
        logger.info("✅ 資料庫初始化成功")
        sys.exit(0)
    else:
        logger.error("❌ 資料庫初始化失敗")
        sys.exit(1) 