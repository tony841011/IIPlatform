#!/usr/bin/env python3
"""
系統初始化腳本
用於創建資料庫表結構和初始化系統數據
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# 添加當前目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Base, DeviceCategory, User, Role
from database import SessionLocal

def init_database():
    """初始化資料庫"""
    print("🔧 初始化資料庫...")
    
    # 創建資料庫引擎
    SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    # 創建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 資料庫表結構創建完成")

def init_system_roles():
    """初始化系統角色"""
    print("�� 初始化系統角色...")
    
    db = SessionLocal()
    try:
        # 檢查是否已有角色
        existing_roles = db.query(Role).count()
        if existing_roles > 0:
            print("⚠️  系統角色已存在，跳過初始化")
            return
        
        # 創建系統角色
        system_roles = [
            {
                "name": "admin",
                "display_name": "系統管理員",
                "description": "擁有所有權限的系統管理員",
                "level": 999,
                "is_system": True
            },
            {
                "name": "operator",
                "display_name": "操作員",
                "description": "可以操作設備和查看數據的操作員",
                "level": 100,
                "is_system": True
            },
            {
                "name": "viewer",
                "display_name": "檢視者",
                "description": "只能查看數據的檢視者",
                "level": 10,
                "is_system": True
            }
        ]
        
        for role_data in system_roles:
            role = Role(**role_data)
            db.add(role)
        
        db.commit()
        print("✅ 系統角色初始化完成")
        
    except Exception as e:
        print(f"❌ 系統角色初始化失敗: {e}")
        db.rollback()
    finally:
        db.close()

def init_system_users():
    """初始化系統用戶"""
    print("�� 初始化系統用戶...")
    
    db = SessionLocal()
    try:
        # 檢查是否已有用戶
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  系統用戶已存在，跳過初始化")
            return
        
        # 獲取管理員角色
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            print("❌ 找不到管理員角色，請先初始化系統角色")
            return
        
        # 創建預設管理員用戶
        from database import get_password_hash
        
        admin_user = User(
            username="admin",
            display_name="系統管理員",
            hashed_password=get_password_hash("admin123"),
            email="admin@iotplatform.com",
            role_id=admin_role.id,
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        db.commit()
        print("✅ 系統用戶初始化完成")
        print("   預設管理員帳號: admin")
        print("   預設密碼: admin123")
        
    except Exception as e:
        print(f"❌ 系統用戶初始化失敗: {e}")
        db.rollback()
    finally:
        db.close()

def init_device_categories():
    """初始化設備類別"""
    print("�� 初始化設備類別...")
    
    db = SessionLocal()
    try:
        # 檢查是否已有類別
        existing_categories = db.query(DeviceCategory).count()
        if existing_categories > 0:
            print("⚠️  設備類別已存在，跳過初始化")
            return
        
        # 創建系統類別
        system_categories = [
            {
                "name": "sensor",
                "display_name": "感測器",
                "description": "各種類型的感測器設備",
                "icon": "sensor",
                "color": "#52c41a",
                "order_index": 1,
                "is_system": True,
                "created_by": 1  # 假設管理員用戶 ID 為 1
            },
            {
                "name": "actuator",
                "display_name": "執行器",
                "description": "控制設備和執行器",
                "icon": "actuator",
                "color": "#1890ff",
                "order_index": 2,
                "is_system": True,
                "created_by": 1
            },
            {
                "name": "controller",
                "display_name": "控制器",
                "description": "各種控制器設備",
                "icon": "controller",
                "color": "#722ed1",
                "order_index": 3,
                "is_system": True,
                "created_by": 1
            },
            {
                "name": "monitor",
                "display_name": "監控設備",
                "description": "監控和顯示設備",
                "icon": "monitor",
                "color": "#fa8c16",
                "order_index": 4,
                "is_system": True,
                "created_by": 1
            }
        ]
        
        for category_data in system_categories:
            category = DeviceCategory(**category_data)
            db.add(category)
        
        db.commit()
        print("✅ 設備類別初始化完成")
        
    except Exception as e:
        print(f"❌ 設備類別初始化失敗: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """主函數"""
    print("🚀 開始系統初始化...")
    print("=" * 50)
    
    try:
        # 初始化資料庫
        init_database()
        
        # 初始化系統角色
        init_system_roles()
        
        # 初始化系統用戶
        init_system_users()
        
        # 初始化設備類別
        init_device_categories()
        
        print("=" * 50)
        print("�� 系統初始化完成！")
        print("\n📋 系統資訊:")
        print("   - 資料庫: SQLite (iot.db)")
        print("   - 預設管理員: admin / admin123")
        print("   - 系統角色: admin, operator, viewer")
        print("   - 設備類別: sensor, actuator, controller, monitor")
        
    except Exception as e:
        print(f"❌ 系統初始化失敗: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 