# 🗄️ 本地資料庫設置指南

## 📋 概述

本文檔說明如何將 IIPlatform 的資料庫連線從遠端改為本地端，以及如何設置本地資料庫服務。

## ✅ 已完成的配置修改

以下配置檔案已經修改為本地端設定：

### 1. `backend/app/config/default_database_connections.py`
- PostgreSQL: `localhost:5432/iiplatform`
- MongoDB: `localhost:27017/iiplatform`
- InfluxDB: `localhost:8086/iiplatform`

### 2. `backend/app/config/database_settings.py`
- 所有資料庫主機地址已改為 `localhost`

## 🚀 本地資料庫安裝與設置

### PostgreSQL 安裝

#### Windows
```bash
# 使用 Chocolatey
choco install postgresql

# 或下載安裝包
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# 使用 Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 初始設置
```bash
# 創建資料庫和用戶
sudo -u postgres psql
CREATE DATABASE iiplatform;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE iiplatform TO postgres;
\q
```

### MongoDB 安裝

#### Windows
```bash
# 使用 Chocolatey
choco install mongodb

# 或下載安裝包
# https://www.mongodb.com/try/download/community
```

#### macOS
```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# 添加 MongoDB 官方倉庫
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 初始設置
```bash
# 連接到 MongoDB
mongosh

# 創建資料庫
use iiplatform

# 創建用戶 (可選)
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: ["readWrite", "dbAdmin"]
})

exit
```

### InfluxDB 安裝

#### Windows
```bash
# 使用 Chocolatey
choco install influxdb

# 或下載安裝包
# https://portal.influxdata.com/downloads/
```

#### macOS
```bash
# 使用 Homebrew
brew install influxdb
brew services start influxdb
```

#### Linux (Ubuntu/Debian)
```bash
# 添加 InfluxData 官方倉庫
wget -qO - https://repos.influxdata.com/influxdb.key | sudo apt-key add -
echo "deb https://repos.influxdata.com/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/influxdb.list

sudo apt update
sudo apt install influxdb2
sudo systemctl start influxdb
sudo systemctl enable influxdb
```

#### 初始設置
```bash
# 設置 InfluxDB
influx setup \
  --username admin \
  --password admin123 \
  --org IIPlatform \
  --bucket iiplatform \
  --retention 30d \
  --force
```

## 🔧 驗證資料庫連線

### 1. 測試 PostgreSQL 連線
```bash
psql -h localhost -U postgres -d iiplatform
# 密碼: postgres
```

### 2. 測試 MongoDB 連線
```bash
mongosh mongodb://localhost:27017/iiplatform
```

### 3. 測試 InfluxDB 連線
```bash
influx ping
```

## 🚀 啟動平台

### 1. 確保所有資料庫服務正在運行
```bash
# PostgreSQL
sudo systemctl status postgresql

# MongoDB
sudo systemctl status mongod

# InfluxDB
sudo systemctl status influxdb
```

### 2. 啟動 IIPlatform
```bash
cd backend
python start_with_init.py
```

### 3. 或使用啟動腳本
```bash
# Windows
start_platform.bat

# Linux/macOS
./start_platform.sh
```

## 🔍 故障排除

### 常見問題

#### 1. 連線被拒絕
- 檢查資料庫服務是否正在運行
- 檢查防火牆設定
- 檢查資料庫配置檔案中的端口設定

#### 2. 認證失敗
- 檢查用戶名和密碼
- 確認用戶權限設定
- 檢查認證資料庫設定

#### 3. 資料庫不存在
- 手動創建資料庫
- 檢查資料庫名稱拼寫
- 確認用戶有創建資料庫的權限

### 日誌檢查
```bash
# PostgreSQL 日誌
sudo tail -f /var/log/postgresql/postgresql-*.log

# MongoDB 日誌
sudo tail -f /var/log/mongodb/mongod.log

# InfluxDB 日誌
sudo tail -f /var/log/influxdb/influxd.log
```

## 📚 相關文檔

- [PostgreSQL 官方文檔](https://www.postgresql.org/docs/)
- [MongoDB 官方文檔](https://docs.mongodb.com/)
- [InfluxDB 官方文檔](https://docs.influxdata.com/)

## 🆘 需要幫助？

如果遇到問題，請檢查：
1. 資料庫服務狀態
2. 連線配置
3. 防火牆設定
4. 系統日誌

或參考專案中的其他配置檔案進行對比。 