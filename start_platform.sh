#!/bin/bash

echo "🚀 啟動 IIPlatform 工業物聯網平台..."

# 檢查作業系統
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "⚠️  檢測到 Windows 系統，請使用 Windows 版本的啟動腳本"
    exit 1
fi

# 檢查必要工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安裝，請先安裝 $1"
        exit 1
    fi
}

echo "🔍 檢查必要工具..."
check_command python3
check_command pip
check_command node
check_command npm

# 檢查資料庫服務
echo "📊 檢查資料庫服務..."

# PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL 服務未運行，正在啟動..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo "⚠️  請手動啟動 PostgreSQL 服務"
    fi
else
    echo "✅ PostgreSQL 服務正常"
fi

# MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB 未安裝，跳過 MongoDB 檢查"
else
    if ! pgrep mongod > /dev/null; then
        echo "❌ MongoDB 服務未運行，正在啟動..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mongod
            sudo systemctl enable mongod
        else
            echo "⚠️  請手動啟動 MongoDB 服務"
        fi
    else
        echo "✅ MongoDB 服務正常"
    fi
fi

# InfluxDB
if ! command -v influxd &> /dev/null; then
    echo "⚠️  InfluxDB 未安裝，跳過 InfluxDB 檢查"
else
    if ! pgrep influxd > /dev/null; then
        echo "❌ InfluxDB 服務未運行，正在啟動..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start influxdb
            sudo systemctl enable influxdb
        else
            echo "⚠️  請手動啟動 InfluxDB 服務"
        fi
    else
        echo "✅ InfluxDB 服務正常"
    fi
fi

echo "✅ 資料庫服務檢查完成"

# 檢查 Python 虛擬環境
if [[ ! -d "venv" && ! -d "iiplatform-env" ]]; then
    echo "🔧 建立 Python 虛擬環境..."
    python3 -m venv venv
fi

# 啟動虛擬環境
if [[ -d "venv" ]]; then
    source venv/bin/activate
elif [[ -d "iiplatform-env" ]]; then
    source iiplatform-env/bin/activate
fi

# 檢查後端依賴
echo "🔧 檢查後端依賴..."
cd backend
if [[ ! -f "requirements.txt" ]]; then
    echo "❌ requirements.txt 不存在，請先建立後端專案"
    exit 1
fi

# 安裝後端依賴
echo "📦 安裝後端依賴..."
pip install -r requirements.txt

# 初始化資料庫
echo "�� 初始化資料庫..."
if [[ -f "init_all_databases.py" ]]; then
    python init_all_databases.py
else
    echo "⚠️  init_all_databases.py 不存在，跳過資料庫初始化"
fi

# 啟動後端服務
echo "🔧 啟動後端服務..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 等待後端啟動
echo "⏳ 等待後端服務啟動..."
sleep 10

# 檢查後端是否正常啟動
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 後端服務啟動成功"
else
    echo "❌ 後端服務啟動失敗"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# 檢查前端依賴
echo "🔧 檢查前端依賴..."
cd frontend
if [[ ! -f "package.json" ]]; then
    echo "❌ package.json 不存在，請先建立前端專案"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 安裝前端依賴
echo "📦 安裝前端依賴..."
npm install

# 啟動前端服務
echo "🔧 啟動前端服務..."
npm start &
FRONTEND_PID=$!

cd ..

echo "🎉 平台啟動完成！"
echo ""
echo "📊 服務資訊："
echo "  • 後端 API: http://localhost:8000"
echo "  • 前端介面: http://localhost:3000"
echo "  • API 文檔: http://localhost:8000/docs"
echo "  • 互動式 API: http://localhost:8000/redoc"
echo ""
echo "🔑 預設登入帳號："
echo "  • 用戶名: admin"
echo "  • 密碼: admin123"
echo ""
echo "📊 資料庫資訊："
echo "  • PostgreSQL: 用戶、角色、設備、告警等核心業務數據"
echo "  • MongoDB: 設備配置、AI模型、日誌、報表等非結構化數據"
echo "  • InfluxDB: 感測器數據、系統指標、AI分析結果等時序數據"
echo ""
echo "🛑 按 Ctrl+C 停止所有服務"

# 等待用戶中斷
trap "echo '🛑 正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服務已停止'; exit" INT
wait 