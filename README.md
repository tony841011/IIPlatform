# IIPlatform 工業物聯網平台

## 平台概述

IIPlatform 是一個專為工業環境設計的綜合性物聯網平台，整合了設備管理、數據分析、AI 預測、視頻識別等多項功能。平台採用現代化的微服務架構，提供完整的工業物聯網解決方案。

## 主要功能特色

### 🏭 設備管理
- 設備註冊、分組、標籤管理
- 遠端設備控制與監控
- OTA 韌體更新管理
- 設備狀態即時監控

###  數據分析
- 即時數據監控與顯示
- 歷史數據查詢與趨勢分析
- 多維度數據統計
- 自定義數據報表

###  AI 智能分析
- 異常檢測與預測性維護
- 機器學習模型管理 (MLOps)
- GPU 資源監控與管理
- AI 模型訓練與部署

###  視頻識別
- ONVIF 協議支援
- 串流視頻處理
- AI 視頻分析
- PTZ 攝像機控制

### 🔔 警報系統
- 即時警報通知
- 多管道通知 (Email, SMS, Teams, 推播)
- 警報規則配置
- 警報歷史記錄

###  安全與權限
- 角色基礎存取控制 (RBAC)
- 用戶權限管理
- 審計日誌記錄
- 安全認證機制

###  報表系統
- 自定義報表模板
- 排程報表生成
- 多格式匯出 (PDF, Excel)
- 報表歷史管理

### ️ GIS 地理資訊
- 設備地理分佈顯示
- 地理區域管理
- 地理警報設定
- 地圖整合功能

### ⚙️ 自動化工作流
- 規則引擎配置
- 工作流程自動化
- 事件觸發機制
- 流程監控與管理

###  ETL 數據處理
- 數據提取、轉換、載入
- 數據品質檢查
- 數據映射與轉換
- 工作流程設計

###  通訊協定支援
- MQTT 協議
- RESTful API
- Modbus TCP
- OPC UA

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

### 使用者行為分析
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

## 技術架構

### 後端技術棧
- **框架**: FastAPI (Python)
- **資料庫**: SQLite (開發) / PostgreSQL (生產)
- **ORM**: SQLAlchemy
- **認證**: JWT + OAuth2
- **任務佇列**: Celery
- **AI/ML**: scikit-learn, pandas, numpy
- **通訊**: MQTT, Modbus, OPC UA

### 前端技術棧
- **框架**: React 18
- **UI 庫**: Ant Design
- **圖表**: ECharts
- **路由**: React Router DOM
- **HTTP 客戶端**: Axios

## 快速開始

### 環境需求
- Python 3.8+
- Node.js 16+
- SQLite (開發環境)

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/your-org/iiplatform.git
cd iiplatform
```

2. **後端設置**
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python generate_test_data.py
uvicorn app.main:app --reload
```

3. **前端設置**
```bash
cd frontend
npm install
npm start
```

4. **訪問平台**
- 前端: http://localhost:3000
- 後端 API: http://localhost:8000
- API 文檔: http://localhost:8000/docs

## 功能模組

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
- 資料庫連線管理
- 資料表結構管理

### AI 應用
- AI 異常偵測系統
- 串流影像辨識
- MLOps

### 設備管理
- 設備管理
- 設備控制
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

## 開發指南

### 新增功能模組
1. 在 `backend/app/models.py` 中定義資料模型
2. 在 `backend/app/schemas.py` 中定義 Pydantic 模式
3. 在 `backend/app/database.py` 中實作資料庫操作
4. 在 `backend/app/main.py` 中新增 API 端點
5. 在 `frontend/src/components/` 中建立 React 組件
6. 在 `frontend/src/App.js` 中新增路由

### 資料庫遷移
```bash
# 重新初始化資料庫
python init_db.py

# 生成測試資料
python generate_test_data.py
```

## 部署指南

### 生產環境部署
1. 使用 PostgreSQL 替代 SQLite
2. 配置環境變數
3. 設置反向代理 (Nginx)
4. 配置 SSL 憑證
5. 設置監控與日誌

### Docker 部署
```bash
# 建立 Docker 映像
docker build -t iiplatform .

# 執行容器
docker run -p 8000:8000 iiplatform
```

## 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發起 Pull Request

## 授權

本專案採用 MIT 授權條款。

## 聯絡資訊

- 專案維護者: [Your Name]
- Email: [your.email@example.com]
- 專案網站: [https://github.com/your-org/iiplatform]