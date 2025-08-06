# IIPlatform 工業物聯網平台

## 🏭 平台概述

IIPlatform 是一個專為工業環境設計的綜合性物聯網平台，整合了設備管理、數據分析、AI 預測、多資料庫架構等多項功能。平台採用現代化的微服務架構，提供完整的工業物聯網解決方案。

## ✨ 主要功能特色

### 📊 多資料庫架構
- **PostgreSQL**: 用戶、角色、設備、告警等核心業務數據
- **MongoDB**: 設備配置、AI模型、日誌、報表等非結構化數據
- **InfluxDB**: 感測器數據、系統指標、AI分析結果等時序數據

### 🏭 設備管理
- 設備註冊、分組、類別管理
- 遠端設備控制與監控
- OTA 韌體更新管理
- 設備狀態即時監控
- 設備類別自定義管理

### 📈 數據分析
- 即時數據監控與顯示
- 歷史數據查詢與趨勢分析
- 多維度數據統計
- 自定義數據報表

### 🤖 AI 智能分析
- 異常檢測與預測性維護
- 機器學習模型管理 (MLOps)
- GPU 資源監控與管理
- AI 模型訓練與部署

### 📹 視頻識別
- 串流視頻處理
- AI 視頻分析
- 攝像機控制

### 🔔 警報系統
- 即時警報通知
- 多管道通知 (Email, SMS, 推播)
- 警報規則配置
- 警報歷史記錄

### 🔐 安全與權限
- 角色基礎存取控制 (RBAC)
- 用戶權限管理
- 審計日誌記錄
- 安全認證機制

### 📋 報表系統
- 自定義報表模板
- 排程報表生成
- 多格式匯出 (PDF, Excel)
- 報表歷史管理

### 🗺️ GIS 地理資訊
- 設備地理分佈顯示
- 地理區域管理
- 地理警報設定
- 地圖整合功能

### ⚙️ 自動化工作流
- 規則引擎配置
- 工作流程自動化
- 事件觸發機制
- 流程監控與管理

### 📡 通訊協定支援
- MQTT 協議
- Modbus TCP
- OPC UA
- RESTful API

### 📱 通知管理
- 個人化通知偏好
- 通知群組管理
- 多管道通知整合
- 通知歷史追蹤

### 🏗️ 邊緣計算
- 邊緣網關管理
- 本地 AI 推論
- 雲端邊緣同步
- 斷線緩存機制

### 📊 使用者行為分析
- 儀表板模組點擊率
- 使用時長分析
- 路徑分析
- 活躍用戶統計 (DAU/MAU)
- 功能使用排名

### 🔧 開發者平台
- Swagger/Redoc API 文檔
- Token 註冊/管理 (過期/續期)
- Webhook 測試/歷史
- SDK 提供 (Python/JS/Go)

## 🛠️ 技術架構

### 後端技術棧
- **框架**: FastAPI (Python)
- **資料庫**: PostgreSQL + MongoDB + InfluxDB
- **ORM**: SQLAlchemy
- **認證**: JWT
- **AI/ML**: scikit-learn, pandas, numpy
- **通訊**: MQTT, Modbus, OPC UA

### 前端技術棧
- **框架**: React 18
- **UI 庫**: Ant Design
- **圖表**: ECharts
- **路由**: React Router DOM
- **HTTP 客戶端**: Axios
- **日期處理**: dayjs

## 🚀 快速開始

### 環境需求
- Python 3.8+
- Node.js 16+
- PostgreSQL
- MongoDB
- InfluxDB

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/your-org/iiplatform.git
cd iiplatform
```

2. **設定資料庫**
```bash
# 啟動資料庫服務
sudo systemctl start postgresql mongod influxdb

# 初始化資料庫
cd backend
python init_all_databases.py
```

3. **啟動平台**

#### 方法一：使用自動初始化啟動腳本（推薦）
```bash
# 在 backend 目錄下執行
cd backend
python start_with_init.py
```

#### 方法二：使用原有啟動腳本
```bash
# Linux/Mac
./start_platform.sh

# Windows
start_platform.bat
```

#### 方法三：手動啟動
```bash
# 啟動後端
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 啟動前端
cd frontend
npm start
```

4. **訪問平台**
- 前端: http://localhost:3000
- 後端 API: http://localhost:8000
- API 文檔: http://localhost:8000/docs

### 🔑 預設帳號
- **用戶名**: admin
- **密碼**: admin123

### 🔧 首次登入設定

平台支援首次登入時的資料庫連線設定，包括：

- **PostgreSQL**: 主資料庫，用於存儲核心業務數據
- **MongoDB**: 文檔資料庫，用於存儲日誌和配置
- **InfluxDB**: 時序資料庫，用於存儲感測器數據

#### 首次登入流程
1. 使用預設帳號登入（admin/admin123）
2. 系統檢測是否為首次登入
3. 如果是首次登入，會顯示資料庫連線設定介面
4. 設定完成後，系統會保存設定並測試連線
5. 之後的登入會直接使用已保存的設定

#### 設定功能
- 支援三種資料庫類型的連線設定
- 提供連線測試功能
- 自動保存設定到資料庫
- 支援設定的修改和管理

#### 初始化資料庫表格
在首次使用前，需要初始化資料庫表格：
```bash
cd backend
python init_database_tables.py
```

#### 手動設定管理
如果需要重新設定或管理資料庫連線，可以：
1. 登入後進入「系統管理」→「資料庫連線」
2. 查看、編輯或刪除現有設定
3. 新增其他資料庫連線

## 📋 功能模組

### 平台簡介
- 平台概述與架構圖
- 功能特色介紹
- 常見問題 (Q&A)
- 系統維護聯絡

### 總覽儀表板
- 設備狀態總覽
- 即時數據監控
- 警報統計
- 系統健康狀態

### 監控分析
- 歷史數據分析
- AI 智能分析
- 警報中心

### 數據處理
- 通訊協定管理
- 資料表結構管理

### AI 應用
- AI 異常偵測系統
- 串流影像辨識
- MLOps

### 設備管理
- 設備管理
- 設備類別管理
- OTA 更新
- 邊緣閘道
- 地理資訊

### 自動化工作流
- 規則引擎
- 工作流程
- 審計日誌
- 報表系統

### 系統管理
- 系統設定
- 通知偏好
- 角色管理
- 資料庫連線
- 系統維護聯絡
- 使用者行為分析
- 開發者平台

## 🗄️ 資料庫架構

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

## 🔧 開發指南

### 新增功能模組
1. 在 `backend/app/models.py` 中定義資料模型
2. 在 `backend/app/schemas.py` 中定義 Pydantic 模式
3. 在 `backend/app/database.py` 中實作資料庫操作
4. 在 `backend/app/main.py` 中新增 API 端點
5. 在 `frontend/src/components/` 中建立 React 組件
6. 在 `frontend/src/App.js` 中新增路由

### 資料庫初始化
```bash
# 初始化所有資料庫
cd backend
python init_all_databases.py
```

## 📦 部署指南

### 生產環境部署
1. 配置 PostgreSQL、MongoDB、InfluxDB
2. 設定環境變數
3. 設置反向代理 (Nginx)
4. 配置 SSL 憑證
5. 設置監控與日誌

### 環境變數設定
```bash
# PostgreSQL
POSTGRES_USER=iot_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=your_host
POSTGRES_PORT=5432
POSTGRES_DB=iot_platform

# MongoDB
MONGO_HOST=your_host
MONGO_PORT=27017
MONGO_DB=iot_platform

# InfluxDB
INFLUXDB_URL=http://your_host:8086
INFLUXDB_TOKEN=your_token
INFLUXDB_ORG=IIPlatform
INFLUXDB_BUCKET=iot_platform
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發起 Pull Request

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 聯絡資訊

- 專案維護者: [Your Name]
- Email: [your.email@example.com]
- 專案網站: [https://github.com/your-org/iiplatform]

## 📚 相關文檔

- [平台建置指南](PLATFORM_SETUP.md)
- [資料庫設計文檔](Database_Design.md)
- [用戶手冊](USER_MANUAL.md)
- [功能說明](FEATURES.md)
- [清理總結](CLEANUP_SUMMARY.md)