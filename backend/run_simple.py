#!/usr/bin/env python3
"""
簡化的後端啟動腳本
"""

import os
import sys
from pathlib import Path

# 添加當前目錄到 Python 路徑
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def main():
    """主函數"""
    print("�� 啟動 IIPlatform 後端服務...")
    
    # 檢查資料庫文件
    db_file = current_dir / "iot.db"
    if not db_file.exists():
        print("⚠️  資料庫文件不存在，正在初始化...")
        try:
            from app.init_system_simple import main as init_main
            init_main()
        except Exception as e:
            print(f"❌ 初始化失敗: {e}")
            return
    
    # 啟動服務
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"�� 服務地址: http://{host}:{port}")
    print("📚 API 文檔: http://localhost:8000/docs")
    
    try:
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("❌ uvicorn 未安裝，請執行: pip install uvicorn[standard]")
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")

if __name__ == "__main__":
    main() 