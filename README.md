# IIPlatform 工廠物聯網平台

## 啟動方式

### 後端
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端
```bash
cd frontend
npm install
npm start
```

### MQTT 測試
```bash
python mqtt_client.py
```

---

## 快速建置與啟動指南

### 一、環境需求
1. Python 3.9+（建議用 venv 虛擬環境）
2. Node.js 16+（含 npm）
3. MQTT Broker（如 Mosquitto，若需測試 MQTT）

### 二、快速建置步驟

#### 1. 下載/複製專案
```bash
git clone <你的 repo 位置>
cd IIPlatform
```

#### 2. 後端建置（FastAPI）

(1) 建立虛擬環境並安裝依賴
```bash
cd backend/app
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

(2) 初始化資料庫
```python
# 在 backend/app 目錄下執行
python
>>> from database import Base, engine
>>> import models
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

(3) 啟動後端服務
```bash
uvicorn main:app --reload
```
後端預設監聽 http://localhost:8000

#### 3. 前端建置（React）
```bash
cd frontend
npm install
npm start
```
前端預設監聽 http://localhost:3000

#### 4. 測試 MQTT（如需）
安裝 Mosquitto 或其他 MQTT Broker，啟動後可用 backend/app/mqtt_client.py 測試資料上傳。
```bash
python mqtt_client.py
```

#### 5. 平台測試與驗證
- 註冊/登入：可用 Postman 或前端頁面（如有）測試 /register、/token。
- 設備管理：可用 API 或前端新增設備、分群、標籤。
- 即時資料：用 MQTT 或 API 上傳資料，前端儀表板即時顯示。
- 異常告警：上傳異常數值，前端即時彈窗與告警列表。
- 歷史查詢/AI：選擇設備，查看歷史折線圖與 AI 分析結果。

### 三、常見問題與加速技巧
- 依賴安裝失敗：確認 Python/Node 版本正確，必要時用 pip install --upgrade pip。
- 資料庫結構異動：如有修改 models，需重新建立資料表（或用 Alembic 做遷移）。
- CORS 問題：已預設允許全部來源，若有跨域問題可調整 main.py 的 CORS 設定。
- 多台設備測試：可複製多份 mqtt_client.py，改不同 device_id 模擬多設備。

### 四、進階建議
- Docker 化：可用 Docker Compose 一鍵啟動前後端與 Mosquitto。
- 自動化腳本：可寫一個 setup.bat 或 setup.sh，自動完成上述所有步驟。
- API 文件：後端啟動後可直接瀏覽 http://localhost:8000/docs 查看自動生成的 Swagger API 文件。

---