# IIPlatform 工業物聯網平台用戶手冊

## 📋 目錄

- [平台概述](#平台概述)
- [快速開始](#快速開始)
- [系統架構](#系統架構)
- [功能模組](#功能模組)
- [使用指南](#使用指南)
- [維護指南](#維護指南)
- [故障排除](#故障排除)
- [API 文檔](#api-文檔)
- [開發指南](#開發指南)

---

## 平台概述

### 🎯 平台定位
IIPlatform 是一個專為工業環境設計的綜合性物聯網平台，提供從設備管理到 AI 分析的完整解決方案。平台採用現代化的微服務架構，支援多種通訊協定，並整合了先進的機器學習技術。

### 🏗️ 技術架構
- **前端**: React.js + Ant Design
- **後端**: FastAPI + Python
- **資料庫**: PostgreSQL + MongoDB + InfluxDB
- **通訊協定**: MQTT, Modbus TCP, OPC UA
- **AI/ML**: scikit-learn, TensorFlow, PyTorch

### 📊 核心特色
- **多資料庫支援**: 結構化、文檔、時序數據統一管理
- **AI 整合**: 完整的機器學習模型生命週期管理
- **即時監控**: 設備狀態和數據的即時監控
- **可擴展性**: 模組化設計，易於擴展和維護
- **安全性**: JWT 認證、RBAC 權限控制

---

## 快速開始

### 1. 環境準備

#### 系統需求
```bash
# 檢查系統需求
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- MongoDB 4.4+
- InfluxDB 2.0+
```

#### 安裝依賴
```bash
# 後端依賴
cd backend
pip install -r requirements.txt

# 前端依賴
cd frontend
npm install
```

### 2. 資料庫設定

#### PostgreSQL 設定
```bash
# 啟動 PostgreSQL
sudo systemctl start postgresql

# 建立資料庫
sudo -u postgres psql
CREATE DATABASE iot_platform;
CREATE USER iot_user WITH PASSWORD 'iot_password_2024';
GRANT ALL PRIVILEGES ON DATABASE iot_platform TO iot_user;
\q
```

#### MongoDB 設定
```bash
# 啟動 MongoDB
sudo systemctl start mongod

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

#### InfluxDB 設定
```bash
# 啟動 InfluxDB
sudo systemctl start influxdb

# 建立組織和儲存桶
influx setup --username admin --password admin123 --org IIPlatform --bucket iot_platform --retention 30d --force
```

### 3. 啟動平台

#### 使用啟動腳本
```bash
# Linux/Mac
./start_platform.sh

# Windows
start_platform.bat
```

#### 手動啟動
```bash
# 啟動後端
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 啟動前端
cd frontend
npm start
```

### 4. 首次登入設定

#### 預設帳號
- **用戶名**: admin
- **密碼**: admin123
- **權限**: 系統管理員

#### 首次設定流程
1. 登入後系統會自動檢查是否為首次設定
2. 如果是首次設定，會顯示「首次登入設定」頁面
3. 配置資料庫連線設定
4. 完成設定後即可正常使用平台

---

## 系統架構

### 資料庫架構

#### PostgreSQL (結構化數據)
- **用戶管理**: users, roles, permissions
- **設備管理**: devices, device_groups
- **警報系統**: alerts, alert_rules
- **系統設定**: system_settings, platform_content

#### MongoDB (非結構化數據)
- **設備配置**: device_configs
- **AI 模型**: ai_models
- **系統日誌**: system_logs
- **報表系統**: reports

#### InfluxDB (時序數據)
- **設備感測器數據**: device_sensor_data
- **設備狀態**: device_status
- **系統指標**: system_metrics
- **AI 分析結果**: ai_analysis_results

### 通訊協定支援

#### MQTT
- 輕量級消息傳輸
- 支援 QoS 0/1/2
- 支援 SSL/TLS 加密

#### Modbus TCP
- 工業控制協定
- 支援多種數據類型
- 即時數據讀取

#### OPC UA
- 開放平台通訊
- 支援複雜數據結構
- 內建安全機制

---

## 功能模組

### 1. 儀表板概覽

#### 主要功能
- **即時統計**: 設備總數、在線設備、警報數量
- **狀態監控**: 設備狀態分佈圖、系統健康度
- **快速操作**: 常用功能快速入口
- **自定義儀表板**: 個人化儀表板配置

#### 使用指南
1. 登入後自動進入儀表板
2. 查看即時統計數據
3. 點擊「自定義儀表板」進行個人化設定
4. 拖拽圖表調整佈局
5. 保存個人化設定

### 2. 設備管理

#### 設備註冊
1. 進入「設備管理」頁面
2. 點擊「新增設備」
3. 填寫設備基本信息
4. 選擇設備類型和通訊協定
5. 配置設備參數
6. 保存設備設定

#### 設備監控
- **即時狀態**: 查看設備當前狀態
- **歷史數據**: 查看設備歷史數據
- **警報設定**: 配置設備警報規則
- **遠端控制**: 發送控制命令

#### 設備分組
1. 建立設備群組
2. 將設備加入群組
3. 群組批量操作
4. 群組權限管理

### 3. 數據處理

#### 數據源配置
1. 進入「數據處理」頁面
2. 點擊「新增數據源」
3. 選擇數據源類型 (MQTT/Modbus/資料庫)
4. 配置連線參數
5. 測試連線
6. 保存配置

#### 處理管道設定
1. 選擇處理器類型
2. 配置處理參數
3. 設定處理順序
4. 測試處理結果
5. 啟用處理管道

#### 支援的處理器
- **過濾器**: 數據範圍過濾
- **驗證器**: 數據格式驗證
- **轉換器**: 數據格式轉換
- **聚合器**: 數據統計聚合
- **標準化器**: 數據標準化

### 4. AI 模型管理

#### 模型註冊
1. 進入「AI Model 管理」頁面
2. 點擊「新增模型」
3. 選擇模型類型 (LLM/Vision/Audio/Multimodal)
4. 選擇框架 (PyTorch/TensorFlow/ONNX)
5. 配置模型參數
6. 上傳模型文件或配置 API

#### 模型監控
- **性能指標**: CPU、記憶體、GPU 使用率
- **使用統計**: 調用次數、成功率
- **錯誤分析**: 錯誤類型和頻率
- **版本管理**: 模型版本控制

#### 支援的模型類型
- **大語言模型 (LLM)**: GPT、Claude、BERT
- **視覺模型 (Vision)**: ResNet、YOLO、ViT
- **語音模型 (Audio)**: Whisper、Wav2Vec
- **多模態模型 (Multimodal)**: CLIP、DALL-E
- **嵌入模型 (Embedding)**: Word2Vec、Sentence-BERT

### 5. 自定義儀表板

#### 創建儀表板
1. 進入「自定義儀表板」
2. 點擊「添加圖表」
3. 選擇圖表類型
4. 配置數據源
5. 設定圖表樣式
6. 調整佈局

#### 支援的圖表類型
- **直條圖**: 分類數據比較
- **圓餅圖**: 比例和構成分析
- **折線圖**: 趨勢分析
- **面積圖**: 趨勢分析，強調數據量
- **數據表格**: 詳細數據展示
- **儀表板**: 單一指標監控
- **數字卡片**: 關鍵指標展示

#### 佈局管理
- **拖拽移動**: 直接拖拽圖表到新位置
- **調整大小**: 拖拽圖表邊角調整大小
- **自動排列**: 系統自動調整其他圖表位置
- **響應式設計**: 適配不同螢幕尺寸

### 6. 平台簡介客製化

#### 內容編輯
1. 進入「平台簡介」頁面
2. 點擊「編輯模式」開關
3. 點擊各區塊的「編輯」按鈕
4. 在彈出模態框中修改內容
5. 保存變更

#### 圖片管理
1. 點擊「管理圖片」按鈕
2. 選擇圖片分類
3. 上傳圖片文件
4. 設定圖片描述
5. 管理現有圖片

#### 支援的內容類型
- **基本內容**: 標題、副標題、詳細描述
- **功能特色**: 平台核心功能介紹
- **技術架構**: 技術棧和框架信息
- **功能模組**: 功能模組說明
- **快速開始**: 使用指南步驟

#### 圖片分類
- **架構圖**: 系統架構和組件圖
- **界面截圖**: 平台界面展示
- **演示圖**: 功能演示和流程圖
- **其他**: 其他類型圖片

### 7. 警報中心

#### 警報設定
1. 進入「警報中心」
2. 點擊「新增警報規則」
3. 選擇設備和條件
4. 設定警報級別
5. 配置通知管道
6. 啟用警報規則

#### 警報處理
- **即時警報**: 查看即時警報
- **警報確認**: 確認警報處理
- **警報歷史**: 查看歷史警報
- **統計分析**: 警報統計分析

### 8. 用戶權限管理

#### 角色管理
1. 進入「角色管理」
2. 點擊「新增角色」
3. 設定角色名稱和描述
4. 分配權限
5. 保存角色設定

#### 用戶管理
1. 進入「用戶管理」
2. 點擊「新增用戶」
3. 填寫用戶信息
4. 分配角色
5. 設定權限

#### 預設角色
- **系統管理員**: 完整權限
- **設備管理員**: 設備管理權限
- **操作員**: 日常操作權限
- **檢視者**: 唯讀權限
- **維護員**: 維護相關權限

---

## 使用指南

### 1. 首次登入設定

#### 檢查首次設定
```bash
# 後端 API
GET /api/v1/auth/setup-status
```

#### 配置資料庫連線
```bash
# 保存設定
POST /api/v1/auth/first-time-setup
{
  "postgresql": {
    "host": "localhost",
    "port": 5432,
    "database": "iot_platform",
    "username": "iot_user",
    "password": "iot_password_2024"
  },
  "mongodb": {
    "host": "localhost",
    "port": 27017,
    "database": "iot_platform",
    "username": "iot_user",
    "password": "iot_password_2024"
  },
  "influxdb": {
    "url": "http://localhost:8086",
    "token": "your-token",
    "org": "IIPlatform",
    "bucket": "iot_platform"
  }
}
```

### 2. 設備管理操作

#### 註冊設備
```bash
POST /api/v1/devices/register
{
  "device_id": "DEVICE_001",
  "name": "溫度感測器",
  "type": "sensor",
  "protocol": "mqtt",
  "config": {
    "broker": "mqtt.company.com",
    "topic": "devices/DEVICE_001",
    "qos": 1
  }
}
```

#### 設備狀態查詢
```bash
GET /api/v1/devices/{device_id}/status
```

#### 發送控制命令
```bash
POST /api/v1/devices/{device_id}/command
{
  "command": "restart",
  "parameters": {}
}
```

### 3. 數據處理配置

#### 添加數據源
```bash
POST /api/v1/data-processing/add-data-source
{
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
    }
  }
}
```

#### 設定處理管道
```bash
POST /api/v1/data-processing/set-pipeline
[
  "temperature_filter",
  "range_validation",
  "unit_conversion",
  "statistical_aggregate"
]
```

### 4. AI 模型管理

#### 註冊模型
```bash
POST /api/v1/ai-models/
{
  "name": "GPT-4",
  "version": "4.0",
  "type": "llm",
  "framework": "openai",
  "source": "openai",
  "description": "OpenAI 最新的大語言模型",
  "endpoint": "https://api.openai.com/v1/chat/completions"
}
```

#### 測試模型
```bash
POST /api/v1/ai-models/{model_id}/test
{
  "input_data": {
    "prompt": "Hello, how are you?",
    "max_tokens": 100
  }
}
```

#### 切換模型狀態
```bash
POST /api/v1/ai-models/{model_id}/toggle-status
```

### 5. 自定義儀表板

#### 添加圖表
```bash
POST /api/v1/dashboard/charts
{
  "type": "bar",
  "title": "設備狀態統計",
  "data_source": "device_status",
  "config": {
    "x_axis": "status",
    "y_axis": "count",
    "colors": ["#1890ff", "#52c41a", "#faad14"]
  }
}
```

#### 保存佈局
```bash
POST /api/v1/dashboard/layout
{
  "layout": [
    {
      "i": "chart_1",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 4
    }
  ]
}
```

### 6. 平台簡介客製化

#### 更新內容
```bash
PUT /api/v1/platform-content/{content_id}
{
  "content_value": "新的平台描述內容",
  "content_json": {
    "features": ["功能1", "功能2", "功能3"]
  }
}
```

#### 上傳圖片
```bash
POST /api/v1/platform-images/upload
Content-Type: multipart/form-data

{
  "file": [圖片文件],
  "category": "architecture",
  "description": "系統架構圖"
}
```

---

## 維護指南

### 1. 系統監控

#### 健康檢查
```bash
# 檢查後端服務
curl http://localhost:8000/health

# 檢查資料庫連線
curl http://localhost:8000/api/v1/database-connections/test

# 檢查系統資源
htop
df -h
free -h
```

#### 日誌監控
```bash
# 後端日誌
tail -f backend/logs/app.log

# 資料庫日誌
sudo tail -f /var/log/postgresql/postgresql-*.log
sudo tail -f /var/log/mongodb/mongod.log
sudo tail -f /var/log/influxdb/influxd.log
```

### 2. 資料庫維護

#### 備份策略
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

#### 恢復策略
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

### 3. 性能優化

#### 資料庫優化
```sql
-- PostgreSQL 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_status ON devices(status);

-- MongoDB 索引
db.device_configs.createIndex({ "device_id": 1 });
db.ai_models.createIndex({ "status": 1, "created_at": -1 });

-- InfluxDB 標籤索引
CREATE TAG INDEX idx_device_sensors_device_id ON device_sensors(device_id);
CREATE TAG INDEX idx_device_sensors_sensor_type ON device_sensors(sensor_type);
```

#### 應用程式優化
```python
# 連接池配置
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30

# 緩存配置
REDIS_URL = "redis://localhost:6379"
CACHE_TTL = 3600

# 日誌級別
LOG_LEVEL = "INFO"
```

### 4. 安全維護

#### 定期更新
```bash
# 更新系統套件
sudo apt update && sudo apt upgrade

# 更新 Python 套件
pip install --upgrade -r requirements.txt

# 更新 Node.js 套件
npm update
```

#### 安全檢查
```bash
# 檢查開放端口
netstat -tulpn

# 檢查用戶權限
sudo cat /etc/passwd | grep iot

# 檢查防火牆設定
sudo ufw status
```

---

## 故障排除

### 1. 常見問題

#### 後端服務無法啟動
```bash
# 檢查 Python 環境
python3 --version
pip list

# 檢查依賴
pip install -r requirements.txt

# 檢查端口佔用
netstat -tulpn | grep 8000

# 檢查日誌
tail -f backend/logs/app.log
```

#### 資料庫連線失敗
```bash
# PostgreSQL 連線測試
psql -h localhost -U iot_user -d iot_platform -c "SELECT 1;"

# MongoDB 連線測試
mongo iot_platform --eval "db.runCommand('ping')"

# InfluxDB 連線測試
influx ping
```

#### 前端無法載入
```bash
# 檢查 Node.js 環境
node --version
npm --version

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 檢查端口佔用
netstat -tulpn | grep 3000
```

### 2. 錯誤代碼

#### HTTP 錯誤碼
- `400`: 請求參數錯誤
- `401`: 權限不足
- `404`: 資源不存在
- `413`: 文件過大
- `415`: 文件格式不支援
- `500`: 服務器內部錯誤

#### 資料庫錯誤
- `psycopg2.OperationalError`: PostgreSQL 連線錯誤
- `pymongo.errors.ConnectionFailure`: MongoDB 連線錯誤
- `influxdb_client.rest.ApiException`: InfluxDB API 錯誤

### 3. 日誌分析

#### 後端日誌
```bash
# 查看錯誤日誌
grep "ERROR" backend/logs/app.log

# 查看警告日誌
grep "WARNING" backend/logs/app.log

# 查看特定用戶操作
grep "user_id" backend/logs/app.log
```

#### 前端日誌
```bash
# 查看瀏覽器控制台錯誤
# 在瀏覽器中按 F12 查看 Console 標籤

# 查看網路請求
# 在瀏覽器中按 F12 查看 Network 標籤
```

### 4. 性能問題

#### 響應時間過長
```bash
# 檢查資料庫查詢
EXPLAIN ANALYZE SELECT * FROM devices WHERE status = 'online';

# 檢查索引使用
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes;
```

#### 記憶體使用過高
```bash
# 檢查記憶體使用
free -h
ps aux --sort=-%mem | head -10

# 檢查 Python 進程
ps aux | grep python
```

---

## API 文檔

### 1. 認證 API

#### 登入
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 檢查設定狀態
```http
GET /api/v1/auth/setup-status
```

#### 首次設定
```http
POST /api/v1/auth/first-time-setup
Content-Type: application/json

{
  "postgresql": {...},
  "mongodb": {...},
  "influxdb": {...}
}
```

### 2. 設備管理 API

#### 註冊設備
```http
POST /api/v1/devices/register
Content-Type: application/json

{
  "device_id": "DEVICE_001",
  "name": "溫度感測器",
  "type": "sensor",
  "protocol": "mqtt"
}
```

#### 獲取設備列表
```http
GET /api/v1/devices/
```

#### 獲取設備詳情
```http
GET /api/v1/devices/{device_id}
```

#### 更新設備
```http
PUT /api/v1/devices/{device_id}
Content-Type: application/json

{
  "name": "新的設備名稱",
  "status": "online"
}
```

#### 刪除設備
```http
DELETE /api/v1/devices/{device_id}
```

### 3. 數據處理 API

#### 處理 MQTT 數據
```http
POST /api/v1/data-processing/process-mqtt
Content-Type: application/json

{
  "topic": "iot/device1/data",
  "payload": {
    "temperature": 25.5,
    "humidity": 60
  }
}
```

#### 處理 Modbus 數據
```http
POST /api/v1/data-processing/process-modbus
Content-Type: application/json

{
  "device_id": "modbus_device_1",
  "registers": [100, 200, 300]
}
```

#### 添加數據源
```http
POST /api/v1/data-processing/add-data-source
Content-Type: application/json

{
  "source_id": "mqtt_temperature_sensor",
  "type": "mqtt",
  "description": "溫度感測器 MQTT 數據源",
  "config": {...}
}
```

### 4. AI 模型管理 API

#### 獲取模型列表
```http
GET /api/v1/ai-models/
```

#### 創建模型
```http
POST /api/v1/ai-models/
Content-Type: application/json

{
  "name": "GPT-4",
  "version": "4.0",
  "type": "llm",
  "framework": "openai",
  "source": "openai",
  "description": "OpenAI 最新的大語言模型"
}
```

#### 測試模型
```http
POST /api/v1/ai-models/{model_id}/test
Content-Type: application/json

{
  "input_data": {
    "prompt": "Hello, how are you?",
    "max_tokens": 100
  }
}
```

#### 切換模型狀態
```http
POST /api/v1/ai-models/{model_id}/toggle-status
```

### 5. 平台內容管理 API

#### 獲取平台內容
```http
GET /api/v1/platform-content/
```

#### 更新平台內容
```http
PUT /api/v1/platform-content/{content_id}
Content-Type: application/json

{
  "content_value": "新的內容",
  "content_json": {...}
}
```

#### 上傳圖片
```http
POST /api/v1/platform-images/upload
Content-Type: multipart/form-data

{
  "file": [圖片文件],
  "category": "architecture",
  "description": "系統架構圖"
}
```

#### 獲取圖片列表
```http
GET /api/v1/platform-images/
```

---

## 開發指南

### 1. 環境設定

#### 開發環境準備
```bash
# 建立虛擬環境
python3 -m venv iiplatform-env
source iiplatform-env/bin/activate  # Linux/Mac
# 或 iiplatform-env\Scripts\activate  # Windows

# 安裝開發依賴
pip install -r requirements.txt
pip install pytest pytest-asyncio black flake8

# 前端開發依賴
cd frontend
npm install
npm install --save-dev eslint prettier
```

#### 代碼風格
```bash
# Python 代碼格式化
black backend/
flake8 backend/

# JavaScript 代碼格式化
cd frontend
npx eslint src/
npx prettier --write src/
```

### 2. 測試指南

#### 後端測試
```bash
# 運行單元測試
cd backend
pytest tests/

# 運行特定測試
pytest tests/test_data_processing.py

# 生成覆蓋率報告
pytest --cov=app tests/
```

#### 前端測試
```bash
# 運行測試
cd frontend
npm test

# 運行特定測試
npm test -- --testNamePattern="Dashboard"

# 生成覆蓋率報告
npm test -- --coverage
```

### 3. 部署指南

#### Docker 部署
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/iot_platform
    depends_on:
      - postgres
      - mongodb
      - influxdb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: iot_platform
      POSTGRES_USER: iot_user
      POSTGRES_PASSWORD: iot_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: iot_user
      MONGO_INITDB_ROOT_PASSWORD: iot_password
    volumes:
      - mongodb_data:/data/db

  influxdb:
    image: influxdb:2.7
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: iot_user
      DOCKER_INFLUXDB_INIT_PASSWORD: iot_password
      DOCKER_INFLUXDB_INIT_ORG: iot_org
      DOCKER_INFLUXDB_INIT_BUCKET: iot_platform
    volumes:
      - influxdb_data:/var/lib/influxdb2

volumes:
  postgres_data:
  mongodb_data:
  influxdb_data:
```

### 4. 擴展開發

#### 添加新的數據處理器
```python
# backend/app/services/data_processing_service.py

class CustomDataProcessingService(DataProcessingService):
    def __init__(self):
        super().__init__()
        self.register_processor("custom_processor", self._custom_processor)
    
    async def _custom_processor(self, data: Any, config: Dict[str, Any]) -> Any:
        # 自定義處理邏輯
        return processed_data
```

#### 添加新的圖表類型
```javascript
// frontend/src/components/charts/CustomChart.js
import React from 'react';
import { Card } from 'antd';

const CustomChart = ({ data, config }) => {
  // 自定義圖表邏輯
  return (
    <Card title={config.title}>
      {/* 自定義圖表內容 */}
    </Card>
  );
};

export default CustomChart;
```

#### 添加新的 API 端點
```python
# backend/app/main.py

@app.post("/api/v1/custom-endpoint")
async def custom_endpoint(request: CustomRequest):
    # 自定義 API 邏輯
    return {"message": "Custom endpoint response"}
```

---

## 更新日誌

### v1.0.0 (2024-01-15)
- 初始版本發布
- 完整的設備管理功能
- 多資料庫支援
- AI 模型管理系統
- 自定義儀表板
- 平台簡介客製化

### 計劃功能
- 更多通訊協定支援
- 增強 AI 功能
- 移動端應用
- 國際化支援
- 雲端部署選項

---

## 聯繫支援

### 技術支援
- **文檔**: 查看本用戶手冊
- **日誌**: 檢查系統日誌
- **社區**: 參與開發者社區
- **郵件**: 聯繫技術支援團隊

### 問題回報
1. 詳細描述問題
2. 提供錯誤日誌
3. 說明重現步驟
4. 提供系統環境信息

---

*本用戶手冊會持續更新，請關注最新版本。* 