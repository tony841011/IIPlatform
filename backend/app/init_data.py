# 創建初始化腳本
from app.database import SessionLocal
from app.models import DeviceCategory, User
import datetime

def init_device_categories():
    db = SessionLocal()
    try:
        # 檢查是否已有系統類別
        existing = db.query(DeviceCategory).filter(DeviceCategory.is_system == True).count()
        if existing > 0:
            print("系統類別已存在，跳過初始化")
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
                "is_system": True
            },
            {
                "name": "actuator",
                "display_name": "執行器",
                "description": "控制設備和執行器",
                "icon": "actuator",
                "color": "#1890ff",
                "order_index": 2,
                "is_system": True
            },
            {
                "name": "controller",
                "display_name": "控制器",
                "description": "各種控制器設備",
                "icon": "controller",
                "color": "#722ed1",
                "order_index": 3,
                "is_system": True
            },
            {
                "name": "monitor",
                "display_name": "監控設備",
                "description": "監控和顯示設備",
                "icon": "monitor",
                "color": "#fa8c16",
                "order_index": 4,
                "is_system": True
            }
        ]
        
        for category_data in system_categories:
            category = DeviceCategory(**category_data)
            db.add(category)
        
        db.commit()
        print("系統類別初始化完成")
        
    except Exception as e:
        print(f"初始化系統類別失敗: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_device_categories() 