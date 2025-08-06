#!/bin/bash

echo "�� 開始安裝 IIPlatform 後端依賴..."
echo "=================================="

# 檢查 Python 版本
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
echo "Python 版本: $python_version"

# 升級基礎工具
echo " 升級基礎工具..."
python3 -m pip install --upgrade pip setuptools wheel

# 第一層：核心依賴 (必需)
echo ""
echo "📦 安裝核心依賴..."
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 sqlalchemy==2.0.23 pydantic==2.5.0

# 第二層：認證和安全
echo ""
echo "📦 安裝認證和安全依賴..."
pip install python-multipart==0.0.6 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4

# 第三層：資料處理
echo ""
echo "📦 安裝資料處理依賴..."
pip install numpy==1.24.3 pandas==2.0.3 python-dateutil==2.8.2 pytz==2023.3

# 第四層：網路和通訊
echo ""
echo "📦 安裝網路和通訊依賴..."
pip install requests==2.31.0 websockets==11.0.3 python-socketio==5.9.0 aiofiles==23.2.1

# 第五層：環境配置
echo ""
echo "📦 安裝環境配置..."
pip install python-dotenv==1.0.0

# 第六層：多資料庫支援 (可選)
echo ""
echo "📦 安裝多資料庫支援..."
pip install pymongo==4.6.0 influxdb-client==1.38.0 psycopg2-binary==2.9.7

# 第七層：IoT 通訊協定 (可選)
echo ""
echo "📦 安裝 IoT 通訊協定..."
pip install paho-mqtt==1.6.1 pymodbus==3.5.4

# 第八層：AI/ML 框架 (可選)
echo ""
echo "📦 安裝 AI/ML 框架..."
pip install scikit-learn==1.3.0

# 第九層：圖像處理 (可選)
echo ""
echo "📦 安裝圖像處理..."
pip install opencv-python==4.8.1.78 pillow==10.0.1

# 第十層：數據可視化 (可選)
echo ""
echo "📦 安裝數據可視化..."
pip install matplotlib==3.7.2 seaborn==0.12.2

# 第十一層：開發工具 (可選)
echo ""
echo "📦 安裝開發工具..."
pip install pytest==7.4.3 httpx==0.25.2

# 第十二層：日誌和監控 (可選)
echo ""
echo "📦 安裝日誌和監控..."
pip install loguru==0.7.2

echo ""
echo "✅ 依賴安裝完成！"
echo ""
echo " 安裝的套件:"
pip list | grep -E "(fastapi|uvicorn|sqlalchemy|pydantic|numpy|pandas|requests|pymongo|influxdb|psycopg2|paho-mqtt|scikit-learn|opencv|matplotlib)" 