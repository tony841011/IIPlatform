#!/usr/bin/env python3
"""
完整的後端啟動腳本
包含依賴檢查和系統初始化
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """檢查 Python 版本"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ 需要 Python 3.8 或更高版本")
        return False
    print(f"✅ Python 版本: {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """安裝依賴"""
    print("�� 檢查並安裝依賴...")
    
    try:
        # 嘗試安裝最小化依賴
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "app/requirements_minimal.txt"
        ], check=True)
        print("✅ 依賴安裝完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依賴安裝失敗: {e}")
        return False

def init_database():
    """初始化資料庫"""
    print("🔧 初始化資料庫...")
    
    try:
        from app.init_system_simple import main as init_main
        init_main()
        return True
    except Exception as e:
        print(f"❌ 資料庫初始化失敗: {e}")
        return False

def start_server():
    """啟動伺服器"""
    print("🚀 啟動後端服務...")
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"�� 服務地址: http://{host}:{port}")
    print("📚 API 文檔: http://localhost:8000/docs")
    print("📖 互動文檔: http://localhost:8000/redoc")
    print("🔄 按 Ctrl+C 停止服務")
    
    try:
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n�� 服務已停止")
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")

def main():
    """主函數"""
    print("🚀 IIPlatform 後端啟動器")
    print("=" * 50)
    
    # 檢查 Python 版本
    if not check_python_version():
        return
    
    # 檢查資料庫文件
    db_file = Path("iot.db")
    if not db_file.exists():
        print("⚠️  資料庫文件不存在，正在初始化...")
        if not init_database():
            return
    
    # 嘗試啟動服務
    try:
        start_server()
    except ImportError:
        print("❌ 缺少必要依賴，正在安裝...")
        if install_dependencies():
            start_server()
        else:
            print("❌ 無法安裝依賴，請手動執行: pip install -r app/requirements_minimal.txt")

if __name__ == "__main__":
    main() 