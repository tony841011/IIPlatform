#!/usr/bin/env python3
"""
本地資料庫連線測試腳本
用於驗證本地資料庫服務是否正常運行
"""

import sys
import os
import asyncio
from typing import Dict, List, Tuple

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_postgresql_connection():
    """測試 PostgreSQL 連線"""
    try:
        import psycopg2
        from app.config.database_settings import POSTGRESQL
        
        print("🔍 測試 PostgreSQL 連線...")
        
        conn = psycopg2.connect(
            host=POSTGRESQL["host"],
            port=POSTGRESQL["port"],
            database=POSTGRESQL["database"],
            user=POSTGRESQL["username"],
            password=POSTGRESQL["password"],
            connect_timeout=5
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        print(f"✅ PostgreSQL 連線成功!")
        print(f"   版本: {version[0]}")
        return True
        
    except ImportError:
        print("❌ psycopg2 未安裝，請執行: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ PostgreSQL 連線失敗: {str(e)}")
        return False

def test_mongodb_connection():
    """測試 MongoDB 連線"""
    try:
        import pymongo
        from app.config.database_settings import MONGODB
        
        print("🔍 測試 MongoDB 連線...")
        
        if MONGODB["username"] and MONGODB["password"]:
            # 有認證的連線
            client = pymongo.MongoClient(
                f"mongodb://{MONGODB['username']}:{MONGODB['password']}@{MONGODB['host']}:{MONGODB['port']}/{MONGODB['database']}",
                serverSelectionTimeoutMS=5000
            )
        else:
            # 無認證的連線
            client = pymongo.MongoClient(
                f"mongodb://{MONGODB['host']}:{MONGODB['port']}/{MONGODB['database']}",
                serverSelectionTimeoutMS=5000
            )
        
        # 測試連線
        client.admin.command('ping')
        db_info = client.server_info()
        
        client.close()
        
        print(f"✅ MongoDB 連線成功!")
        print(f"   版本: {db_info.get('version', 'Unknown')}")
        return True
        
    except ImportError:
        print("❌ pymongo 未安裝，請執行: pip install pymongo")
        return False
    except Exception as e:
        print(f"❌ MongoDB 連線失敗: {str(e)}")
        return False

def test_influxdb_connection():
    """測試 InfluxDB 連線"""
    try:
        from influxdb_client import InfluxDBClient
        from app.config.database_settings import INFLUXDB
        
        print("🔍 測試 InfluxDB 連線...")
        
        client = InfluxDBClient(
            url=f"http://{INFLUXDB['host']}:{INFLUXDB['port']}",
            username=INFLUXDB['username'],
            password=INFLUXDB['password'],
            timeout=5000
        )
        
        # 測試連線
        health = client.health()
        
        if health.status == "pass":
            print(f"✅ InfluxDB 連線成功!")
            print(f"   狀態: {health.status}")
            print(f"   訊息: {health.message}")
        else:
            print(f"⚠️  InfluxDB 連線警告: {health.message}")
        
        client.close()
        return True
        
    except ImportError:
        print("❌ influxdb-client 未安裝，請執行: pip install influxdb-client")
        return False
    except Exception as e:
        print(f"❌ InfluxDB 連線失敗: {str(e)}")
        return False

def check_database_services():
    """檢查資料庫服務狀態"""
    print("🔍 檢查本地資料庫服務狀態...")
    
    import subprocess
    import platform
    
    services = {
        "PostgreSQL": {
            "windows": "postgres",
            "linux": "postgresql",
            "darwin": "postgresql"
        },
        "MongoDB": {
            "windows": "mongod",
            "linux": "mongod",
            "darwin": "mongodb-community"
        },
        "InfluxDB": {
            "windows": "influxd",
            "linux": "influxdb",
            "darwin": "influxdb"
        }
    }
    
    system = platform.system().lower()
    if system == "windows":
        system = "windows"
    elif system == "darwin":
        system = "darwin"
    else:
        system = "linux"
    
    for service_name, service_commands in services.items():
        service_cmd = service_commands.get(system, service_commands["linux"])
        
        try:
            if system == "windows":
                # Windows 使用 tasklist
                result = subprocess.run(
                    ["tasklist", "/FI", f"IMAGENAME eq {service_cmd}.exe"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                is_running = service_cmd in result.stdout
            else:
                # Linux/macOS 使用 systemctl
                result = subprocess.run(
                    ["systemctl", "is-active", service_cmd],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                is_running = result.stdout.strip() == "active"
            
            if is_running:
                print(f"✅ {service_name} 服務正在運行")
            else:
                print(f"❌ {service_name} 服務未運行")
                
        except Exception as e:
            print(f"⚠️  無法檢查 {service_name} 服務狀態: {str(e)}")

def main():
    """主函數"""
    print("🚀 IIPlatform 本地資料庫連線測試")
    print("=" * 50)
    
    # 檢查服務狀態
    check_database_services()
    print()
    
    # 測試資料庫連線
    results = []
    
    results.append(("PostgreSQL", test_postgresql_connection()))
    print()
    
    results.append(("MongoDB", test_mongodb_connection()))
    print()
    
    results.append(("InfluxDB", test_influxdb_connection()))
    print()
    
    # 顯示測試結果摘要
    print("=" * 50)
    print("📊 測試結果摘要:")
    print("=" * 50)
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for db_name, success in results:
        status = "✅ 成功" if success else "❌ 失敗"
        print(f"{db_name}: {status}")
    
    print(f"\n總計: {success_count}/{total_count} 個資料庫連線成功")
    
    if success_count == total_count:
        print("\n🎉 所有資料庫連線測試通過！")
        print("💡 您現在可以啟動 IIPlatform 了")
    else:
        print(f"\n⚠️  有 {total_count - success_count} 個資料庫連線失敗")
        print("💡 請檢查資料庫服務是否正在運行，以及配置是否正確")
        print("📖 參考 LOCAL_DATABASE_SETUP.md 進行故障排除")

if __name__ == "__main__":
    main() 