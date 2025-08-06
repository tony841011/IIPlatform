#!/usr/bin/env python3
"""
完整的資料庫初始化腳本
確保所有必要的表和欄位都被正確創建
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

def create_all_tables():
    """創建所有必要的表"""
    print("🔧 創建所有資料庫表...")
    
    # 創建資料庫引擎
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    with engine.connect() as conn:
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
        conn.execute(text(create_categories_table))
        
        # 2. 檢查並修復 devices 表
        print("�� 檢查 devices 表...")
        inspector = inspect(engine)
        device_columns = [col['name'] for col in inspector.get_columns('devices')]
        
        if 'category_id' not in device_columns:
            print("�� 添加 category_id 欄位到 devices 表...")
            add_category_id = """
            ALTER TABLE devices ADD COLUMN category_id INTEGER
            """
            conn.execute(text(add_category_id))
        
        # 3. 插入預設數據
        print("📝 插入預設數據...")
        
        # 插入預設角色
        insert_roles = """
        INSERT OR IGNORE INTO roles (name, display_name, description, level, is_system, is_active) 
        VALUES 
        ('admin', '系統管理員', '擁有所有權限的系統管理員', 999, 1, 1),
        ('operator', '操作員', '可以操作設備和查看數據的操作員', 100, 1, 1),
        ('viewer', '檢視者', '只能查看數據的檢視者', 10, 1, 1)
        """
        conn.execute(text(insert_roles))
        
        # 插入預設用戶
        insert_admin_user = """
        INSERT OR IGNORE INTO users (username, display_name, hashed_password, email, role_id, is_active, is_superuser)
        VALUES ('admin', '系統管理員', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8j8qKq', 'admin@iotplatform.com', 1, 1, 1)
        """
        conn.execute(text(insert_admin_user))
        
        # 插入預設設備類別
        insert_categories = """
        INSERT OR IGNORE INTO device_categories 
        (name, display_name, description, icon, color, order_index, is_system, created_by) 
        VALUES 
        ('sensor', '感測器', '各種類型的感測器設備', 'sensor', '#52c41a', 1, 1, 1),
        ('actuator', '執行器', '控制設備和執行器', 'actuator', '#1890ff', 2, 1, 1),
        ('controller', '控制器', '各種控制器設備', 'controller', '#722ed1', 3, 1, 1),
        ('monitor', '監控設備', '監控和顯示設備', 'monitor', '#fa8c16', 4, 1, 1)
        """
        conn.execute(text(insert_categories))
        
        conn.commit()
    
    print("✅ 所有表創建完成")

def verify_database():
    """驗證資料庫結構"""
    print("�� 驗證資料庫結構...")
    
    # 創建資料庫引擎
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    with engine.connect() as conn:
        # 檢查必要的表
        required_tables = ['users', 'roles', 'devices', 'device_categories']
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        for table in required_tables:
            if table in existing_tables:
                print(f"✅ {table} 表存在")
            else:
                print(f"❌ {table} 表不存在")
                return False
        
        # 檢查 devices 表的必要欄位
        device_columns = [col['name'] for col in inspector.get_columns('devices')]
        required_device_columns = ['id', 'name', 'location', 'category_id']
        
        for col in required_device_columns:
            if col in device_columns:
                print(f"✅ devices 表包含 {col} 欄位")
            else:
                print(f"❌ devices 表缺少 {col} 欄位")
                return False
        
        # 檢查預設數據
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        print(f"✅ 用戶數量: {user_count}")
        
        result = conn.execute(text("SELECT COUNT(*) FROM roles"))
        role_count = result.scalar()
        print(f"✅ 角色數量: {role_count}")
        
        result = conn.execute(text("SELECT COUNT(*) FROM device_categories"))
        category_count = result.scalar()
        print(f"✅ 設備類別數量: {category_count}")
    
    return True

def main():
    """主函數"""
    print("🚀 IIPlatform 完整資料庫初始化")
    print("=" * 50)
    
    try:
        # 創建所有表
        create_all_tables()
        
        # 驗證資料庫
        if verify_database():
            print("🎉 資料庫初始化成功！")
            print("\n📋 系統資訊:")
            print("   - 預設管理員: admin / admin123")
            print("   - 系統角色: admin, operator, viewer")
            print("   - 設備類別: sensor, actuator, controller, monitor")
            print("   - 資料庫: SQLite (iot.db)")
        else:
            print("❌ 資料庫初始化失敗")
            
    except Exception as e:
        print(f"❌ 初始化過程中發生錯誤: {e}")

if __name__ == "__main__":
    main() 