#!/usr/bin/env python3
"""
資料庫設定腳本
互動式設定您的資料庫連線
"""

import os
import sys
import json
from pathlib import Path

def print_banner():
    """顯示標題"""
    print("=" * 60)
    print("🔧 IIPlatform 資料庫連線設定工具")
    print("=" * 60)
    print()

def get_user_input(prompt, default=""):
    """獲取用戶輸入"""
    if default:
        user_input = input(f"{prompt} [{default}]: ").strip()
        return user_input if user_input else default
    else:
        return input(f"{prompt}: ").strip()

def setup_postgresql():
    """設定 PostgreSQL"""
    print("\n🗄️  PostgreSQL 設定")
    print("-" * 30)
    
    config = {
        "host": get_user_input("主機地址", "localhost"),
        "port": int(get_user_input("端口", "5432")),
        "database": get_user_input("資料庫名稱", "iiplatform"),
        "username": get_user_input("用戶名", "postgres"),
        "password": get_user_input("密碼", "postgres"),
        "is_default": True
    }
    
    return config

def setup_mongodb():
    """設定 MongoDB"""
    print("\n📄  MongoDB 設定")
    print("-" * 30)
    
    config = {
        "host": get_user_input("主機地址", "localhost"),
        "port": int(get_user_input("端口", "27017")),
        "database": get_user_input("資料庫名稱", "iiplatform"),
        "username": get_user_input("用戶名 (留空表示無認證)", ""),
        "password": get_user_input("密碼 (留空表示無認證)", ""),
        "is_default": True
    }
    
    return config

def setup_influxdb():
    """設定 InfluxDB"""
    print("\n⏰  InfluxDB 設定")
    print("-" * 30)
    
    config = {
        "host": get_user_input("主機地址", "localhost"),
        "port": int(get_user_input("端口", "8086")),
        "database": get_user_input("資料庫名稱", "iiplatform"),
        "username": get_user_input("用戶名", "admin"),
        "password": get_user_input("密碼", "admin123"),
        "is_default": True
    }
    
    return config

def setup_mysql():
    """設定 MySQL"""
    print("\n🐬  MySQL 設定")
    print("-" * 30)
    
    use_mysql = get_user_input("是否啟用 MySQL 資料庫？(y/n)", "n").lower()
    if use_mysql == 'y':
        config = {
            "host": get_user_input("主機地址", "localhost"),
            "port": int(get_user_input("端口", "3306")),
            "database": get_user_input("資料庫名稱", "iiplatform"),
            "username": get_user_input("用戶名", "root"),
            "password": get_user_input("密碼", "root"),
            "is_default": False
        }
        return config
    else:
        return None

def generate_settings_file(configs):
    """生成設定檔案"""
    settings_content = f'''"""
資料庫連線設定檔案
⚠️  重要：請直接在此檔案中修改您的資料庫連線設定！
"""

# ============================================================================
# 🗄️  預設資料庫連線設定 - 請修改這裡！
# ============================================================================

# PostgreSQL 主資料庫
POSTGRESQL = {json.dumps(configs["postgresql"], indent=4, ensure_ascii=False)}

# MongoDB 文檔資料庫
MONGODB = {json.dumps(configs["mongodb"], indent=4, ensure_ascii=False)}

# InfluxDB 時序資料庫
INFLUXDB = {json.dumps(configs["influxdb"], indent=4, ensure_ascii=False)}

# MySQL 備用資料庫 (可選)
MYSQL = {json.dumps(configs["mysql"], indent=4, ensure_ascii=False)}

# ============================================================================
# 🔧  系統設定
# ============================================================================

# 是否自動測試資料庫連線
AUTO_TEST_CONNECTIONS = True

# 是否自動初始化資料庫
AUTO_INITIALIZE_DATABASES = True

# 連線超時時間 (秒)
CONNECTION_TIMEOUT = 30

# 重試次數
RETRY_COUNT = 3

# ============================================================================
# 📋  獲取配置的函數
# ============================================================================

def get_database_configs():
    """獲取所有資料庫配置"""
    return {{
        "postgresql": POSTGRESQL,
        "mongodb": MONGODB,
        "influxdb": INFLUXDB,
        "mysql": MYSQL
    }}

def get_default_databases():
    """獲取預設資料庫配置"""
    configs = get_database_configs()
    return {{k: v for k, v in configs.items() if v.get("is_default", False)}}

def get_database_config(db_type):
    """獲取特定資料庫配置"""
    configs = get_database_configs()
    return configs.get(db_type, {{}})

# 如果直接執行此檔案，顯示當前配置
if __name__ == "__main__":
    print("🔧 IIPlatform 資料庫連線設定")
    print("=" * 40)
    
    configs = get_database_configs()
    for db_type, config in configs.items():
        if config.get("is_default", False):
            print(f"✅ {{db_type.upper()}}: {{config['host']}}:{{config['port']}}/{{config['database']}}")
        else:
            print(f"⏸️  {{db_type.upper()}}: {{config['host']}}:{{config['port']}}/{{config['database']}} (未啟用)")
    
    print("\\n💡 提示：修改此檔案中的配置值來設定您的資料庫連線")
'''
    
    return settings_content

def main():
    """主函數"""
    print_banner()
    
    print("此工具將幫助您設定 IIPlatform 的資料庫連線。")
    print("請按照提示輸入您的資料庫資訊。")
    print()
    
    # 設定各種資料庫
    configs = {}
    
    # PostgreSQL
    configs["postgresql"] = setup_postgresql()
    
    # MongoDB
    configs["mongodb"] = setup_mongodb()
    
    # InfluxDB
    configs["influxdb"] = setup_influxdb()
    
    # MySQL (可選)
    mysql_config = setup_mysql()
    if mysql_config:
        configs["mysql"] = mysql_config
    else:
        configs["mysql"] = {
            "host": "localhost",
            "port": 3306,
            "database": "iiplatform",
            "username": "root",
            "password": "root",
            "is_default": False
        }
    
    # 顯示設定摘要
    print("\n" + "=" * 60)
    print("📋 設定摘要")
    print("=" * 60)
    
    for db_type, config in configs.items():
        if config.get("is_default", False):
            print(f"✅ {db_type.upper()}: {config['host']}:{config['port']}/{config['database']}")
        else:
            print(f"⏸️  {db_type.upper()}: {config['host']}:{config['port']}/{config['database']} (未啟用)")
    
    # 確認設定
    print()
    confirm = get_user_input("確認以上設定？(y/n)", "y").lower()
    if confirm != 'y':
        print("❌ 設定已取消")
        return
    
    # 生成設定檔案
    settings_content = generate_settings_file(configs)
    
    # 寫入檔案
    settings_file = Path("app/config/database_settings.py")
    settings_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(settings_file, 'w', encoding='utf-8') as f:
        f.write(settings_content)
    
    print(f"\n✅ 設定檔案已生成: {settings_file}")
    print("\n🎉 資料庫設定完成！")
    print("\n💡 下一步：")
    print("   1. 確保您的資料庫服務正在運行")
    print("   2. 執行 'python init_database.py' 來初始化資料庫")
    print("   3. 執行 'python main.py' 來啟動平台")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 設定已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 發生錯誤: {e}")
        sys.exit(1) 