# IIPlatform 工業物聯網平台

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 平台概述

IIPlatform 是一個專為工業環境設計的綜合性物聯網平台，提供從設備管理到 AI 分析的完整解決方案。平台採用現代化的微服務架構，支援多種通訊協定，並整合了先進的機器學習技術。

### 🌟 核心特色

- **🔧 多資料庫支援**: PostgreSQL + MongoDB + InfluxDB 統一管理
- **🤖 AI 整合**: 完整的機器學習模型生命週期管理
- **📊 即時監控**: 設備狀態和數據的即時監控
- **⚡ 可擴展性**: 模組化設計，易於擴展和維護
- **🔒 安全性**: JWT 認證、RBAC 權限控制
- **🎨 自定義儀表板**: 拖拽式個人化儀表板
- **📱 響應式設計**: 支援桌面和移動設備

## 🚀 快速開始

### 系統需求

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- MongoDB 4.4+
- InfluxDB 2.0+

### 快速安裝

#### 1. 克隆專案
```bash
git clone https://github.com/your-username/IIPlatform.git
cd IIPlatform
```

#### 2. 環境準備
```bash
# 建立 Python 虛擬環境
python3 -m venv iiplatform-env
source iiplatform-env/bin/activate  # Linux/Mac
# 或 iiplatform-env\Scripts\activate  # Windows

# 安裝後端依賴
cd backend
pip install -r requirements.txt

# 安裝前端依賴
cd ../frontend
npm install
```

#### 3. 資料庫設定
```bash
# 啟動資料庫服務
sudo systemctl start postgresql mongod influxdb

# 初始化資料庫
cd backend
python init_database_tables.py
```

#### 4. 啟動平台
```bash
# 使用啟動腳本
./start_platform.sh  # Linux/Mac
# 或 start_platform.bat  # Windows

# 或手動啟動
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd frontend && npm start
```

#### 5. 首次登入
- **URL**: http://localhost:3000
- **用戶名**: admin
- **密碼**: admin123

## 📋 功能模組

### 🏠 儀表板概覽
- 即時統計數據
- 設備狀態監控
- 自定義儀表板
- 快速操作入口

### 🔧 設備管理
- 設備註冊與配置
- 即時狀態監控
- 遠端控制功能
- OTA 韌體更新
- 設備分組管理

### 📊 數據處理
- 多源數據整合
- 即時數據處理
- 數據轉換與清洗
- 處理管道配置
- 數據品質監控

### 🤖 AI 模型管理
- 模型註冊與部署
- 性能監控
- 版本管理
- 外部模型整合
- GPU 資源管理

### 🎨 自定義儀表板
- 拖拽式佈局
- 多種圖表類型
- 個人化配置
- 響應式設計
- 數據源整合

### 📝 平台簡介客製化
- 內容編輯功能
- 圖片管理
- 分類存儲
- 即時預覽
- 版本控制

### 🚨 警報中心
- 即時警報通知
- 警報規則配置
- 多管道通知
- 警報處理流程
- 歷史記錄查詢

### 👥 用戶權限管理
- 角色權限控制
- 用戶管理
- 權限繼承
- 審計追蹤
- 安全認證

## 🛠️ 技術架構

### 前端技術
- **React.js**: 用戶界面框架
- **Ant Design**: UI 組件庫
- **React Router**: 路由管理
- **Chart.js**: 圖表庫
- **Axios**: HTTP 客戶端

### 後端技術
- **FastAPI**: Web 框架
- **SQLAlchemy**: ORM 框架
- **Pydantic**: 數據驗證
- **JWT**: 身份認證
- **Uvicorn**: ASGI 服務器

### 資料庫
- **PostgreSQL**: 結構化數據
- **MongoDB**: 文檔數據
- **InfluxDB**: 時序數據

### 通訊協定
- **MQTT**: 輕量級消息傳輸
- **Modbus TCP**: 工業控制協定
- **OPC UA**: 開放平台通訊
- **RESTful API**: HTTP 基礎通訊

## 📖 使用指南

詳細的使用指南請參考 [USER_MANUAL.md](USER_MANUAL.md)

### 主要功能使用

#### 設備管理
1. 進入「設備管理」頁面
2. 點擊「新增設備」
3. 填寫設備信息
4. 配置通訊協定
5. 保存設定

#### 自定義儀表板
1. 進入「自定義儀表板」
2. 點擊「添加圖表」
3. 選擇圖表類型
4. 配置數據源
5. 調整佈局

#### AI 模型管理
1. 進入「AI Model 管理」
2. 點擊「新增模型」
3. 選擇模型類型
4. 配置模型參數
5. 上傳或配置模型

## 🔧 開發指南

### 環境設定
```bash
# 開發依賴
pip install pytest pytest-asyncio black flake8
npm install --save-dev eslint prettier

# 代碼格式化
black backend/
flake8 backend/
npx eslint src/
npx prettier --write src/
```

### 測試
```bash
# 後端測試
cd backend && pytest tests/

# 前端測試
cd frontend && npm test
```

### 部署
```bash
# Docker 部署
docker-compose up -d

# 生產環境
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
npm run build
```

## 📊 系統效能

### 效能指標
- **響應時間**: API 響應時間 < 100ms
- **吞吐量**: 支援 10,000+ 並發連接
- **可用性**: 99.9% 系統可用性
- **數據處理**: 支援 100,000+ 數據點/秒

### 擴展性
- **水平擴展**: 支援多實例部署
- **模組化設計**: 功能模組獨立部署
- **插件架構**: 支援第三方插件
- **API 優先**: 完整的 API 支援

## 🔒 安全性

### 安全特性
- **JWT 認證**: 安全的身份認證
- **RBAC 權限**: 細粒度權限控制
- **數據加密**: 敏感數據加密存儲
- **審計追蹤**: 完整的操作審計
- **安全通訊**: HTTPS/TLS 加密

### 最佳實踐
- 定期更新系統套件
- 強密碼策略
- 防火牆配置
- 數據備份策略
- 安全監控

## 🤝 貢獻指南

### 參與貢獻
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 開發規範
- 遵循 PEP 8 Python 代碼規範
- 使用 ESLint 進行 JavaScript 代碼檢查
- 撰寫單元測試
- 更新相關文檔

## 📞 支援與聯繫

### 技術支援
- **文檔**: [USER_MANUAL.md](USER_MANUAL.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/IIPlatform/issues)
- **討論**: [GitHub Discussions](https://github.com/your-username/IIPlatform/discussions)

### 聯繫方式
- **郵件**: support@iiplatform.com
- **文檔**: https://docs.iiplatform.com
- **社區**: https://community.iiplatform.com

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

感謝所有為本專案做出貢獻的開發者和用戶！

---

**IIPlatform** - 讓工業物聯網更簡單、更智能、更安全！

*最後更新: 2024年1月15日*