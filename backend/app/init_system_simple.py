#!/usr/bin/env python3
"""
簡化的系統初始化腳本
"""

import os
import sys
from pathlib import Path

# 添加當前目錄到 Python 路徑
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def init_database():
    """初始化資料庫"""
    try:
        from sqlalchemy import create_engine
        from models import Base
        
        print("🔧 初始化資料庫...")
        
        # 創建資料庫引擎
        SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
        
        # 創建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 資料庫表結構創建完成")
        return True
        
    except Exception as e:
        print(f"❌ 資料庫初始化失敗: {e}")
        return False

def init_system_data():
    """初始化系統數據"""
    try:
        from database import SessionLocal
        from models import DeviceCategory, User, Role
        from database import get_password_hash
        
        print("🔧 初始化系統數據...")
        
        db = SessionLocal()
        
        # 創建系統角色
        roles_data = [
            {"name": "admin", "display_name": "系統管理員", "description": "擁有所有權限", "level": 999, "is_system": True},
            {"name": "operator", "display_name": "操作員", "description": "可以操作設備", "level": 100, "is_system": True},
            {"name": "viewer", "display_name": "檢視者", "description": "只能查看數據", "level": 10, "is_system": True}
        ]
        
        for role_data in roles_data:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                role = Role(**role_data)
                db.add(role)
        
        db.commit()
        
        # 創建管理員用戶
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if admin_role:
            existing_admin = db.query(User).filter(User.username == "admin").first()
            if not existing_admin:
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
        
        # 創建設備類別
        categories_data = [
            {"name": "sensor", "display_name": "感測器", "description": "各種感測器", "icon": "sensor", "color": "#52c41a", "order_index": 1, "is_system": True, "created_by": 1},
            {"name": "actuator", "display_name": "執行器", "description": "控制設備", "icon": "actuator", "color": "#1890ff", "order_index": 2, "is_system": True, "created_by": 1},
            {"name": "controller", "display_name": "控制器", "description": "各種控制器", "icon": "controller", "color": "#722ed1", "order_index": 3, "is_system": True, "created_by": 1},
            {"name": "monitor", "display_name": "監控設備", "description": "監控設備", "icon": "monitor", "color": "#fa8c16", "order_index": 4, "is_system": True, "created_by": 1}
        ]
        
        for cat_data in categories_data:
            existing = db.query(DeviceCategory).filter(DeviceCategory.name == cat_data["name"]).first()
            if not existing:
                category = DeviceCategory(**cat_data)
                db.add(category)
        
        db.commit()
        db.close()
        
        print("✅ 系統數據初始化完成")
        return True
        
    except Exception as e:
        print(f"❌ 系統數據初始化失敗: {e}")
        return False

def main():
    """主函數"""
    print("�� 開始簡化系統初始化...")
    print("=" * 50)
    
    # 初始化資料庫
    if not init_database():
        print("❌ 初始化失敗")
        return
    
    # 初始化系統數據
    if not init_system_data():
        print("❌ 初始化失敗")
        return
    
    print("=" * 50)
    print("✅ 系統初始化完成！")
    print("\n📋 系統資訊:")
    print("   - 資料庫: SQLite (iot.db)")
    print("   - 預設管理員: admin / admin123")
    print("   - 系統角色: admin, operator, viewer")
    print("   - 設備類別: sensor, actuator, controller, monitor")

if __name__ == "__main__":
    main() 