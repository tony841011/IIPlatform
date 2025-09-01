#!/usr/bin/env python3
"""
快速資料庫狀態檢查
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database_settings import get_database_configs
from app.database import engine
from sqlalchemy import text

def quick_check():
    print("🔍 快速檢查資料庫狀態...")
    print("=" * 50)
    
    # 顯示配置
    configs = get_database_configs()
    print("📋 資料庫配置:")
    for db_type, config in configs.items():
        if config.get("is_default", False):
            print(f"   ✅ {db_type.upper()}: {config['host']}:{config['port']}/{config['database']}")
        else:
            print(f"   ⏸️  {db_type.upper()}: {config['host']}:{config['port']}/{config['database']} (未啟用)")
    
    print("\n🔗 測試 PostgreSQL 連線...")
    try:
        with engine.connect() as conn:
            print("✅ PostgreSQL 連線成功")
            
            # 檢查表
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
            print(f"📋 發現 {len(tables)} 個資料表")
            
            # 檢查關鍵表
            key_tables = ['users', 'roles', 'database_connections']
            for table in key_tables:
                if table in tables:
                    print(f"   ✅ {table}")
                else:
                    print(f"   ❌ {table} (缺失)")
                    
    except Exception as e:
        print(f"❌ PostgreSQL 連線失敗: {e}")
    
    print("\n🎯 建議:")
    print("1. 如果連線失敗，檢查資料庫服務是否運行")
    print("2. 如果表缺失，運行 python init_database.py")
    print("3. 檢查防火牆和網路設定")

if __name__ == "__main__":
    quick_check() 