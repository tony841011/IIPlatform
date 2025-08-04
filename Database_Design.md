# IIPlatform 資料庫設計文檔

## 概述

本文檔詳細描述了 IIPlatform 工業物聯網平台的資料庫架構設計，採用多資料庫策略以滿足不同類型的數據需求：

- **PostgreSQL**: 主要業務資料庫，存儲結構化數據
- **MongoDB**: 文檔資料庫，存儲非結構化配置和日誌
- **InfluxDB**: 時序資料庫，存儲設備感測器數據和監控指標

## 1. PostgreSQL - 主要業務資料庫

### 1.1 用戶管理模組

#### users (用戶表)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    department VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    login_count INTEGER DEFAULT 0,
    failed_login_count INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### roles (角色表)
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 10,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### permissions (權限表)
```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES permission_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### permission_categories (權限分類表)
```sql
CREATE TABLE permission_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### role_permissions (角色權限關聯表)
```sql
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

### 1.2 設備管理模組

#### devices (設備表)
```sql
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'offline',
    last_heartbeat TIMESTAMP,
    firmware_version VARCHAR(50),
    ip_address INET,
    mac_address VARCHAR(17),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### device_groups (設備群組表)
```sql
CREATE TABLE device_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### device_group_members (設備群組成員表)
```sql
CREATE TABLE device_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES device_groups(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, device_id)
);
```

#### device_commands (設備命令表)
```sql
CREATE TABLE device_commands (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    command_type VARCHAR(50) NOT NULL,
    command_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    result JSONB,
    created_by INTEGER REFERENCES users(id)
);
```

### 1.3 通知管理模組

#### notification_preferences (通知偏好表)
```sql
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    teams_notifications BOOLEAN DEFAULT true,
    wechat_notifications BOOLEAN DEFAULT false,
    slack_notifications BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) DEFAULT 'immediate',
    quiet_hours_enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Taipei',
    language VARCHAR(10) DEFAULT 'zh-TW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notification_groups (通知群組表)
```sql
CREATE TABLE notification_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    notification_types TEXT[],
    channels TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notification_history (通知歷史表)
```sql
CREATE TABLE notification_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    priority VARCHAR(10) DEFAULT 'normal',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    recipient VARCHAR(100),
    metadata JSONB
);
```

### 1.4 警報管理模組

#### alerts (警報表)
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'active',
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### alert_rules (警報規則表)
```sql
CREATE TABLE alert_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    device_id INTEGER REFERENCES devices(id),
    condition_type VARCHAR(50) NOT NULL,
    condition_config JSONB,
    severity VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.5 系統設定模組

#### system_settings (系統設定表)
```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### platform_intro (平台簡介表)
```sql
CREATE TABLE platform_intro (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### platform_photos (平台照片表)
```sql
CREATE TABLE platform_photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. MongoDB - 文檔資料庫

### 2.1 設備配置文檔

```javascript
// device_configs 集合
{
  "_id": ObjectId("..."),
  "device_id": "DEVICE_001",
  "config": {
    "sensors": [
      {
        "id": "temp_sensor_1",
        "name": "溫度感測器 1",
        "type": "temperature",
        "unit": "celsius",
        "range": {"min": -40, "max": 85},
        "calibration": {
          "offset": 0.5,
          "scale": 1.0
        },
        "location": "設備頂部",
        "sampling_rate": 60
      },
      {
        "id": "vib_sensor_1",
        "name": "振動感測器 1",
        "type": "vibration",
        "unit": "mm/s",
        "range": {"min": 0, "max": 50},
        "location": "馬達軸承",
        "sampling_rate": 1000
      }
    ],
    "communication": {
      "protocol": "MQTT",
      "broker": "mqtt.company.com",
      "port": 1883,
      "topic": "devices/DEVICE_001",
      "qos": 1,
      "keepalive": 60
    },
    "alerts": [
      {
        "id": "temp_alert_1",
        "name": "高溫警報",
        "condition": "temperature > 80",
        "action": "send_notification",
        "priority": "high",
        "enabled": true
      },
      {
        "id": "vib_alert_1",
        "name": "振動異常警報",
        "condition": "vibration > 30",
        "action": "send_notification",
        "priority": "medium",
        "enabled": true
      }
    ],
    "maintenance": {
      "schedule": "monthly",
      "last_maintenance": ISODate("2024-01-01T00:00:00Z"),
      "next_maintenance": ISODate("2024-02-01T00:00:00Z"),
      "checklist": [
        "檢查溫度感測器",
        "清潔設備表面",
        "檢查連接線"
      ]
    }
  },
  "metadata": {
    "manufacturer": "Company A",
    "model": "IoT-Device-2024",
    "serial_number": "SN2024001",
    "firmware_version": "1.2.3",
    "hardware_version": "2.1.0",
    "installation_date": ISODate("2024-01-01T00:00:00Z"),
    "warranty_expiry": ISODate("2027-01-01T00:00:00Z")
  },
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

### 2.2 AI 模型配置文檔

```javascript
// ai_models 集合
{
  "_id": ObjectId("..."),
  "model_id": "anomaly_detection_001",
  "name": "設備異常檢測模型",
  "type": "anomaly_detection",
  "version": "1.0.0",
  "status": "active", // active, inactive, training, deployed
  "config": {
    "algorithm": "isolation_forest",
    "parameters": {
      "contamination": 0.1,
      "n_estimators": 100,
      "max_samples": "auto",
      "random_state": 42
    },
    "features": [
      {
        "name": "temperature",
        "type": "numeric",
        "unit": "celsius",
        "weight": 0.4
      },
      {
        "name": "vibration",
        "type": "numeric",
        "unit": "mm/s",
        "weight": 0.3
      },
      {
        "name": "current",
        "type": "numeric",
        "unit": "A",
        "weight": 0.3
      }
    ],
    "training_data": {
      "start_date": ISODate("2024-01-01T00:00:00Z"),
      "end_date": ISODate("2024-01-10T23:59:59Z"),
      "sample_count": 10000,
      "data_source": "device_sensors"
    },
    "deployment": {
      "target_devices": ["DEVICE_001", "DEVICE_002"],
      "update_frequency": "hourly",
      "threshold": 0.8
    }
  },
  "performance": {
    "accuracy": 0.95,
    "precision": 0.92,
    "recall": 0.88,
    "f1_score": 0.90,
    "confusion_matrix": [[950, 50], [120, 880]],
    "last_evaluation": ISODate("2024-01-15T10:30:00Z")
  },
  "training_history": [
    {
      "version": "1.0.0",
      "started_at": ISODate("2024-01-10T09:00:00Z"),
      "completed_at": ISODate("2024-01-10T11:30:00Z"),
      "duration_minutes": 150,
      "data_samples": 10000,
      "performance": {
        "accuracy": 0.95,
        "precision": 0.92,
        "recall": 0.88,
        "f1_score": 0.90
      }
    }
  ],
  "created_by": "admin",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

### 2.3 報表模板文檔

```javascript
// report_templates 集合
{
  "_id": ObjectId("..."),
  "template_id": "daily_report_001",
  "name": "每日設備狀態報表",
  "type": "daily", // daily, weekly, monthly, custom
  "description": "每日設備運行狀態和異常統計報表",
  "config": {
    "sections": [
      {
        "id": "overview",
        "title": "設備概況",
        "type": "statistics",
        "metrics": [
          {
            "name": "total_devices",
            "label": "總設備數",
            "type": "count"
          },
          {
            "name": "online_devices",
            "label": "在線設備數",
            "type": "count",
            "condition": "status = 'online'"
          },
          {
            "name": "offline_devices",
            "label": "離線設備數",
            "type": "count",
            "condition": "status = 'offline'"
          }
        ]
      },
      {
        "id": "anomaly_stats",
        "title": "異常統計",
        "type": "chart",
        "chart_type": "bar",
        "data_source": "anomaly_events",
        "time_range": "24h",
        "dimensions": ["device_id", "alert_type"],
        "metrics": ["count", "severity_level"]
      },
      {
        "id": "performance_trends",
        "title": "效能趨勢",
        "type": "chart",
        "chart_type": "line",
        "data_source": "device_metrics",
        "time_range": "7d",
        "metrics": ["temperature", "vibration", "current"]
      }
    ],
    "recipients": [
      {
        "type": "email",
        "address": "admin@company.com",
        "name": "系統管理員"
      },
      {
        "type": "email",
        "address": "manager@company.com",
        "name": "部門經理"
      }
    ],
    "schedule": {
      "frequency": "daily",
      "time": "09:00",
      "timezone": "Asia/Taipei",
      "enabled": true
    },
    "export": {
      "formats": ["pdf", "excel"],
      "include_charts": true,
      "include_tables": true
    }
  },
  "created_by": "admin",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

### 2.4 系統日誌文檔

```javascript
// system_logs 集合
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2024-01-15T10:30:00Z"),
  "level": "INFO", // DEBUG, INFO, WARNING, ERROR, CRITICAL
  "service": "device_management",
  "module": "device_controller",
  "user_id": "admin",
  "session_id": "session_123456",
  "request_id": "req_789012",
  "action": "device_status_update",
  "details": {
    "device_id": "DEVICE_001",
    "old_status": "offline",
    "new_status": "online",
    "ip_address": "192.168.1.100",
    "response_time_ms": 150
  },
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.50",
    "request_method": "POST",
    "request_path": "/api/devices/001/status",
    "response_code": 200
  },
  "tags": ["device", "status_update", "online"]
}
```

## 3. InfluxDB - 時序資料庫

### 3.1 資料庫和保留策略

```sql
-- 創建資料庫
CREATE DATABASE iot_platform

-- 創建保留策略
CREATE RETENTION POLICY "hot_data" ON "iot_platform" DURATION 7d REPLICATION 1;
CREATE RETENTION POLICY "warm_data" ON "iot_platform" DURATION 30d REPLICATION 1;
CREATE RETENTION POLICY "cold_data" ON "iot_platform" DURATION 1y REPLICATION 1;
CREATE RETENTION POLICY "archive_data" ON "iot_platform" DURATION 5y REPLICATION 1 DEFAULT;
```

### 3.2 設備感測器數據

```sql
-- 設備感測器數據
measurement: device_sensors
tags:
  - device_id: "DEVICE_001"
  - sensor_type: "temperature"
  - sensor_id: "temp_sensor_1"
  - location: "設備頂部"
  - unit: "celsius"
  - manufacturer: "Company A"
fields:
  - value: 25.6 (float)
  - quality: "good" (string)
  - status: "active" (string)
  - battery_level: 85 (integer)
timestamp: 2024-01-15T10:30:00Z
```

### 3.3 設備狀態數據

```sql
-- 設備狀態數據
measurement: device_status
tags:
  - device_id: "DEVICE_001"
  - device_type: "iot_device"
  - location: "生產線A"
  - department: "製造部"
fields:
  - status: "online" (string)
  - cpu_usage: 45.2 (float)
  - memory_usage: 67.8 (float)
  - disk_usage: 23.1 (float)
  - temperature: 42.5 (float)
  - uptime_seconds: 86400 (integer)
  - network_latency_ms: 15 (integer)
timestamp: 2024-01-15T10:30:00Z
```

### 3.4 系統效能指標

```sql
-- 系統效能指標
measurement: system_metrics
tags:
  - service: "api_gateway"
  - instance: "api-01"
  - environment: "production"
  - version: "1.2.3"
fields:
  - response_time_ms: 125 (float)
  - throughput_rps: 150.5 (float)
  - error_rate: 0.02 (float)
  - active_connections: 45 (integer)
  - memory_usage_mb: 512 (integer)
  - cpu_usage_percent: 35.2 (float)
timestamp: 2024-01-15T10:30:00Z
```

### 3.5 AI 分析結果

```sql
-- AI 分析結果
measurement: ai_analysis
tags:
  - device_id: "DEVICE_001"
  - model_id: "anomaly_detection_001"
  - analysis_type: "anomaly_detection"
  - model_version: "1.0.0"
fields:
  - anomaly_score: 0.85 (float)
  - prediction_value: 0.92 (float)
  - confidence: 0.88 (float)
  - status: "anomaly_detected" (string)
  - severity: "medium" (string)
  - features_used: 3 (integer)
timestamp: 2024-01-15T10:30:00Z
```

### 3.6 警報事件

```sql
-- 警報事件
measurement: alert_events
tags:
  - device_id: "DEVICE_001"
  - alert_type: "temperature_high"
  - severity: "high"
  - category: "sensor"
fields:
  - alert_id: "alert_123456" (string)
  - threshold_value: 80.0 (float)
  - actual_value: 85.2 (float)
  - status: "active" (string)
  - acknowledged: false (boolean)
  - resolved: false (boolean)
timestamp: 2024-01-15T10:30:00Z
```

## 4. 資料庫連接配置

### 4.1 後端配置 (Python)

```python
# config/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
from influxdb_client import InfluxDBClient
import os

# PostgreSQL 配置
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://user:password@localhost:5432/iot_platform")
engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# MongoDB 配置
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
mongo_client = MongoClient(MONGO_URL)
mongo_db = mongo_client.iot_platform

# InfluxDB 配置
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "your-token")
INFLUX_ORG = os.getenv("INFLUX_ORG", "your-org")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "iot_platform")

influx_client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)

# 資料庫連接管理
def get_postgres_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    return mongo_db

def get_influx_client():
    return influx_client
```

### 4.2 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15
    container_name: iot_postgres
    environment:
      POSTGRES_DB: iot_platform
      POSTGRES_USER: iot_user
      POSTGRES_PASSWORD: iot_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - iot_network

  # MongoDB
  mongodb:
    image: mongo:7
    container_name: iot_mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: iot_user
      MONGO_INITDB_ROOT_PASSWORD: iot_password
      MONGO_INITDB_DATABASE: iot_platform
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - iot_network

  # InfluxDB
  influxdb:
    image: influxdb:2.7
    container_name: iot_influxdb
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: iot_user
      DOCKER_INFLUXDB_INIT_PASSWORD: iot_password
      DOCKER_INFLUXDB_INIT_ORG: iot_org
      DOCKER_INFLUXDB_INIT_BUCKET: iot_platform
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: iot_admin_token
    ports:
      - "8086:8086"
    volumes:
      - influxdb_data:/var/lib/influxdb2
    networks:
      - iot_network

volumes:
  postgres_data:
  mongodb_data:
  influxdb_data:

networks:
  iot_network:
    driver: bridge
```

## 5. 效能優化策略

### 5.1 PostgreSQL 優化

```sql
-- 創建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_location ON devices(location);
CREATE INDEX idx_notifications_sent_at ON notification_history(sent_at);
CREATE INDEX idx_alerts_device_id ON alerts(device_id);
CREATE INDEX idx_alerts_status ON alerts(status);

-- 分區表 (針對大量數據)
CREATE TABLE device_data_2024 PARTITION OF device_data
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 全文搜索索引
CREATE INDEX idx_devices_name_fts ON devices USING gin(to_tsvector('chinese', name));
```

### 5.2 MongoDB 優化

```javascript
// 創建索引
db.device_configs.createIndex({ "device_id": 1 });
db.device_configs.createIndex({ "metadata.manufacturer": 1 });
db.ai_models.createIndex({ "status": 1, "created_at": -1 });
db.ai_models.createIndex({ "model_id": 1 });
db.report_templates.createIndex({ "type": 1, "created_at": -1 });
db.system_logs.createIndex({ "timestamp": -1, "level": 1 });
db.system_logs.createIndex({ "service": 1, "timestamp": -1 });
db.system_logs.createIndex({ "user_id": 1, "timestamp": -1 });

// 複合索引
db.device_configs.createIndex({ "device_id": 1, "updated_at": -1 });
db.ai_models.createIndex({ "type": 1, "status": 1, "created_at": -1 });
```

### 5.3 InfluxDB 優化

```sql
-- 創建標籤索引
CREATE TAG INDEX idx_device_sensors_device_id ON device_sensors(device_id);
CREATE TAG INDEX idx_device_sensors_sensor_type ON device_sensors(sensor_type);
CREATE TAG INDEX idx_device_status_device_id ON device_status(device_id);
CREATE TAG INDEX idx_system_metrics_service ON system_metrics(service);
CREATE TAG INDEX idx_ai_analysis_device_id ON ai_analysis(device_id);

-- 設定資料保留策略
CREATE RETENTION POLICY "hot_data" ON "iot_platform" DURATION 7d REPLICATION 1;
CREATE RETENTION POLICY "warm_data" ON "iot_platform" DURATION 30d REPLICATION 1;
CREATE RETENTION POLICY "cold_data" ON "iot_platform" DURATION 1y REPLICATION 1;

-- 連續查詢 (用於數據聚合)
CREATE CONTINUOUS QUERY "device_hourly_stats" ON "iot_platform"
BEGIN
  SELECT mean("value") as "avg_value", max("value") as "max_value", min("value") as "min_value"
  FROM "device_sensors"
  GROUP BY time(1h), "device_id", "sensor_type"
END;
```

## 6. 備份和恢復策略

### 6.1 備份腳本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# PostgreSQL 備份
pg_dump -h localhost -U iot_user -d iot_platform > $BACKUP_DIR/postgres_$(date +%Y%m%d_%H%M%S).sql

# MongoDB 備份
mongodump --host localhost --port 27017 --username iot_user --password iot_password --db iot_platform --out $BACKUP_DIR/mongo_$(date +%Y%m%d_%H%M%S)

# InfluxDB 備份
influx backup --host http://localhost:8086 --token iot_admin_token $BACKUP_DIR/influx_$(date +%Y%m%d_%H%M%S)

# 壓縮備份文件
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

### 6.2 恢復腳本

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
BACKUP_DIR="/tmp/restore_$(date +%Y%m%d_%H%M%S)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

# 解壓備份文件
tar -xzf $BACKUP_FILE -C /tmp
RESTORE_DIR=$(find /tmp -name "backup_*" -type d | head -1)

# PostgreSQL 恢復
psql -h localhost -U iot_user -d iot_platform < $RESTORE_DIR/postgres_*.sql

# MongoDB 恢復
mongorestore --host localhost --port 27017 --username iot_user --password iot_password $RESTORE_DIR/mongo_*

# InfluxDB 恢復
influx restore --host http://localhost:8086 --token iot_admin_token $RESTORE_DIR/influx_*

# 清理臨時文件
rm -rf $RESTORE_DIR

echo "Restore completed from: $BACKUP_FILE"
```

## 7. 監控和維護

### 7.1 資料庫監控指標

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['localhost:9216']

  - job_name: 'influxdb'
    static_configs:
      - targets: ['localhost:8086']
```

### 7.2 資料庫健康檢查

```python
# health_check.py
import psycopg2
from pymongo import MongoClient
from influxdb_client import InfluxDBClient
import os

def check_postgres():
    try:
        conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"PostgreSQL health check failed: {e}")
        return False

def check_mongodb():
    try:
        client = MongoClient(os.getenv("MONGO_URL"))
        client.admin.command('ping')
        client.close()
        return True
    except Exception as e:
        print(f"MongoDB health check failed: {e}")
        return False

def check_influxdb():
    try:
        client = InfluxDBClient(
            url=os.getenv("INFLUX_URL"),
            token=os.getenv("INFLUX_TOKEN"),
            org=os.getenv("INFLUX_ORG")
        )
        client.ping()
        client.close()
        return True
    except Exception as e:
        print(f"InfluxDB health check failed: {e}")
        return False

if __name__ == "__main__":
    postgres_ok = check_postgres()
    mongodb_ok = check_mongodb()
    influxdb_ok = check_influxdb()
    
    print(f"PostgreSQL: {'OK' if postgres_ok else 'FAIL'}")
    print(f"MongoDB: {'OK' if mongodb_ok else 'FAIL'}")
    print(f"InfluxDB: {'OK' if influxdb_ok else 'FAIL'}")
```

## 8. 安全配置

### 8.1 資料庫安全設定

```sql
-- PostgreSQL 安全設定
-- 創建只讀用戶
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE iot_platform TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 創建應用用戶
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE iot_platform TO app_user;
GRANT USAGE, CREATE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

```javascript
// MongoDB 安全設定
// 創建應用用戶
use iot_platform
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "iot_platform" }
  ]
})

// 創建只讀用戶
db.createUser({
  user: "readonly_user",
  pwd: "readonly_password",
  roles: [
    { role: "read", db: "iot_platform" }
  ]
})
``` 