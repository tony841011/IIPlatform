#!/usr/bin/env python3
"""
資料庫狀態檢查腳本
檢查所有預設資料庫連線和資料表狀態
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database_settings import get_database_configs, get_default_databases
from app.database import engine, Base, test_database_connections
from app.models import *
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import logging

# 設定日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_postgresql_status():
    """檢查 PostgreSQL 狀態"""
    logger.info("🔍 檢查 PostgreSQL 狀態...")
    
    try:
        # 測試連線
        with engine.connect() as conn:
            logger.info("✅ PostgreSQL 連線成功")
            
            # 檢查表是否存在
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            logger.info(f"📋 發現 {len(tables)} 個資料表:")
            for table in tables:
                logger.info(f"   - {table}")
            
            # 檢查關鍵表
            key_tables = ['users', 'roles', 'database_connections', 'device_categories', 'device_groups']
            missing_tables = [table for table in key_tables if table not in tables]
            
            if missing_tables:
                logger.warning(f"⚠️  缺少關鍵表: {missing_tables}")
            else:
                logger.info("✅ 所有關鍵表都存在")
            
            return True, tables
            
    except Exception as e:
        logger.error(f"❌ PostgreSQL 檢查失敗: {e}")
        return False, []

def check_mongodb_status():
    """檢查 MongoDB 狀態"""
    logger.info("🔍 檢查 MongoDB 狀態...")
    
    try:
        from pymongo import MongoClient
        from app.config.database_settings import MONGODB
        
        config = MONGODB
        if config['username'] and config['password']:
            connection_string = f"mongodb://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
        else:
            connection_string = f"mongodb://{config['host']}:{config['port']}/{config['database']}"
        
        client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
        client.admin.command('ping')
        
        db = client[config['database']]
        collections = db.list_collection_names()
        
        logger.info(f"✅ MongoDB 連線成功")
        logger.info(f"📋 發現 {len(collections)} 個集合:")
        for collection in collections:
            logger.info(f"   - {collection}")
        
        client.close()
        return True, collections
        
    except Exception as e:
        logger.error(f"❌ MongoDB 檢查失敗: {e}")
        return False, []

def check_influxdb_status():
    """檢查 InfluxDB 狀態"""
    logger.info("🔍 檢查 InfluxDB 狀態...")
    
    try:
        from influxdb_client import InfluxDBClient
        from app.config.database_settings import INFLUXDB
        
        config = INFLUXDB
        client = InfluxDBClient(
            url=f"http://{config['host']}:{config['port']}",
            username=config['username'],
            password=config['password'],
            timeout=10000
        )
        
        # 測試連線
        health = client.health()
        logger.info(f"✅ InfluxDB 連線成功")
        logger.info(f"📊 健康狀態: {health.status}")
        
        # 獲取 bucket 列表
        buckets_api = client.buckets_api()
        buckets = buckets_api.find_buckets()
        
        bucket_names = [bucket.name for bucket in buckets]
        logger.info(f"📋 發現 {len(bucket_names)} 個 bucket:")
        for bucket in bucket_names:
            logger.info(f"   - {bucket}")
        
        client.close()
        return True, bucket_names
        
    except Exception as e:
        logger.error(f"❌ InfluxDB 檢查失敗: {e}")
        return False, []

def check_database_connections_table():
    """檢查資料庫連線表中的記錄"""
    logger.info("🔍 檢查資料庫連線表記錄...")
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 檢查資料庫連線記錄
        connections = db.query(DatabaseConnection).all()
        logger.info(f"📋 資料庫連線表中有 {len(connections)} 條記錄:")
        
        for conn in connections:
            status = "✅ 啟用" if conn.is_active else "❌ 停用"
            default = "🌟 預設" if conn.is_default else "普通"
            logger.info(f"   - {conn.name} ({conn.db_type}) - {status} - {default}")
            logger.info(f"     主機: {conn.host}:{conn.port}/{conn.database}")
        
        # 檢查預設連線
        default_connections = db.query(DatabaseConnection).filter(DatabaseConnection.is_default == True).all()
        logger.info(f"🌟 預設連線數量: {len(default_connections)}")
        
        db.close()
        return True, connections
        
    except Exception as e:
        logger.error(f"❌ 檢查資料庫連線表失敗: {e}")
        return False, []

def check_initial_data():
    """檢查初始資料"""
    logger.info("🔍 檢查初始資料...")
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 檢查角色
        roles = db.query(Role).all()
        logger.info(f"👥 角色數量: {len(roles)}")
        for role in roles:
            logger.info(f"   - {role.display_name} ({role.name}) - 等級: {role.level}")
        
        # 檢查用戶
        users = db.query(User).all()
        logger.info(f"👤 用戶數量: {len(users)}")
        for user in users:
            logger.info(f"   - {user.display_name} ({user.username}) - 角色: {user.role_id}")
        
        # 檢查設備類別
        categories = db.query(DeviceCategory).all()
        logger.info(f"📱 設備類別數量: {len(categories)}")
        for category in categories:
            logger.info(f"   - {category.display_name} ({category.name})")
        
        # 檢查設備群組
        groups = db.query(DeviceGroup).all()
        logger.info(f"👥 設備群組數量: {len(groups)}")
        for group in groups:
            logger.info(f"   - {group.name}")
        
        db.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ 檢查初始資料失敗: {e}")
        return False

def main():
    """主函數"""
    logger.info("🚀 開始檢查資料庫狀態...")
    logger.info("=" * 60)
    
    # 顯示配置
    configs = get_database_configs()
    logger.info("📋 資料庫配置:")
    for db_type, config in configs.items():
        if config.get("is_default", False):
            logger.info(f"   ✅ {db_type.upper()}: {config['host']}:{config['port']}/{config['database']}")
        else:
            logger.info(f"   ⏸️  {db_type.upper()}: {config['host']}:{config['port']}/{config['database']} (未啟用)")
    
    logger.info("=" * 60)
    
    # 檢查各資料庫狀態
    postgresql_ok, postgresql_tables = check_postgresql_status()
    logger.info("")
    
    mongodb_ok, mongodb_collections = check_mongodb_status()
    logger.info("")
    
    influxdb_ok, influxdb_buckets = check_influxdb_status()
    logger.info("")
    
    # 檢查資料庫連線表
    connections_ok, connections = check_database_connections_table()
    logger.info("")
    
    # 檢查初始資料
    initial_data_ok = check_initial_data()
    logger.info("")
    
    # 總結
    logger.info("=" * 60)
    logger.info("📊 檢查結果總結:")
    logger.info(f"   PostgreSQL: {'✅ 正常' if postgresql_ok else '❌ 異常'}")
    logger.info(f"   MongoDB: {'✅ 正常' if mongodb_ok else '❌ 異常'}")
    logger.info(f"   InfluxDB: {'✅ 正常' if influxdb_ok else '❌ 異常'}")
    logger.info(f"   資料庫連線表: {'✅ 正常' if connections_ok else '❌ 異常'}")
    logger.info(f"   初始資料: {'✅ 正常' if initial_data_ok else '❌ 異常'}")
    
    if all([postgresql_ok, mongodb_ok, influxdb_ok, connections_ok, initial_data_ok]):
        logger.info("🎉 所有檢查都通過！資料庫狀態正常。")
        return True
    else:
        logger.warning("⚠️  部分檢查失敗，請檢查相關配置和連線。")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 