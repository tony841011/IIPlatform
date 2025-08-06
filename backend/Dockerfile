FROM python:3.11-slim

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 複製 requirements.txt
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式代碼
COPY . .

# 創建資料庫
RUN python -c "from app.database import engine; from app.models import Base; Base.metadata.create_a 