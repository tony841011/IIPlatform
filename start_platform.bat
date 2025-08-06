@echo off
chcp 65001 >nul
echo 🚀 啟動 IIPlatform 工業物聯網平台...

REM 檢查必要工具
echo 🔍 檢查必要工具...

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安裝，請先安裝 Python
    pause
    exit /b 1
)

where pip >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip 未安裝，請先安裝 pip
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝，請先安裝 Node.js
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安裝，請先安裝 npm
    pause
    exit /b 1
)

echo ✅ 必要工具檢查完成

REM 檢查資料庫服務
echo 📊 檢查資料庫服務...

REM PostgreSQL
sc query postgresql >nul 2>&1
if %errorlevel% equ 0 (
    sc start postgresql >nul 2>&1
    echo ✅ PostgreSQL 服務已啟動
) else (
    echo ⚠️  PostgreSQL 服務未安裝或未配置
)

REM MongoDB
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    sc start MongoDB >nul 2>&1
    echo ✅ MongoDB 服務已啟動
) else (
    echo ⚠️  MongoDB 服務未安裝或未配置
)

REM InfluxDB
sc query influxdb >nul 2>&1
if %errorlevel% equ 0 (
    sc start influxdb >nul 2>&1
    echo ✅ InfluxDB 服務已啟動
) else (
    echo ⚠️  InfluxDB 服務未安裝或未配置
)

echo ✅ 資料庫服務檢查完成

REM 檢查 Python 虛擬環境
if not exist "venv" (
    if not exist "iiplatform-env" (
        echo 🔧 建立 Python 虛擬環境...
        python -m venv venv
    )
)

REM 啟動虛擬環境
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else if exist "iiplatform-env\Scripts\activate.bat" (
    call iiplatform-env\Scripts\activate.bat
)

REM 檢查後端依賴
echo 🔧 檢查後端依賴...
cd backend
if not exist "requirements.txt" (
    echo ❌ requirements.txt 不存在，請先建立後端專案
    pause
    exit /b 1
)

REM 安裝後端依賴
echo 📦 安裝後端依賴...
pip install -r requirements.txt

REM 初始化資料庫
echo 🔧 初始化資料庫...
if exist "init_all_databases.py" (
    python init_all_databases.py
) else (
    echo ⚠️  init_all_databases.py 不存在，跳過資料庫初始化
)

REM 啟動後端服務
echo 🔧 啟動後端服務...
start /B python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

REM 等待後端啟動
echo ⏳ 等待後端服務啟動...
timeout /t 10 /nobreak >nul

REM 檢查後端是否正常啟動
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 後端服務啟動成功
) else (
    echo ❌ 後端服務啟動失敗
    pause
    exit /b 1
)

cd ..

REM 檢查前端依賴
echo 🔧 檢查前端依賴...
cd frontend
if not exist "package.json" (
    echo ❌ package.json 不存在，請先建立前端專案
    pause
    exit /b 1
)

REM 安裝前端依賴
echo 📦 安裝前端依賴...
npm install

REM 啟動前端服務
echo 🔧 啟動前端服務...
start /B npm start

cd ..

echo.
echo 🎉 平台啟動完成！
echo.
echo 📊 服務資訊：
echo   • 後端 API: http://localhost:8000
echo   • 前端介面: http://localhost:3000
echo   • API 文檔: http://localhost:8000/docs
echo   • 互動式 API: http://localhost:8000/redoc
echo.
echo 🔑 預設登入帳號：
echo   • 用戶名: admin
echo   • 密碼: admin123
echo.
echo 📊 資料庫資訊：
echo   • PostgreSQL: 用戶、角色、設備、告警等核心業務數據
echo   • MongoDB: 設備配置、AI模型、日誌、報表等非結構化數據
echo   • InfluxDB: 感測器數據、系統指標、AI分析結果等時序數據
echo.
echo 🛑 按任意鍵停止所有服務

pause

echo 🛑 正在停止服務...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ 服務已停止 