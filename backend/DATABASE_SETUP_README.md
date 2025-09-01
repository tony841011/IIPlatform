# 🗄️ IIPlatform 資料庫設定指南

## 📋 概述

IIPlatform 支援多種資料庫類型，包括：
- **PostgreSQL**: 主要關聯式資料庫
- **MongoDB**: 文檔資料庫
- **InfluxDB**: 時序資料庫
- **MySQL**: 備用關聯式資料庫

## 🚀 快速設定

### 方法 1: 互動式設定 (推薦)

執行互動式設定腳本：

```bash
cd backend
python setup_database.py
```

按照提示輸入您的資料庫資訊，腳本會自動生成配置檔案。

### 方法 2: 手動編輯

直接編輯 `app/config/database_settings.py` 檔案：

```python
# PostgreSQL 主資料庫
POSTGRESQL = {
    "host": "localhost",           # 修改為您的資料庫主機
    "port": 5432,                 # 修改為您的資料庫端口
    "database": "iiplatform",     # 修改為您的資料庫名稱
    "username": "postgres",       # 修改為您的用戶名
    "password": "postgres",       # 修改為您的密碼
    "is_default": True            # 設為 True 表示啟用此資料庫
}

# MongoDB 文檔資料庫
MONGODB = {
    "host": "localhost",          # 修改為您的資料庫主機
    "port": 27017,                # 修改為您的資料庫端口
    "database": "iiplatform",     # 修改為您的資料庫名稱
    "username": "",               # 用戶名 (留空表示無認證)
    "password": "",               # 密碼 (留空表示無認證)
    "is_default": True            # 設為 True 表示啟用此資料庫
}

# InfluxDB 時序資料庫
INFLUXDB = {
    "host": "localhost",          # 修改為您的資料庫主機
    "port": 8086,                 # 修改為您的資料庫端口
    "database": "iiplatform",     # 修改為您的資料庫名稱
    "username": "admin",          # 修改為您的用戶名
    "password": "admin123",       # 修改為您的密碼
    "is_default": True            # 設為 True 表示啟用此資料庫
}
```

## 🔧 資料庫配置選項

### PostgreSQL 配置

| 欄位 | 說明 | 範例 |
|------|------|------|
| `host` | 資料庫主機地址 | `localhost`, `192.168.1.100` |
| `port` | 資料庫端口 | `5432` |
| `database` | 資料庫名稱 | `iiplatform` |
| `username` | 用戶名 | `postgres`, `iiplatform_user` |
| `password` | 密碼 | `your_password` |
| `is_default` | 是否為預設資料庫 | `True` 或 `False` |

### MongoDB 配置

| 欄位 | 說明 | 範例 |
|------|------|------|
| `host` | 資料庫主機地址 | `localhost`, `192.168.1.100` |
| `port` | 資料庫端口 | `27017` |
| `database` | 資料庫名稱 | `iiplatform` |
| `username` | 用戶名 (可選) | `admin`, `iiplatform_user` |
| `password` | 密碼 (可選) | `your_password` |
| `is_default` | 是否為預設資料庫 | `True` 或 `False` |

### InfluxDB 配置

| 欄位 | 說明 | 範例 |
|------|------|------|
| `host` | 資料庫主機地址 | `localhost`, `192.168.1.100` |
| `port` | 資料庫端口 | `8086` |
| `database` | 資料庫名稱 | `iiplatform` |
| `username` | 用戶名 | `admin`, `iiplatform_user` |
| `password` | 密碼 | `your_password` |
| `is_default` | 是否為預設資料庫 | `True` 或 `False` |

## 🌍 環境配置

### 開發環境

```python
# 本地開發環境
POSTGRESQL = {
    "host": "localhost",
    "port": 5432,
    "database": "iiplatform_dev",
    "username": "postgres",
    "password": "postgres",
    "is_default": True
}
```

### 生產環境

```python
# 生產環境 (使用環境變數)
POSTGRESQL = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", "5432")),
    "database": os.getenv("POSTGRES_DB", "iiplatform"),
    "username": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", ""),
    "is_default": True
}
```

## 📝 設定步驟

### 1. 準備資料庫

確保您的資料庫服務正在運行：

```bash
# PostgreSQL
sudo systemctl status postgresql

# MongoDB
sudo systemctl status mongod

# InfluxDB
sudo systemctl status influxdb
```

### 2. 創建資料庫

```sql
-- PostgreSQL
CREATE DATABASE iiplatform;
CREATE USER iiplatform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE iiplatform TO iiplatform_user;

-- MongoDB (使用 mongo shell)
use iiplatform
db.createUser({
  user: "iiplatform_user",
  pwd: "your_password",
  roles: ["readWrite"]
})

-- InfluxDB (使用 influx CLI)
influx bucket create -n iiplatform
```

### 3. 設定連線

使用互動式腳本或手動編輯配置檔案。

### 4. 初始化資料庫

```bash
cd backend
python init_database.py
```

### 5. 啟動平台

```bash
python main.py
```

## 🔍 故障排除

### 常見問題

#### 1. 連線被拒絕

**錯誤**: `Connection refused`

**解決方案**:
- 檢查資料庫服務是否運行
- 檢查防火牆設定
- 檢查資料庫配置檔案中的 bind 地址

#### 2. 認證失敗

**錯誤**: `Authentication failed`

**解決方案**:
- 檢查用戶名和密碼
- 確認用戶有適當的權限
- 檢查資料庫的認證設定

#### 3. 資料庫不存在

**錯誤**: `Database does not exist`

**解決方案**:
- 創建資料庫
- 檢查資料庫名稱拼寫
- 確認用戶有創建資料庫的權限

### 測試連線

```bash
# 測試 PostgreSQL
psql -h localhost -U postgres -d iiplatform

# 測試 MongoDB
mongo localhost:27017/iiplatform

# 測試 InfluxDB
influx -host localhost -port 8086
```

## 📚 進階配置

### 連線池設定

```python
# 在 database_settings.py 中添加
POSTGRESQL = {
    # ... 基本配置 ...
    "connection_pool_size": 20,
    "max_overflow": 30,
    "pool_timeout": 30,
    "pool_recycle": 3600
}
```

### SSL 連線

```python
POSTGRESQL = {
    # ... 基本配置 ...
    "ssl_enabled": True,
    "ssl_ca": "/path/to/ca.crt",
    "ssl_cert": "/path/to/client.crt",
    "ssl_key": "/path/to/client.key"
}
```

### 複製集配置 (MongoDB)

```python
MONGODB = {
    # ... 基本配置 ...
    "replica_set": "rs0",
    "read_preference": "secondaryPreferred",
    "write_concern": "majority"
}
```

## 🆘 需要幫助？

如果遇到問題，請：

1. 檢查日誌檔案
2. 確認資料庫服務狀態
3. 測試資料庫連線
4. 查看錯誤訊息
5. 參考資料庫官方文檔

## 📞 支援

- 📧 郵件: support@iiplatform.com
- 📖 文檔: https://docs.iiplatform.com
- 🐛 問題回報: https://github.com/iiplatform/issues 