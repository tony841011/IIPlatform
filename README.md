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
- **狀態管理**: React Hooks
- **HTTP 客戶端**: Axios

### 部署架構
- **容器化**: Docker
- **反向代理**: Nginx
- **負載平衡**: 支援水平擴展
- **監控**: 整合 Prometheus + Grafana

## 快速開始

### 環境需求
- Python 3.9+
- Node.js 16+
- Docker (可選)

### 安裝步驟

#### 1. 克隆專案
```bash
git clone <repository-url>
cd IIPlatform
```

#### 2. 後端設置
```bash
cd backend/app
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### 3. 初始化資料庫
```bash
cd backend
python init_db.py
python generate_test_data.py
```

#### 4. 啟動後端服務
```bash
cd backend/app
uvicorn main:app --reload
```

#### 5. 前端設置
```bash
cd frontend
npm install
npm start
```

#### 6. 訪問平台
- 前端: http://localhost:3000
- 後端 API: http://localhost:8000
- API 文檔: http://localhost:8000/docs

### 預設帳號
- **管理員**: admin / admin123
- **操作員**: operator1 / op123
- **檢視者**: viewer1 / view123
- **維護員**: maintenance1 / maint123

## 功能模組

### 核心模組
1. **儀表板** - 系統概覽與即時監控
2. **設備管理** - 設備註冊、控制、更新
3. **數據監控** - 即時數據與歷史分析
4. **AI 分析** - 機器學習與預測分析
5. **警報中心** - 警報管理與通知
6. **通訊協定** - 多協議支援配置

### 進階模組
7. **MLOps** - AI 模型生命週期管理
8. **視頻識別** - ONVIF 設備與 AI 分析
9. **ETL 處理** - 數據轉換與品質管理
10. **報表系統** - 自定義報表與排程
11. **GIS 整合** - 地理資訊與設備分佈
12. **邊緣網關** - 邊緣計算與本地處理

### 管理模組
13. **角色權限** - 用戶與權限管理
14. **通知偏好** - 個人化通知設定
15. **自動化工作流** - 規則引擎與流程
16. **審計日誌** - 系統操作記錄
17. **平台設定** - 系統配置管理

## 開發指南

### 專案結構
```
IIPlatform/
├── backend/                 # 後端服務
│   ├── app/
│   │   ├── main.py         # FastAPI 應用
│   │   ├── models.py       # 資料庫模型
│   │   ├── schemas.py      #
```