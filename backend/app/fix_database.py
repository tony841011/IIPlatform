#!/usr/bin/env python3
"""
資料庫修復腳本
修復現有資料庫結構，添加缺失的欄位和表
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
import datetime

# 添加當前目錄到 Python 路徑
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def check_database_structure():
    """檢查資料庫結構"""
    print("�� 檢查資料庫結構...")
    
    # 創建資料庫引擎
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    # 檢查表是否存在
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"現有表: {existing_tables}")
    
    # 檢查 devices 表的欄位
    if 'devices' in existing_tables:
        device_columns = [col['name'] for col in inspector.get_columns('devices')]
        print(f"devices 表欄位: {device_columns}")
        
        # 檢查是否缺少 category_id 欄位
        if 'category_id' not in device_columns:
            print("❌ devices 表缺少 category_id 欄位")
            return False, "缺少 category_id 欄位"
    
    # 檢查 device_categories 表是否存在
    if 'device_categories' not in existing_tables:
        print("❌ device_categories 表不存在")
        return False, "缺少 device_categories 表"
    
    print("✅ 資料庫結構檢查完成")
    return True, "結構正常"

def fix_database():
    """修復資料庫結構"""
    print("🔧 開始修復資料庫結構...")
    
    # 創建資料庫引擎和會話
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # 使用會話來執行操作
    db = SessionLocal()
    
    try:
        # 1. 創建 device_categories 表
        print("📝 創建 device_categories 表...")
        create_categories_table = """
        CREATE TABLE IF NOT EXISTS device_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) UNIQUE NOT NULL,
            display_name VARCHAR(200) NOT NULL,
            description TEXT,
            icon VARCHAR(100),
            color VARCHAR(20),
            parent_id INTEGER,
            order_index INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            is_system BOOLEAN DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES device_categories (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        """
        db.execute(text(create_categories_table))
        
        # 2. 檢查 devices 表是否有 category_id 欄位
        inspector = inspect(engine)
        device_columns = [col['name'] for col in inspector.get_columns('devices')]
        
        if 'category_id' not in device_columns:
            print(" 添加 category_id 欄位到 devices 表...")
            add_category_id = """
            ALTER TABLE devices ADD COLUMN category_id INTEGER
            """
            db.execute(text(add_category_id))
        
        # 3. 插入預設的設備類別
        print("📝 插入預設設備類別...")
        insert_categories = """
        INSERT OR IGNORE INTO device_categories 
        (name, display_name, description, icon, color, order_index, is_system, created_by) 
        VALUES 
        ('sensor', '感測器', '各種類型的感測器設備', 'sensor', '#52c41a', 1, 1, 1),
        ('actuator', '執行器', '控制設備和執行器', 'actuator', '#1890ff', 2, 1, 1),
        ('controller', '控制器', '各種控制器設備', 'controller', '#722ed1', 3, 1, 1),
        ('monitor', '監控設備', '監控和顯示設備', 'monitor', '#fa8c16', 4, 1, 1)
        """
        db.execute(text(insert_categories))
        
        # 提交事務
        db.commit()
        
    except Exception as e:
        print(f"❌ 修復過程中發生錯誤: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("✅ 資料庫修復完成")

def verify_fix():
    """驗證修復結果"""
    print("🔍 驗證修復結果...")
    
    # 創建資料庫引擎
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    try:
        # 檢查 device_categories 表
        result = db.execute(text("SELECT COUNT(*) FROM device_categories"))
        category_count = result.scalar()
        print(f"✅ device_categories 表有 {category_count} 條記錄")
        
        # 檢查 devices 表的 category_id 欄位
        inspector = inspect(engine)
        device_columns = [col['name'] for col in inspector.get_columns('devices')]
        if 'category_id' in device_columns:
            print("✅ devices 表已包含 category_id 欄位")
        else:
            print("❌ devices 表仍缺少 category_id 欄位")
            return False
        
        # 檢查預設類別
        result = db.execute(text("SELECT name, display_name FROM device_categories"))
        categories = result.fetchall()
        print("✅ 預設設備類別:")
        for category in categories:
            print(f"   - {category[0]}: {category[1]}")
    
    finally:
        db.close()
    
    return True

def main():
    """主函數"""
    print(" IIPlatform 資料庫修復工具")
    print("=" * 50)
    
    # 檢查資料庫文件是否存在
    db_file = Path("iot.db")
    if not db_file.exists():
        print("❌ 資料庫文件不存在，請先初始化系統")
        return
    
    # 檢查當前結構
    is_ok, message = check_database_structure()
    
    if is_ok:
        print("✅ 資料庫結構正常，無需修復")
        return
    
    print(f"⚠️  發現問題: {message}")
    print(" 開始修復...")
    
    try:
        # 修復資料庫
        fix_database()
        
        # 驗證修復結果
        if verify_fix():
            print("🎉 資料庫修復成功！")
            print("\n📋 修復內容:")
            print("   - 創建了 device_categories 表")
            print("   - 添加了 category_id 欄位到 devices 表")
            print("   - 插入了預設的設備類別")
        else:
            print("❌ 資料庫修復失敗")
            
    except Exception as e:
        print(f"❌ 修復過程中發生錯誤: {e}")

if __name__ == "__main__":
    main() 