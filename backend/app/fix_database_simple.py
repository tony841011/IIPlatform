#!/usr/bin/env python3
"""
簡化的資料庫修復腳本
使用原生 SQLite 操作避免 SQLAlchemy 問題
"""

import sqlite3
import os
from pathlib import Path

def fix_database_simple():
    """使用原生 SQLite 修復資料庫"""
    print("🔧 使用原生 SQLite 修復資料庫...")
    
    db_path = "iot.db"
    if not os.path.exists(db_path):
        print("❌ 資料庫文件不存在")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. 創建 device_categories 表
        print("📝 創建 device_categories 表...")
        cursor.execute("""
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
        """)
        
        # 2. 檢查 devices 表是否有 category_id 欄位
        cursor.execute("PRAGMA table_info(devices)")
        device_columns = [column[1] for column in cursor.fetchall()]
        
        if 'category_id' not in device_columns:
            print("�� 添加 category_id 欄位到 devices 表...")
            cursor.execute("ALTER TABLE devices ADD COLUMN category_id INTEGER")
        
        # 3. 插入預設的設備類別
        print("📝 插入預設設備類別...")
        categories_data = [
            ('sensor', '感測器', '各種類型的感測器設備', 'sensor', '#52c41a', 1, 1, 1),
            ('actuator', '執行器', '控制設備和執行器', 'actuator', '#1890ff', 2, 1, 1),
            ('controller', '控制器', '各種控制器設備', 'controller', '#722ed1', 3, 1, 1),
            ('monitor', '監控設備', '監控和顯示設備', 'monitor', '#fa8c16', 4, 1, 1)
        ]
        
        for category in categories_data:
            cursor.execute("""
            INSERT OR IGNORE INTO device_categories 
            (name, display_name, description, icon, color, order_index, is_system, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, category)
        
        # 提交事務
        conn.commit()
        print("✅ 資料庫修復完成")
        
        # 驗證結果
        cursor.execute("SELECT COUNT(*) FROM device_categories")
        category_count = cursor.fetchone()[0]
        print(f"✅ device_categories 表有 {category_count} 條記錄")
        
        cursor.execute("SELECT name, display_name FROM device_categories")
        categories = cursor.fetchall()
        print("✅ 預設設備類別:")
        for category in categories:
            print(f"   - {category[0]}: {category[1]}")
        
        return True
        
    except Exception as e:
        print(f"❌ 修復過程中發生錯誤: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """主函數"""
    print("�� IIPlatform 簡化資料庫修復工具")
    print("=" * 50)
    
    if fix_database_simple():
        print("�� 資料庫修復成功！")
        print("\n📋 修復內容:")
        print("   - 創建了 device_categories 表")
        print("   - 添加了 category_id 欄位到 devices 表")
        print("   - 插入了預設的設備類別")
    else:
        print("❌ 資料庫修復失敗")

if __name__ == "__main__":
    main() 