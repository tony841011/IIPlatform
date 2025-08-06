"""
資料庫連線配置檔案
包含預設的資料庫連線設定和初始化配置
"""

# 預設資料庫連線配置
DEFAULT_DATABASE_CONNECTIONS = {
    "postgresql": {
        "name": "PostgreSQL 主資料庫",
        "db_type": "postgresql",
        "host": "localhost",
        "port": 5432,
        "database": "iiplatform",
        "username": "postgres",
        "password": "postgres",
        "description": "平台主要關聯式資料庫，用於存儲設備、用戶、權限等核心數據",
        "is_default": True,
        "auto_initialize": True
    },
    
    "mongodb": {
        "name": "MongoDB 文檔資料庫",
        "db_type": "mongodb",
        "host": "localhost",
        "port": 27017,
        "database": "iiplatform",
        "username": "",
        "password": "",
        "description": "文檔資料庫，用於存儲日誌、事件記錄、非結構化數據",
        "is_default": True,
        "auto_initialize": True
    },
    
    "influxdb": {
        "name": "InfluxDB 時序資料庫",
        "db_type": "influxdb",
        "host": "localhost",
        "port": 8086,
        "database": "iiplatform",
        "username": "admin",
        "password": "admin123",
        "description": "時序資料庫，用於存儲感測器數據、監控指標、時間序列數據",
        "is_default": True,
        "auto_initialize": True
    },
    
    "mysql": {
        "name": "MySQL 備用資料庫",
        "db_type": "mysql",
        "host": "localhost",
        "port": 3306,
        "database": "iiplatform",
        "username": "root",
        "password": "root",
        "description": "備用關聯式資料庫，可選配置",
        "is_default": False,
        "auto_initialize": False
    }
}

# 資料庫初始化配置
DATABASE_INIT_CONFIG = {
    "postgresql": {
        "create_tables": True,
        "insert_sample_data": True,
        "create_indexes": True,
        "sample_data_config": {
            "devices": 10,
            "users": 5,
            "categories": 8
        }
    },
    
    "mongodb": {
        "create_collections": True,
        "insert_sample_data": True,
        "create_indexes": True,
        "collections": [
            "logs",
            "events",
            "analytics",
            "audit_trail"
        ]
    },
    
    "influxdb": {
        "create_buckets": True,
        "create_measurements": True,
        "insert_sample_data": True,
        "buckets": [
            "sensor_data",
            "system_metrics",
            "alerts"
        ]
    }
}

# 資料庫連線測試配置
CONNECTION_TEST_CONFIG = {
    "timeout": 5,  # 秒
    "retry_count": 3,
    "retry_delay": 1,  # 秒
    "test_queries": {
        "postgresql": "SELECT 1",
        "mongodb": "db.runCommand({ping: 1})",
        "influxdb": "SHOW MEASUREMENTS",
        "mysql": "SELECT 1"
    }
}

# 資料庫健康檢查配置
HEALTH_CHECK_CONFIG = {
    "enabled": True,
    "interval": 300,  # 秒
    "timeout": 10,  # 秒
    "metrics": [
        "connection_status",
        "response_time",
        "error_rate",
        "active_connections"
    ]
}

# 資料庫備份配置
BACKUP_CONFIG = {
    "enabled": True,
    "schedule": "0 2 * * *",  # 每天凌晨2點
    "retention_days": 30,
    "backup_path": "./backups",
    "databases": ["postgresql", "mongodb"]
}

# 資料庫安全配置
SECURITY_CONFIG = {
    "ssl_enabled": False,
    "encryption_enabled": False,
    "max_connections": 100,
    "connection_pool_size": 10,
    "password_encryption": "bcrypt"
}

# 環境特定的配置
ENVIRONMENT_CONFIGS = {
    "development": {
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
    },
    
    "production": {
        "postgresql": {
            "host": "prod-postgresql.example.com",
            "port": 5432,
            "database": "iiplatform_prod",
            "username": "${POSTGRES_USER}",
            "password": "${POSTGRES_PASSWORD}"
        },
        "mongodb": {
            "host": "prod-mongodb.example.com",
            "port": 27017,
            "database": "iiplatform_prod",
            "username": "${MONGO_USER}",
            "password": "${MONGO_PASSWORD}"
        },
        "influxdb": {
            "host": "prod-influxdb.example.com",
            "port": 8086,
            "database": "iiplatform_prod",
            "username": "${INFLUX_USER}",
            "password": "${INFLUX_PASSWORD}"
        }
    },
    
    "testing": {
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
}

# 獲取當前環境的配置
def get_environment_config(environment="development"):
    """獲取指定環境的資料庫配置"""
    if environment not in ENVIRONMENT_CONFIGS:
        environment = "development"
    
    env_config = ENVIRONMENT_CONFIGS[environment]
    config = {}
    
    for db_type, default_config in DEFAULT_DATABASE_CONNECTIONS.items():
        if db_type in env_config:
            config[db_type] = {**default_config, **env_config[db_type]}
        else:
            config[db_type] = default_config
    
    return config

# 獲取預設資料庫連線列表
def get_default_connections(environment="development"):
    """獲取預設的資料庫連線列表"""
    config = get_environment_config(environment)
    connections = []
    
    for db_type, db_config in config.items():
        if db_config.get("is_default", False):
            connections.append({
                "name": db_config["name"],
                "db_type": db_config["db_type"],
                "host": db_config["host"],
                "port": db_config["port"],
                "database": db_config["database"],
                "username": db_config["username"],
                "password": db_config["password"],
                "description": db_config["description"],
                "auto_initialize": db_config.get("auto_initialize", False)
            })
    
    return connections

# 獲取需要自動初始化的資料庫類型
def get_auto_initialize_databases(environment="development"):
    """獲取需要自動初始化的資料庫類型列表"""
    config = get_environment_config(environment)
    auto_init_dbs = []
    
    for db_type, db_config in config.items():
        if db_config.get("auto_initialize", False):
            auto_init_dbs.append(db_type)
    
    return auto_init_dbs 