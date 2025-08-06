# IIPlatform 完整建置流程指南

## 📋 目錄
- [第一階段：環境準備](#第一階段環境準備)
- [第二階段：資料庫設定](#第二階段資料庫設定)
- [第三階段：專案結構建立](#第三階段專案結構建立)
- [第四階段：後端建置](#第四階段後端建置)
- [第五階段：前端建置](#第五階段前端建置)
- [第六階段：通訊協定設定](#第六階段通訊協定設定)
- [第七階段：設備連線設定](#第七階段設備連線設定)
- [第八階段：啟動腳本](#第八階段啟動腳本)
- [第九階段：驗證測試](#第九階段驗證測試)
- [故障排除](#故障排除)

---

## 第一階段：環境準備

### 1. 系統需求檢查

```bash
# 檢查作業系統
uname -a

# 檢查 Python 版本 (需要 3.8+)
python3 --version

# 檢查 Node.js 版本 (需要 16+)
node --version

# 檢查 npm 版本
npm --version

# 檢查 Git
git --version
```

### 2. 安裝必要軟體

#### Ubuntu/Debian 系統
```bash
# 更新套件列表
sudo apt update

# 安裝 Python 相關
sudo apt install -y python3 python3-pip python3-venv

# 安裝 Node.js
sudo apt install -y nodejs npm

# 安裝資料庫
sudo apt install -y postgresql postgresql-contrib
sudo apt install -y mongodb
sudo apt install -y influxdb

# 安裝 Docker (可選)
sudo apt install -y docker.io docker-compose
```

#### Windows 系統
```bash
# 安裝 Python (從 python.org 下載)
# 安裝 Node.js (從 nodejs.org 下載)
# 安裝 PostgreSQL (從 postgresql.org 下載)
# 安裝 MongoDB (從 mongodb.com 下載)
# 安裝 InfluxDB (從 influxdata.com 下載)
```

### 3. 建立 Python 虛擬環境

```bash
# 建立虛擬環境
python3 -m venv iiplatform-env

# 啟動虛擬環境
# Linux/Mac:
source iiplatform-env/bin/activate
# Windows:
iiplatform-env\Scripts\activate

# 升級 pip
pip install --upgrade pip
```

---

## 第二階段：資料庫設定

### 1. PostgreSQL 設定

```bash
# 啟動 PostgreSQL 服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 建立資料庫和用戶
sudo -u postgres psql

# 在 PostgreSQL 中執行：
CREATE DATABASE iot_platform;
CREATE USER iot_user WITH PASSWORD 'iot_password_2024';
GRANT ALL PRIVILEGES ON DATABASE iot_platform TO iot_user;
\q
```

### 2. MongoDB 設定

```bash
# 啟動 MongoDB 服務
sudo systemctl start mongod
sudo systemctl enable mongod

# 建立資料庫
mongo
use iot_platform
db.createUser({
  user: "iot_user",
  pwd: "iot_password_2024",
  roles: ["readWrite"]
})
exit
```

### 3. InfluxDB 設定

```bash
# 啟動 InfluxDB 服務
sudo systemctl start influxdb
sudo systemctl enable influxdb

# 建立組織和儲存桶
influx setup --username admin --password admin123 --org IIPlatform --bucket iot_platform --retention 30d --force
```

---

## 第三階段：專案結構建立

### 1. 建立專案目錄

```bash
# 建立專案根目錄
mkdir IIPlatform
cd IIPlatform

# 建立後端目錄結構
mkdir -p backend/app
mkdir -p backend/app/protocols
mkdir -p backend/app/utils

# 建立前端目錄結構
mkdir -p frontend/src
mkdir -p frontend/src/components
mkdir -p frontend/src/utils
mkdir -p frontend/public
```

### 2. 建立環境變數檔案

```bash
# 後端環境變數
cat > backend/.env << EOF
# PostgreSQL 設定
POSTGRES_USER=iot_user
POSTGRES_PASSWORD=iot_password_2024
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=iot_platform

# MongoDB 設定
MONGO_USER=
MONGO_PASSWORD=
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=iot_platform
MONGO_URL=mongodb://localhost:27017/

# InfluxDB 設定
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=
INFLUXDB_ORG=IIPlatform
INFLUXDB_BUCKET=iot_platform

# JWT 設定
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 應用程式設定
DEBUG=True
API_V1_STR=/api/v1
PROJECT_NAME=IIPlatform
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# 檔案上傳設定
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF
```

---

## 第四階段：後端建置

### 1. 安裝 Python 依賴

```bash
cd backend

# 建立 requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
pymongo==4.6.0
influxdb-client==1.38.0
psycopg2-binary==2.9.7
requests==2.31.0
python-socketio==5.9.0
aiofiles==23.2.1
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
opencv-python==4.8.1.78
pillow==10.0.1
EOF

# 安裝依賴
pip install -r requirements.txt
```

### 2. 建立核心檔案

#### 建立 models.py
```bash
# 複製 models.py 內容到 backend/app/models.py
```

#### 建立 database.py
```bash
# 複製 database.py 內容到 backend/app/database.py
```

#### 建立 main.py
```bash
# 複製 main.py 內容到 backend/app/main.py
```

### 3. 初始化資料庫

```bash
# 執行資料庫初始化腳本
python init_all_databases.py
```

---

## 第五階段：前端建置

### 1. 建立 React 應用

```bash
cd frontend

# 建立 package.json
cat > package.json << EOF
{
  "name": "iiplatform-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "antd": "^5.12.8",
    "react-router-dom": "^6.8.1",
    "axios": "^1.6.2",
    "dayjs": "^1.11.10",
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# 安裝依賴
npm install
```

### 2. 建立核心組件

```bash
# 建立 App.js
# 建立各個組件檔案
```

---

## 第六階段：通訊協定設定

### 1. MQTT 處理器

```bash
# 建立 MQTT 處理器
cat > backend/app/protocols/mqtt_handler.py << EOF
# MQTT 處理器程式碼
EOF
```

### 2. Modbus TCP 處理器

```bash
# 建立 Modbus TCP 處理器
cat > backend/app/protocols/modbus_handler.py << EOF
# Modbus TCP 處理器程式碼
EOF
```

### 3. OPC UA 處理器

```bash
# 建立 OPC UA 處理器
cat > backend/app/protocols/opcua_handler.py << EOF
# OPC UA 處理器程式碼
EOF
```

---

## 第七階段：設備連線設定

### 1. 設備註冊 API

```bash
# 在 main.py 中添加設備註冊端點
```

### 2. 設備心跳 API

```bash
# 在 main.py 中添加設備心跳端點
```

### 3. 設備數據上傳 API

```bash
# 在 main.py 中添加設備數據上傳端點
```

---

## 第八階段：啟動腳本

### 1. 建立啟動腳本

```bash
# 建立 start_platform.sh
cat > start_platform.sh << 'EOF'
#!/bin/bash

echo "🚀 啟動 IIPlatform 工業物聯網平台..."

# 檢查資料庫服務
echo "📊 檢查資料庫服務..."

# PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL 服務未運行，正在啟動..."
    sudo systemctl start postgresql
fi

# MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "❌ MongoDB 服務未運行，正在啟動..."
    sudo systemctl start mongod
fi

# InfluxDB
if ! systemctl is-active --quiet influxdb; then
    echo "❌ InfluxDB 服務未運行，正在啟動..."
    sudo systemctl start influxdb
fi

echo "✅ 資料庫服務檢查完成"

# 初始化資料庫
echo "🔧 初始化資料庫..."
cd backend
python init_all_databases.py
cd ..

# 啟動後端服務
echo "🔧 啟動後端服務..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 等待後端啟動
sleep 5

# 啟動前端服務
echo "🔧 啟動前端服務..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "🎉 平台啟動完成！"
echo "📊 後端 API: http://localhost:8000"
echo "🌐 前端介面: http://localhost:3000"
echo "📚 API 文檔: http://localhost:8000/docs"

# 等待用戶中斷
trap "echo '🛑 正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

# 設定執行權限
chmod +x start_platform.sh
```

---

## 第九階段：驗證測試

### 1. 測試後端 API

```bash
# 測試後端連線
curl http://localhost:8000/health

# 測試資料庫連線
curl http://localhost:8000/api/v1/database-connections/test

# 測試設備註冊
curl -X POST http://localhost:8000/api/v1/devices/register \
  -H "Content-Type: application/json" \
  -d '{"device_id": "test_device_001", "name": "測試設備", "device_type": "sensor"}'
```

### 2. 測試前端介面

```bash
# 開啟瀏覽器訪問
# http://localhost:3000
```

### 3. 測試資料庫功能

```bash
# 測試 PostgreSQL
psql -h localhost -U iot_user -d iot_platform -c "SELECT * FROM users;"

# 測試 MongoDB
mongo iot_platform --eval "db.device_configs.find().pretty()"

# 測試 InfluxDB
influx query 'from(bucket:"iot_platform") |> range(start: -1h) |> limit(n:10)'
```

---

## 故障排除

### 1. 常見錯誤及解決方案

#### 後端錯誤
```bash
# ModuleNotFoundError: No module named 'dotenv'
pip install python-dotenv

# ImportError: cannot import name 'declarativeBase'
# 修正 models.py 中的導入語句

# 資料庫連線錯誤
# 檢查資料庫服務是否運行
# 檢查連線字串是否正確
```

#### 前端錯誤
```bash
# SyntaxError: Identifier has already been declared
# 清理重複的導入語句

# Module not found
npm install
```

### 2. 日誌檢查

```bash
# 檢查後端日誌
tail -f backend/logs/app.log

# 檢查資料庫日誌
sudo tail -f /var/log/postgresql/postgresql-*.log
sudo tail -f /var/log/mongodb/mongod.log
sudo tail -f /var/log/influxdb/influxd.log
```

### 3. 效能監控

```bash
# 檢查系統資源使用
htop

# 檢查網路連線
netstat -tulpn

# 檢查磁碟使用
df -h
```

---

## 📊 資料庫架構總結

### PostgreSQL (結構化數據)
- **用戶管理**: users, roles, permissions, role_permissions
- **設備管理**: devices, device_categories, device_groups, device_group_members
- **告警系統**: alerts, notifications
- **系統設定**: database_connections, communication_protocols, system_settings

### MongoDB (非結構化數據)
- **設備配置**: device_configs
- **AI 模型**: ai_models
- **系統日誌**: system_logs
- **報表系統**: reports
- **API 文檔**: api_documentation
- **開發者平台**: sdk_downloads, webhook_deliveries, user_behaviors, user_sessions, feature_usage, api_tokens, webhooks, api_usage

### InfluxDB (時序數據)
- **設備感測器數據**: device_sensor_data
- **設備狀態**: device_status
- **系統指標**: system_metrics
- **AI 分析結果**: ai_analysis_results
- **告警事件**: alert_events

---

## 🎯 快速啟動指南

```bash
# 1. 克隆專案
git clone <repository-url>
cd IIPlatform

# 2. 設定環境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 3. 安裝依賴
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 4. 啟動資料庫服務
sudo systemctl start postgresql mongod influxdb

# 5. 初始化資料庫
cd backend && python init_all_databases.py

# 6. 啟動平台
./start_platform.sh
```

---

## 🔑 預設帳號

- **用戶名**: admin
- **密碼**: admin123
- **權限**: 系統管理員 (擁有所有權限)

---

## 📞 技術支援

如有問題，請檢查：
1. 所有服務是否正常運行
2. 資料庫連線是否正常
3. 環境變數是否正確設定
4. 防火牆設定是否允許連線

---

*最後更新: 2024年12月* 