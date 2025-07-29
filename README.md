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