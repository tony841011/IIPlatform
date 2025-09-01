"""
資料庫連線設定檔案
⚠️  重要：請直接在此檔案中修改您的資料庫連線設定！
"""

# ============================================================================
# 🗄️  預設資料庫連線設定 - 請修改這裡！
# ============================================================================

# PostgreSQL 主資料庫
POSTGRESQL = {
    "host": "localhost",           # 資料庫主機地址
    "port": 5432,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "postgres",       # 用戶名
    "password": "admin",       # 密碼
    "is_default": True            # 是否為預設資料庫
}

# MongoDB 文檔資料庫
MONGODB = {
    "host": "localhost",          # 資料庫主機地址
    "port": 27017,                # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "",               # 用戶名 (留空表示無認證)
    "password": "",               # 密碼 (留空表示無認證)
    "is_default": True            # 是否為預設資料庫
}

# InfluxDB 時序資料庫
INFLUXDB = {
    "host": "localhost",          # 資料庫主機地址
    "port": 8086,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "tony",          # 用戶名
    "password": "admintony",       # 密碼
    "is_default": True            # 是否為預設資料庫
}

# MySQL 備用資料庫 (可選)
MYSQL = {
    "host": "localhost",          # 資料庫主機地址
    "port": 3306,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "root",           # 用戶名
    "password": "root",           # 密碼
    "is_default": False           # 是否為預設資料庫
}

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
    return {
        "postgresql": POSTGRESQL,
        "mongodb": MONGODB,
        "influxdb": INFLUXDB,
        "mysql": MYSQL
    }

def get_default_databases():
    """獲取預設資料庫配置"""
    configs = get_database_configs()
    return {k: v for k, v in configs.items() if v.get("is_default", False)}

def get_database_config(db_type):
    """獲取特定資料庫配置"""
    configs = get_database_configs()
    return configs.get(db_type, {})

# 如果直接執行此檔案，顯示當前配置
if __name__ == "__main__":
    print("🔧 IIPlatform 資料庫連線設定")
    print("=" * 40)
    
    configs = get_database_configs()
    for db_type, config in configs.items():
        if config.get("is_default", False):
            print(f"✅ {db_type.upper()}: {config['host']}:{config['port']}/{config['database']}")
        else:
            print(f"⏸️  {db_type.upper()}: {config['host']}:{config['port']}/{config['database']} (未啟用)")
    
    print("\n💡 提示：修改此檔案中的配置值來設定您的資料庫連線") 