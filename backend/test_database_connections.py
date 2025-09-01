#!/usr/bin/env python3
"""
資料庫連線測試腳本
測試所有配置的資料庫連線
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database_settings import get_database_configs, get_default_databases
import time

def test_postgresql_connection(config):
    """測試 PostgreSQL 連線"""
    try:
        import psycopg2
        from psycopg2 import sql
        
        print(f"🔍 測試 PostgreSQL 連線: {config['host']}:{config['port']}/{config['database']}")
        
        # 建立連線
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['username'],
            password=config['password'],
            connect_timeout=10
        )
        
        # 測試查詢
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"✅ PostgreSQL 連線成功: {version.split(',')[0]}")
        return True
        
    except ImportError:
        print("❌ psycopg2 未安裝，無法測試 PostgreSQL")
        return False
    except Exception as e:
        print(f"❌ PostgreSQL 連線失敗: {e}")
        return False

def test_mongodb_connection(config):
    """測試 MongoDB 連線"""
    try:
        from pymongo import MongoClient
        
        print(f"🔍 測試 MongoDB 連線: {config['host']}:{config['port']}/{config['database']}")
        
        # 建立連線字串
        if config['username'] and config['password']:
            connection_string = f"mongodb://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
        else:
            connection_string = f"mongodb://{config['host']}:{config['port']}/{config['database']}"
        
        # 建立客戶端
        client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
        
        # 測試連線
        client.admin.command('ping')
        
        # 獲取資料庫資訊
        db = client[config['database']]
        collections = db.list_collection_names()
        
        client.close()
        
        print(f"✅ MongoDB 連線成功，集合數量: {len(collections)}")
        return True
        
    except ImportError:
        print("❌ pymongo 未安裝，無法測試 MongoDB")
        return False
    except Exception as e:
        print(f"❌ MongoDB 連線失敗: {e}")
        return False

def test_influxdb_connection(config):
    """測試 InfluxDB 連線"""
    try:
        from influxdb_client import InfluxDBClient
        
        print(f"🔍 測試 InfluxDB 連線: {config['host']}:{config['port']}")
        
        # 建立客戶端
        client = InfluxDBClient(
            url=f"http://{config['host']}:{config['port']}",
            username=config['username'],
            password=config['password'],
            timeout=10000
        )
        
        # 測試連線
        health = client.health()
        
        if health.status == "pass":
            print(f"✅ InfluxDB 連線成功，狀態: {health.status}")
            return True
        else:
            print(f"❌ InfluxDB 連線失敗，狀態: {health.status}")
            return False
            
    except ImportError:
        print("❌ influxdb-client 未安裝，無法測試 InfluxDB")
        return False
    except Exception as e:
        print(f"❌ InfluxDB 連線失敗: {e}")
        return False

def test_mysql_connection(config):
    """測試 MySQL 連線"""
    try:
        import mysql.connector
        
        print(f"🔍 測試 MySQL 連線: {config['host']}:{config['port']}/{config['database']}")
        
        # 建立連線
        conn = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['username'],
            password=config['password'],
            connection_timeout=10
        )
        
        # 測試查詢
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"✅ MySQL 連線成功: {version}")
        return True
        
    except ImportError:
        print("❌ mysql-connector-python 未安裝，無法測試 MySQL")
        return False
    except Exception as e:
        print(f"❌ MySQL 連線失敗: {e}")
        return False

def test_all_connections():
    """測試所有資料庫連線"""
    print("🔧 IIPlatform 資料庫連線測試")
    print("=" * 50)
    print()
    
    # 獲取所有配置
    configs = get_database_configs()
    default_configs = get_default_databases()
    
    print(f"📋 總共配置了 {len(configs)} 個資料庫")
    print(f"🎯 啟用了 {len(default_configs)} 個預設資料庫")
    print()
    
    # 測試結果統計
    total_tests = 0
    successful_tests = 0
    
    # 測試每種資料庫
    for db_type, config in configs.items():
        if config.get("is_default", False):
            print(f"🚀 測試預設資料庫: {db_type.upper()}")
        else:
            print(f"⏸️  測試備用資料庫: {db_type.upper()}")
        
        print("-" * 40)
        
        start_time = time.time()
        
        if db_type == "postgresql":
            success = test_postgresql_connection(config)
        elif db_type == "mongodb":
            success = test_mongodb_connection(config)
        elif db_type == "influxdb":
            success = test_influxdb_connection(config)
        elif db_type == "mysql":
            success = test_mysql_connection(config)
        else:
            print(f"❌ 不支援的資料庫類型: {db_type}")
            success = False
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        if success:
            successful_tests += 1
            print(f"⏱️  響應時間: {response_time:.2f}ms")
        else:
            print(f"⏱️  測試時間: {response_time:.2f}ms")
        
        total_tests += 1
        print()
    
    # 顯示測試結果摘要
    print("=" * 50)
    print("📊 測試結果摘要")
    print("=" * 50)
    print(f"✅ 成功: {successful_tests}/{total_tests}")
    print(f"❌ 失敗: {total_tests - successful_tests}/{total_tests}")
    print(f"📈 成功率: {(successful_tests/total_tests)*100:.1f}%")
    
    if successful_tests == total_tests:
        print("\n🎉 所有資料庫連線測試通過！")
        return True
    else:
        print(f"\n⚠️  有 {total_tests - successful_tests} 個資料庫連線失敗")
        print("請檢查配置和資料庫服務狀態")
        return False

def main():
    """主函數"""
    try:
        success = test_all_connections()
        if success:
            print("\n💡 下一步：執行 'python init_database.py' 來初始化資料庫")
            sys.exit(0)
        else:
            print("\n🔧 請修復連線問題後重新測試")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n❌ 測試已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 測試過程中發生錯誤: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 