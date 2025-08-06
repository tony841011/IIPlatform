"""
數據處理配置檔案
包含預設的數據源配置和處理管道設置
"""

# 預設數據源配置
DEFAULT_DATA_SOURCES = {
    "mqtt_temperature_sensor": {
        "source_id": "mqtt_temperature_sensor",
        "type": "mqtt",
        "description": "溫度感測器 MQTT 數據源",
        "config": {
            "min_temperature": -50,
            "max_temperature": 150,
            "unit_conversions": {
                "temperature": {
                    "from": "celsius",
                    "to": "fahrenheit"
                }
            },
            "range_validations": {
                "temperature": {
                    "min": -50,
                    "max": 150
                },
                "humidity": {
                    "min": 0,
                    "max": 100
                }
            },
            "required_fields": ["temperature", "humidity", "timestamp"]
        }
    },
    
    "mqtt_pressure_sensor": {
        "source_id": "mqtt_pressure_sensor",
        "type": "mqtt",
        "description": "壓力感測器 MQTT 數據源",
        "config": {
            "min_pressure": 0,
            "max_pressure": 1000,
            "range_validations": {
                "pressure": {
                    "min": 0,
                    "max": 1000
                }
            },
            "required_fields": ["pressure", "timestamp"]
        }
    },
    
    "modbus_industrial_device": {
        "source_id": "modbus_industrial_device",
        "type": "modbus",
        "description": "工業設備 Modbus 數據源",
        "config": {
            "register_mappings": {
                "temperature": {"address": 100, "scale": 0.1},
                "pressure": {"address": 101, "scale": 0.01},
                "flow_rate": {"address": 102, "scale": 1.0}
            },
            "range_validations": {
                "temperature": {"min": -50, "max": 200},
                "pressure": {"min": 0, "max": 1000},
                "flow_rate": {"min": 0, "max": 10000}
            },
            "required_fields": ["temperature", "pressure", "flow_rate"]
        }
    },
    
    "postgresql_equipment_data": {
        "source_id": "postgresql_equipment_data",
        "type": "postgresql",
        "description": "設備資料庫查詢結果",
        "config": {
            "data_type_conversions": {
                "status": "str",
                "value": "float",
                "timestamp": "str"
            },
            "format_validations": {
                "status": {
                    "pattern": r"^(online|offline|error|maintenance)$"
                }
            },
            "required_fields": ["id", "status", "value", "timestamp"]
        }
    },
    
    "mongodb_log_data": {
        "source_id": "mongodb_log_data",
        "type": "mongodb",
        "description": "日誌資料庫查詢結果",
        "config": {
            "completeness_check": True,
            "format_validations": {
                "level": {
                    "pattern": r"^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$"
                }
            },
            "required_fields": ["timestamp", "level", "message"]
        }
    },
    
    "influxdb_metrics": {
        "source_id": "influxdb_metrics",
        "type": "influxdb",
        "description": "時序數據庫查詢結果",
        "config": {
            "time_series_aggregate": {
                "window_size": 5,
                "aggregation_type": "mean"
            },
            "rolling_average": {
                "window_size": 3
            },
            "statistical_aggregate": True
        }
    }
}

# 預設處理管道配置
DEFAULT_PROCESSING_PIPELINES = {
    "temperature_processing": [
        "temperature_filter",
        "range_validation",
        "unit_conversion",
        "statistical_aggregate"
    ],
    
    "pressure_processing": [
        "pressure_filter",
        "range_validation",
        "outlier_filter",
        "statistical_aggregate"
    ],
    
    "modbus_processing": [
        "completeness_check",
        "range_validation",
        "data_type_conversion",
        "statistical_aggregate"
    ],
    
    "database_processing": [
        "completeness_check",
        "format_validation",
        "data_type_conversion"
    ],
    
    "advanced_processing": [
        "outlier_filter",
        "range_validation",
        "min_max_normalize",
        "statistical_aggregate",
        "time_series_aggregate"
    ]
}

# 處理器配置
PROCESSOR_CONFIGS = {
    "temperature_filter": {
        "description": "溫度過濾器",
        "category": "filter",
        "parameters": {
            "min_temperature": {"type": "float", "default": -50, "description": "最小溫度"},
            "max_temperature": {"type": "float", "default": 150, "description": "最大溫度"}
        }
    },
    
    "pressure_filter": {
        "description": "壓力過濾器",
        "category": "filter",
        "parameters": {
            "min_pressure": {"type": "float", "default": 0, "description": "最小壓力"},
            "max_pressure": {"type": "float", "default": 1000, "description": "最大壓力"}
        }
    },
    
    "outlier_filter": {
        "description": "異常值過濾器",
        "category": "filter",
        "parameters": {
            "iqr_multiplier": {"type": "float", "default": 1.5, "description": "IQR 倍數"}
        }
    },
    
    "range_validation": {
        "description": "範圍驗證",
        "category": "validate",
        "parameters": {
            "field_ranges": {"type": "dict", "description": "欄位範圍配置"}
        }
    },
    
    "format_validation": {
        "description": "格式驗證",
        "category": "validate",
        "parameters": {
            "field_patterns": {"type": "dict", "description": "欄位格式配置"}
        }
    },
    
    "completeness_check": {
        "description": "完整性檢查",
        "category": "validate",
        "parameters": {
            "required_fields": {"type": "list", "description": "必要欄位列表"}
        }
    },
    
    "unit_conversion": {
        "description": "單位轉換",
        "category": "transform",
        "parameters": {
            "conversions": {"type": "dict", "description": "單位轉換配置"}
        }
    },
    
    "data_type_conversion": {
        "description": "數據類型轉換",
        "category": "transform",
        "parameters": {
            "type_mappings": {"type": "dict", "description": "類型映射配置"}
        }
    },
    
    "format_conversion": {
        "description": "格式轉換",
        "category": "transform",
        "parameters": {
            "target_format": {"type": "str", "default": "json", "description": "目標格式"}
        }
    },
    
    "statistical_aggregate": {
        "description": "統計聚合",
        "category": "aggregate",
        "parameters": {
            "include_stats": {"type": "list", "default": ["mean", "std", "min", "max"], "description": "包含的統計量"}
        }
    },
    
    "time_series_aggregate": {
        "description": "時間序列聚合",
        "category": "aggregate",
        "parameters": {
            "window_size": {"type": "int", "default": 5, "description": "窗口大小"},
            "aggregation_type": {"type": "str", "default": "mean", "description": "聚合類型"}
        }
    },
    
    "rolling_average": {
        "description": "滾動平均",
        "category": "aggregate",
        "parameters": {
            "window_size": {"type": "int", "default": 3, "description": "窗口大小"}
        }
    },
    
    "min_max_normalize": {
        "description": "最小-最大標準化",
        "category": "normalize",
        "parameters": {
            "normalization_ranges": {"type": "dict", "description": "標準化範圍配置"}
        }
    },
    
    "z_score_normalize": {
        "description": "Z-score 標準化",
        "category": "normalize",
        "parameters": {
            "z_score_configs": {"type": "dict", "description": "Z-score 配置"}
        }
    },
    
    "decimal_scaling": {
        "description": "小數縮放標準化",
        "category": "normalize",
        "parameters": {
            "scaling_configs": {"type": "dict", "description": "縮放配置"}
        }
    }
}

# 數據源類型映射
DATA_SOURCE_TYPE_MAPPING = {
    "mqtt": {
        "name": "MQTT",
        "icon": "ApiOutlined",
        "color": "#1890ff",
        "description": "MQTT 通訊協定數據源"
    },
    "modbus": {
        "name": "Modbus",
        "icon": "ThunderboltOutlined",
        "color": "#52c41a",
        "description": "Modbus 通訊協定數據源"
    },
    "opcua": {
        "name": "OPC UA",
        "icon": "ApiOutlined",
        "color": "#722ed1",
        "description": "OPC UA 通訊協定數據源"
    },
    "postgresql": {
        "name": "PostgreSQL",
        "icon": "DatabaseOutlined",
        "color": "#722ed1",
        "description": "PostgreSQL 資料庫數據源"
    },
    "mongodb": {
        "name": "MongoDB",
        "icon": "DatabaseOutlined",
        "color": "#13c2c2",
        "description": "MongoDB 資料庫數據源"
    },
    "influxdb": {
        "name": "InfluxDB",
        "icon": "DatabaseOutlined",
        "color": "#fa8c16",
        "description": "InfluxDB 時序資料庫數據源"
    }
}

# 處理器類別映射
PROCESSOR_CATEGORY_MAPPING = {
    "filter": {
        "name": "過濾",
        "icon": "FilterOutlined",
        "color": "#1890ff",
        "description": "數據過濾處理器"
    },
    "validate": {
        "name": "驗證",
        "icon": "CheckCircleOutlined",
        "color": "#52c41a",
        "description": "數據驗證處理器"
    },
    "transform": {
        "name": "轉換",
        "icon": "SyncOutlined",
        "color": "#722ed1",
        "description": "數據轉換處理器"
    },
    "aggregate": {
        "name": "聚合",
        "icon": "BarChartOutlined",
        "color": "#fa8c16",
        "description": "數據聚合處理器"
    },
    "normalize": {
        "name": "標準化",
        "icon": "LineChartOutlined",
        "color": "#13c2c2",
        "description": "數據標準化處理器"
    }
} 