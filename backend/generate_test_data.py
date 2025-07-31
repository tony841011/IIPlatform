import sys
import os
import random
import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Base, Device, DeviceData, User, Alert, DeviceGroup
from app.database import engine, SessionLocal
from app.main import get_password_hash

def generate_test_data():
    # 建立資料表
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. 建立設備群組
        print("建立設備群組...")
        groups = [
            DeviceGroup(name="生產線A"),
            DeviceGroup(name="生產線B"),
            DeviceGroup(name="包裝區"),
            DeviceGroup(name="倉儲區"),
            DeviceGroup(name="品質檢測")
        ]
        
        for group in groups:
            db.add(group)
        db.commit()
        
        # 2. 建立用戶
        print("建立測試用戶...")
        users = [
            User(username="admin", hashed_password=get_password_hash("admin123"), role="admin"),
            User(username="operator1", hashed_password=get_password_hash("op123"), role="user"),
            User(username="manager", hashed_password=get_password_hash("mgmt123"), role="manager")
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # 3. 建立設備
        print("建立測試設備...")
        devices = [
            Device(name="溫度感測器-01", location="生產線A-1號機", group=1, tags="溫度,感測器"),
            Device(name="壓力感測器-01", location="生產線A-2號機", group=1, tags="壓力,感測器"),
            Device(name="流量計-01", location="生產線A-3號機", group=1, tags="流量,計量"),
            Device(name="溫度感測器-02", location="生產線B-1號機", group=2, tags="溫度,感測器"),
            Device(name="振動感測器-01", location="生產線B-2號機", group=2, tags="振動,感測器"),
            Device(name="包裝機-01", location="包裝區-1號機", group=3, tags="包裝,機器"),
            Device(name="包裝機-02", location="包裝區-2號機", group=3, tags="包裝,機器"),
            Device(name="倉儲溫控-01", location="倉儲區-1號", group=4, tags="溫度,控制"),
            Device(name="品質檢測儀-01", location="檢測區-1號", group=5, tags="品質,檢測"),
            Device(name="品質檢測儀-02", location="檢測區-2號", group=5, tags="品質,檢測")
        ]
        
        for device in devices:
            db.add(device)
        db.commit()
        
        # 4. 生成歷史數據
        print("生成歷史數據...")
        base_time = datetime.datetime.now() - datetime.timedelta(days=7)
        
        for device_id in range(1, 11):  # 10個設備
            # 每個設備生成7天的數據，每小時一個數據點
            for hour in range(7 * 24):
                timestamp = base_time + datetime.timedelta(hours=hour)
                
                # 根據設備類型生成不同的數據範圍
                if "溫度" in devices[device_id-1].name:
                    value = random.uniform(20, 35)  # 溫度範圍
                elif "壓力" in devices[device_id-1].name:
                    value = random.uniform(1.5, 3.0)  # 壓力範圍
                elif "流量" in devices[device_id-1].name:
                    value = random.uniform(100, 200)  # 流量範圍
                elif "振動" in devices[device_id-1].name:
                    value = random.uniform(0.1, 0.5)  # 振動範圍
                elif "包裝" in devices[device_id-1].name:
                    value = random.uniform(80, 95)  # 包裝效率
                elif "倉儲" in devices[device_id-1].name:
                    value = random.uniform(18, 25)  # 倉儲溫度
                else:  # 品質檢測
                    value = random.uniform(95, 99)  # 品質分數
                
                # 偶爾生成異常數據
                if random.random() < 0.05:  # 5%機率生成異常
                    value *= random.uniform(1.5, 2.5)
                
                device_data = DeviceData(
                    device_id=device_id,
                    value=round(value, 2),
                    timestamp=timestamp
                )
                db.add(device_data)
        
        db.commit()
        
        # 5. 生成告警數據
        print("生成告警數據...")
        alert_messages = [
            "數值超出正常範圍",
            "設備運行異常",
            "溫度過高警告",
            "壓力異常警報",
            "流量異常",
            "振動過大",
            "包裝效率下降",
            "品質檢測不合格"
        ]
        
        # 從歷史數據中選擇一些異常值作為告警
        for device_id in range(1, 11):
            # 每個設備生成1-3個告警
            for _ in range(random.randint(1, 3)):
                # 隨機選擇一個時間點
                alert_time = base_time + datetime.timedelta(
                    hours=random.randint(0, 7 * 24),
                    minutes=random.randint(0, 59)
                )
                
                # 生成異常值
                if "溫度" in devices[device_id-1].name:
                    value = random.uniform(40, 50)  # 異常高溫
                elif "壓力" in devices[device_id-1].name:
                    value = random.uniform(4.0, 5.0)  # 異常高壓
                elif "流量" in devices[device_id-1].name:
                    value = random.uniform(250, 300)  # 異常流量
                elif "振動" in devices[device_id-1].name:
                    value = random.uniform(0.8, 1.2)  # 異常振動
                elif "包裝" in devices[device_id-1].name:
                    value = random.uniform(60, 70)  # 低效率
                elif "倉儲" in devices[device_id-1].name:
                    value = random.uniform(30, 35)  # 異常高溫
                else:  # 品質檢測
                    value = random.uniform(80, 85)  # 低品質
                
                alert = Alert(
                    device_id=device_id,
                    value=round(value, 2),
                    timestamp=alert_time,
                    message=random.choice(alert_messages)
                )
                db.add(alert)
        
        db.commit()
        
        print("✅ 測試數據生成完成！")
        print(f"📊 已建立 {len(groups)} 個設備群組")
        print(f"👥 已建立 {len(users)} 個用戶")
        print(f"🔧 已建立 {len(devices)} 個設備")
        print(f"📈 已生成約 {7 * 24 * 10} 筆歷史數據")
        print(f"🚨 已生成約 {len(devices) * 2} 筆告警數據")
        print("\n📝 測試帳號:")
        print("  管理員: admin / admin123")
        print("  操作員: operator1 / op123")
        print("  經理: manager / mgmt123")
        
    except Exception as e:
        print(f"❌ 生成測試數據時發生錯誤: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data() 