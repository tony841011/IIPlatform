"""
預設資料庫連線配置檔案
⚠️  重要：請直接在此檔案中修改您的資料庫連線設定！

修改完成後，系統會自動使用這些設定來初始化資料庫連線。
"""

# ============================================================================
# 🗄️  預設資料庫連線設定
# ============================================================================

# PostgreSQL 主資料庫 (關聯式資料庫)
POSTGRESQL_CONFIG = {
    "name": "PostgreSQL 主資料庫",
    "db_type": "postgresql",
    "host": "localhost",           # 資料庫主機地址
    "port": 5432,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "postgres",       # 用戶名
    "password": "postgres",       # 密碼
    "description": "平台主要關聯式資料庫，用於存儲設備、用戶、權限等核心數據",
    "is_default": True,           # 是否為預設資料庫
    "auto_initialize": True,      # 是否自動初始化
    "ssl_enabled": False,         # 是否啟用 SSL
    "connection_pool_size": 10,   # 連線池大小
    "timeout": 30                 # 連線超時時間 (秒)
}

# MongoDB 文檔資料庫
MONGODB_CONFIG = {
    "name": "MongoDB 文檔資料庫",
    "db_type": "mongodb",
    "host": "localhost",          # 資料庫主機地址
    "port": 27017,                # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "",               # 用戶名 (留空表示無認證)
    "password": "",               # 密碼 (留空表示無認證)
    "description": "文檔資料庫，用於存儲日誌、事件記錄、非結構化數據",
    "is_default": True,           # 是否為預設資料庫
    "auto_initialize": True,      # 是否自動初始化
    "auth_source": "admin",       # 認證資料庫
    "auth_mechanism": "SCRAM-SHA-1",  # 認證機制
    "ssl_enabled": False,         # 是否啟用 SSL
    "max_pool_size": 100,        # 最大連線池大小
    "min_pool_size": 5           # 最小連線池大小
}

# InfluxDB 時序資料庫
INFLUXDB_CONFIG = {
    "name": "InfluxDB 時序資料庫",
    "db_type": "influxdb",
    "host": "localhost",          # 資料庫主機地址
    "port": 8086,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱 (InfluxDB 2.x 稱為 bucket)
    "username": "admin",          # 用戶名
    "password": "admin123",       # 密碼
    "description": "時序資料庫，用於存儲感測器數據、監控指標、時間序列數據",
    "is_default": True,           # 是否為預設資料庫
    "auto_initialize": True,      # 是否自動初始化
    "token": "",                  # InfluxDB 2.x 認證令牌 (如果使用令牌認證)
    "org": "IIPlatform",         # InfluxDB 2.x 組織名稱
    "bucket": "iiplatform",       # InfluxDB 2.x bucket 名稱
    "ssl_enabled": False,         # 是否啟用 SSL
    "timeout": 30                 # 連線超時時間 (秒)
}

# MySQL 備用資料庫 (可選)
MYSQL_CONFIG = {
    "name": "MySQL 備用資料庫",
    "db_type": "mysql",
    "host": "localhost",          # 資料庫主機地址
    "port": 3306,                 # 資料庫端口
    "database": "iiplatform",     # 資料庫名稱
    "username": "root",           # 用戶名
    "password": "root",           # 密碼
    "description": "備用關聯式資料庫，可選配置",
    "is_default": False,          # 是否為預設資料庫
    "auto_initialize": False,     # 是否自動初始化
    "ssl_enabled": False,         # 是否啟用 SSL
    "charset": "utf8mb4",         # 字符集
    "connection_pool_size": 5     # 連線池大小
}

# SQLite 本地資料庫 (開發/測試用)
SQLITE_CONFIG = {
    "name": "SQLite 本地資料庫",
    "db_type": "sqlite",
    "database": "./iiplatform.db",  # 資料庫檔案路徑
    "description": "本地 SQLite 資料庫，適用於開發和測試環境",
    "is_default": False,          # 是否為預設資料庫
    "auto_initialize": False,     # 是否自動初始化
    "timeout": 30                 # 連線超時時間 (秒)
}

# ============================================================================
# 🔧  資料庫初始化設定
# ============================================================================

# 是否在啟動時自動測試所有資料庫連線
AUTO_TEST_CONNECTIONS = True

# 是否在啟動時自動初始化預設資料庫
AUTO_INITIALIZE_DATABASES = True

# 資料庫連線測試設定
CONNECTION_TEST_CONFIG = {
    "timeout": 5,                 # 測試超時時間 (秒)
    "retry_count": 3,             # 重試次數
    "retry_delay": 1,             # 重試延遲 (秒)
    "test_queries": {
        "postgresql": "SELECT 1",
        "mongodb": "db.runCommand({ping: 1})",
        "influxdb": "SHOW MEASUREMENTS",
        "mysql": "SELECT 1",
        "sqlite": "SELECT 1"
    }
}

# 資料庫健康檢查設定
HEALTH_CHECK_CONFIG = {
    "enabled": True,              # 是否啟用健康檢查
    "interval": 300,              # 檢查間隔 (秒)
    "timeout": 10,                # 檢查超時 (秒)
    "metrics": [
        "connection_status",       # 連線狀態
        "response_time",           # 響應時間
        "error_rate",              # 錯誤率
        "active_connections"       # 活躍連線數
    ]
}

# ============================================================================
# 🌍  環境特定配置
# ============================================================================

# 開發環境配置
DEVELOPMENT_CONFIG = {
    "postgresql": {
        "host": "localhost",
        "port": 5432,
        "database": "iiplatform_dev",
        "username": "postgres",
        "password": "postgres"
    },
    "mongodb": {
        "host": "localhost",
        "port": 27017,
        "database": "iiplatform_dev"
    },
    "influxdb": {
        "host": "localhost",
        "port": 8086,
        "database": "iiplatform_dev",
        "username": "admin",
        "password": "admin123"
    }
}

# 生產環境配置 (使用環境變數)
PRODUCTION_CONFIG = {
    "postgresql": {
        "host": "${POSTGRES_HOST}",
        "port": "${POSTGRES_PORT}",
        "database": "${POSTGRES_DB}",
        "username": "${POSTGRES_USER}",
        "password": "${POSTGRES_PASSWORD}"
    },
    "mongodb": {
        "host": "${MONGO_HOST}",
        "port": "${MONGO_PORT}",
        "database": "${MONGO_DB}",
        "username": "${MONGO_USER}",
        "password": "${MONGO_PASSWORD}"
    },
    "influxdb": {
        "host": "${INFLUXDB_HOST}",
        "port": "${INFLUXDB_PORT}",
        "database": "${INFLUXDB_BUCKET}",
        "username": "${INFLUXDB_USER}",
        "password": "${INFLUXDB_PASSWORD}",
        "token": "${INFLUXDB_TOKEN}",
        "org": "${INFLUXDB_ORG}"
    }
}

# 測試環境配置
TESTING_CONFIG = {
    "postgresql": {
        "host": "localhost",
        "port": 5432,
        "database": "iiplatform_test",
        "username": "postgres",
        "password": "postgres"
    },
    "mongodb": {
        "host": "localhost",
        "port": 27017,
        "database": "iiplatform_test"
    },
    "influxdb": {
        "host": "localhost",
        "port": 8086,
        "database": "iiplatform_test",
        "username": "admin",
        "password": "admin123"
    }
}

# ============================================================================
# 📋  預設資料庫連線列表
# ============================================================================

# 所有預設資料庫連線配置
DEFAULT_DATABASE_CONNECTIONS = {
    "postgresql": POSTGRESQL_CONFIG,
    "mongodb": MONGODB_CONFIG,
    "influxdb": INFLUXDB_CONFIG,
    "mysql": MYSQL_CONFIG,
    "sqlite": SQLITE_CONFIG
}

# 獲取預設資料庫連線配置
def get_default_connections(environment="development"):
    """獲取預設的資料庫連線配置"""
    config = DEFAULT_DATABASE_CONNECTIONS.copy()
    
    # 根據環境覆蓋配置
    if environment == "development":
        env_config = DEVELOPMENT_CONFIG
    elif environment == "production":
        env_config = PRODUCTION_CONFIG
    elif environment == "testing":
        env_config = TESTING_CONFIG
    else:
        env_config = DEVELOPMENT_CONFIG
    
    # 合併環境特定配置
    for db_type, env_settings in env_config.items():
        if db_type in config:
            config[db_type].update(env_settings)
    
    return config

# 獲取特定資料庫類型的配置
def get_database_config(db_type, environment="development"):
    """獲取特定資料庫類型的配置"""
    connections = get_default_connections(environment)
    return connections.get(db_type, {})

# 檢查資料庫配置是否完整
def validate_database_config(db_type, config):
    """驗證資料庫配置是否完整"""
    required_fields = {
        "postgresql": ["host", "port", "database", "username", "password"],
        "mongodb": ["host", "port", "database"],
        "influxdb": ["host", "port", "database"],
        "mysql": ["host", "port", "database", "username", "password"],
        "sqlite": ["database"]
    }
    
    if db_type not in required_fields:
        return False, f"不支援的資料庫類型: {db_type}"
    
    for field in required_fields[db_type]:
        if field not in config or not config[field]:
            return False, f"缺少必要欄位: {field}"
    
    return True, "配置驗證通過"

# 生成資料庫連線字串
def generate_connection_string(db_type, config):
    """生成資料庫連線字串"""
    from urllib.parse import quote_plus
    
    if db_type == "postgresql":
        username = quote_plus(config.get("username", ""))
        password = quote_plus(config.get("password", ""))
        return f"postgresql://{username}:{password}@{config['host']}:{config['port']}/{config['database']}"
    
    elif db_type == "mongodb":
        auth_part = ""
        if config.get("username") and config.get("password"):
            username = quote_plus(config["username"])
            password = quote_plus(config["password"])
            auth_part = f"{username}:{password}@"
        return f"mongodb://{auth_part}{config['host']}:{config['port']}/{config['database']}"
    
    elif db_type == "influxdb":
        return f"http://{config['host']}:{config['port']}"
    
    elif db_type == "mysql":
        username = quote_plus(config.get("username", ""))
        password = quote_plus(config.get("password", ""))
        return f"mysql://{username}:{password}@{config['host']}:{config['port']}/{config['database']}"
    
    elif db_type == "sqlite":
        return f"sqlite:///{config['database']}"
    
    else:
        return ""

# 獲取所有啟用的預設資料庫
def get_enabled_databases(environment="development"):
    """獲取所有啟用的預設資料庫"""
    connections = get_default_connections(environment)
    enabled = []
    
    for db_type, config in connections.items():
        if config.get("is_default", False):
            enabled.append({
                "db_type": db_type,
                "name": config.get("name", f"{db_type} 資料庫"),
                "config": config,
                "connection_string": generate_connection_string(db_type, config)
            })
    
    return enabled

# 如果直接執行此檔案，顯示當前配置
if __name__ == "__main__":
    print("🔧 IIPlatform 預設資料庫連線配置")
    print("=" * 50)
    
    # 顯示開發環境配置
    dev_connections = get_default_connections("development")
    print("\n📋 開發環境配置:")
    for db_type, config in dev_connections.items():
        if config.get("is_default", False):
            print(f"  ✅ {db_type}: {config['name']}")
            print(f"     主機: {config.get('host', 'N/A')}:{config.get('port', 'N/A')}")
            print(f"     資料庫: {config.get('database', 'N/A')}")
            print(f"     用戶: {config.get('username', 'N/A')}")
            print()
    
    # 顯示啟用的資料庫
    enabled_dbs = get_enabled_databases("development")
    print(f"\n🎯 啟用的預設資料庫數量: {len(enabled_dbs)}")
    
    print("\n💡 提示：修改此檔案中的配置值來設定您的預設資料庫連線") 