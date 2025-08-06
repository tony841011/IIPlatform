#!/usr/bin/env python3
"""
資料庫表格初始化腳本
用於創建首次登入設定所需的資料表
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def init_database_tables():
    """初始化資料庫表格"""
    try:
        from app.database import engine
        from app.models import Base
        
        print("正在創建資料庫表格...")
        
        # 創建所有表格
        Base.metadata.create_all(bind=engine)
        
        print("✓ 資料庫表格創建成功")
        
        # 檢查表格是否創建成功
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            print(f"\n已創建的表格:")
            for table in tables:
                print(f"  - {table}")
        
        return True
        
    except Exception as e:
        print(f"✗ 創建資料庫表格失敗: {str(e)}")
        return False

def check_database_connection():
    """檢查資料庫連線"""
    try:
        from app.database import engine
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✓ 資料庫連線正常")
            return True
    except Exception as e:
        print(f"✗ 資料庫連線失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("="*60)
    print("IIPlatform 資料庫表格初始化工具")
    print("="*60)
    
    # 檢查資料庫連線
    if not check_database_connection():
        print("\n請確保 PostgreSQL 服務正在運行，並且連線配置正確")
        return
    
    # 初始化表格
    if init_database_tables():
        print("\n" + "="*60)
        print("初始化完成！")
        print("="*60)
        print("\n現在可以啟動平台並進行首次登入設定")
    else:
        print("\n初始化失敗，請檢查錯誤訊息")

if __name__ == "__main__":
    main() 