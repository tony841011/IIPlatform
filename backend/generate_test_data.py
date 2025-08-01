import sys
import os
import random
import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Base, Device, DeviceData, User, Alert, DeviceGroup, Role, Firmware, Rule, Workflow, CommunicationProtocol, MQTTConfig, ModbusTCPConfig, OPCUAConfig
from app.database import engine, SessionLocal
from app.main import get_password_hash

def generate_test_data():
    # 建立資料表
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. 建立角色
        print("建立角色...")
        roles = [
            Role(name="admin", description="系統管理員", permissions={"all": True}),
            Role(name="operator", description="操作員", permissions={"device_control": True, "view_data": True}),
            Role(name="viewer", description="檢視者", permissions={"view_data": True}),
            Role(name="maintenance", description="維護人員", permissions={"device_maintenance": True, "view_data": True})
        ]
        
        for role in roles:
            db.add(role)
        db.commit()
        
        # 2. 建立設備群組
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
        
        # 3. 建立用戶
        print("建立測試用戶...")
        users = [
            User(username="admin", hashed_password=get_password_hash("admin123"), role="admin", email="admin@company.com"),
            User(username="operator1", hashed_password=get_password_hash("op123"), role="operator", email="op1@company.com"),
            User(username="viewer1", hashed_password=get_password_hash("view123"), role="viewer", email="viewer1@company.com"),
            User(username="maintenance1", hashed_password=get_password_hash("maint123"), role="maintenance", email="maint1@company.com")
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # 4. 建立設備
        print("建立測試設備...")
        devices = [
            Device(name="溫度感測器-01", location="生產線A-1號機", group=1, tags="溫度,感測器", device_type="sensor", status="online", firmware_version="v1.2.3", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="壓力感測器-01", location="生產線A-2號機", group=1, tags="壓力,感測器", device_type="sensor", status="online", firmware_version="v1.1.5", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="流量計-01", location="生產線A-3號機", group=1, tags="流量,計量", device_type="sensor", status="online", firmware_version="v2.0.1", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="溫度感測器-02", location="生產線B-1號機", group=2, tags="溫度,感測器", device_type="sensor", status="online", firmware_version="v1.2.3", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="振動感測器-01", location="生產線B-2號機", group=2, tags="振動,感測器", device_type="sensor", status="online", firmware_version="v1.0.8", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="包裝機-01", location="包裝區-1號機", group=3, tags="包裝,機器", device_type="actuator", status="online", firmware_version="v3.1.2", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="包裝機-02", location="包裝區-2號機", group=3, tags="包裝,機器", device_type="actuator", status="maintenance", firmware_version="v3.1.1", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="倉儲溫控-01", location="倉儲區-1號", group=4, tags="溫度,控制", device_type="controller", status="online", firmware_version="v2.5.0", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="品質檢測儀-01", location="檢測區-1號", group=5, tags="品質,檢測", device_type="sensor", status="online", firmware_version="v4.0.1", is_registered=True, registration_date=datetime.datetime.utcnow()),
            Device(name="品質檢測儀-02", location="檢測區-2號", group=5, tags="品質,檢測", device_type="sensor", status="offline", firmware_version="v4.0.0", is_registered=True, registration_date=datetime.datetime.utcnow())
        ]
        
        for device in devices:
            db.add(device)
        db.commit()
        
        # 5. 生成歷史數據
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
        
        # 6. 生成告警數據
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
        
        # 7. 生成韌體
        print("生成韌體數據...")
        firmwares = [
            Firmware(version="v1.2.3", description="溫度感測器韌體更新", device_type="sensor", is_active=True),
            Firmware(version="v2.0.1", description="流量計韌體更新", device_type="sensor", is_active=True),
            Firmware(version="v3.1.2", description="包裝機韌體更新", device_type="actuator", is_active=True),
            Firmware(version="v4.0.1", description="品質檢測儀韌體更新", device_type="sensor", is_active=True),
            Firmware(version="v2.5.0", description="溫控器韌體更新", device_type="controller", is_active=True)
        ]
        
        for firmware in firmwares:
            db.add(firmware)
        db.commit()
        
        # 8. 生成規則
        print("生成規則數據...")
        rules = [
            Rule(
                name="溫度異常告警",
                description="當溫度超過35度時發送告警",
                conditions={"temperature": 35, "operator": ">"},
                actions={"type": "alert", "message": "溫度異常告警"},
                is_active=True,
                created_by=1
            ),
            Rule(
                name="壓力異常告警",
                description="當壓力超過3.5時發送告警",
                conditions={"pressure": 3.5, "operator": ">"},
                actions={"type": "alert", "message": "壓力異常告警"},
                is_active=True,
                created_by=1
            ),
            Rule(
                name="品質檢測不合格",
                description="當品質分數低於90時發送告警",
                conditions={"quality": 90, "operator": "<"},
                actions={"type": "alert", "message": "品質檢測不合格"},
                is_active=True,
                created_by=1
            )
        ]
        
        for rule in rules:
            db.add(rule)
        db.commit()
        
        # 9. 生成工作流程
        print("生成工作流程數據...")
        workflows = [
            Workflow(
                name="設備維護流程",
                description="當設備狀態為維護時觸發的流程",
                trigger_type="event",
                trigger_conditions={"device_status": "maintenance"},
                steps=[
                    {"step": 1, "action": "send_notification", "params": {"type": "email", "to": "maintenance@company.com"}},
                    {"step": 2, "action": "create_ticket", "params": {"priority": "high"}},
                    {"step": 3, "action": "update_device_status", "params": {"status": "maintenance"}}
                ],
                is_active=True,
                created_by=1
            ),
            Workflow(
                name="異常處理流程",
                description="當檢測到異常時的處理流程",
                trigger_type="event",
                trigger_conditions={"alert_type": "critical"},
                steps=[
                    {"step": 1, "action": "send_alert", "params": {"channels": ["email", "sms"]}},
                    {"step": 2, "action": "stop_related_devices", "params": {"device_group": "production"}},
                    {"step": 3, "action": "notify_operator", "params": {"priority": "urgent"}}
                ],
                is_active=True,
                created_by=1
            )
        ]
        
        for workflow in workflows:
            db.add(workflow)
        db.commit()
        
        # 10. 生成通訊協定配置
        print("生成通訊協定配置...")
        
        # MQTT 配置
        mqtt_configs = [
            MQTTConfig(device_id=1, broker_url="mqtt://localhost", broker_port=1883, topic_prefix="sensor/temp", qos_level=1),
            MQTTConfig(device_id=2, broker_url="mqtt://localhost", broker_port=1883, topic_prefix="sensor/pressure", qos_level=1),
            MQTTConfig(device_id=3, broker_url="mqtt://localhost", broker_port=1883, topic_prefix="sensor/flow", qos_level=1),
            MQTTConfig(device_id=4, broker_url="mqtt://localhost", broker_port=1883, topic_prefix="sensor/temp", qos_level=1),
            MQTTConfig(device_id=5, broker_url="mqtt://localhost", broker_port=1883, topic_prefix="sensor/vibration", qos_level=1)
        ]
        
        for config in mqtt_configs:
            db.add(config)
        
        # Modbus TCP 配置
        modbus_configs = [
            ModbusTCPConfig(device_id=6, host="192.168.1.100", port=502, unit_id=1),
            ModbusTCPConfig(device_id=7, host="192.168.1.101", port=502, unit_id=1),
            ModbusTCPConfig(device_id=8, host="192.168.1.102", port=502, unit_id=1)
        ]
        
        for config in modbus_configs:
            db.add(config)
        
        # OPC UA 配置
        opc_ua_configs = [
            OPCUAConfig(device_id=9, server_url="opc.tcp://192.168.1.200:4840", node_id="ns=2;s=QualitySensor1"),
            OPCUAConfig(device_id=10, server_url="opc.tcp://192.168.1.201:4840", node_id="ns=2;s=QualitySensor2")
        ]
        
        for config in opc_ua_configs:
            db.add(config)
        
        # 通訊協定配置
        protocols = [
            CommunicationProtocol(device_id=1, protocol_type="mqtt", config={"topic": "sensor/temp/01", "qos": 1}),
            CommunicationProtocol(device_id=2, protocol_type="mqtt", config={"topic": "sensor/pressure/01", "qos": 1}),
            CommunicationProtocol(device_id=3, protocol_type="mqtt", config={"topic": "sensor/flow/01", "qos": 1}),
            CommunicationProtocol(device_id=4, protocol_type="mqtt", config={"topic": "sensor/temp/02", "qos": 1}),
            CommunicationProtocol(device_id=5, protocol_type="mqtt", config={"topic": "sensor/vibration/01", "qos": 1}),
            CommunicationProtocol(device_id=6, protocol_type="modbus_tcp", config={"register": "40001", "count": 10}),
            CommunicationProtocol(device_id=7, protocol_type="modbus_tcp", config={"register": "40001", "count": 10}),
            CommunicationProtocol(device_id=8, protocol_type="modbus_tcp", config={"register": "40001", "count": 10}),
            CommunicationProtocol(device_id=9, protocol_type="opc_ua", config={"node_id": "ns=2;s=QualitySensor1"}),
            CommunicationProtocol(device_id=10, protocol_type="opc_ua", config={"node_id": "ns=2;s=QualitySensor2"})
        ]
        
        for protocol in protocols:
            db.add(protocol)
        
        db.commit()
        
        print("✅ 測試數據生成完成！")
        print(f"👥 已建立 {len(roles)} 個角色")
        print(f"📊 已建立 {len(groups)} 個設備群組")
        print(f"👤 已建立 {len(users)} 個用戶")
        print(f"🔧 已建立 {len(devices)} 個設備")
        print(f"📈 已生成約 {7 * 24 * 10} 筆歷史數據")
        print(f"🚨 已生成約 {len(devices) * 2} 筆告警數據")
        print(f"💾 已建立 {len(firmwares)} 個韌體")
        print(f"⚙️  已建立 {len(rules)} 個規則")
        print(f"🔄 已建立 {len(workflows)} 個工作流程")
        print(f"📡 已建立 {len(mqtt_configs)} 個 MQTT 配置")
        print(f"🔌 已建立 {len(modbus_configs)} 個 Modbus TCP 配置")
        print(f"🌐 已建立 {len(opc_ua_configs)} 個 OPC UA 配置")
        print(f"📋 已建立 {len(protocols)} 個通訊協定配置")
        print("\n📝 測試帳號:")
        print("  管理員: admin / admin123")
        print("  操作員: operator1 / op123")
        print("  檢視者: viewer1 / view123")
        print("  維護員: maintenance1 / maint123")
        
    except Exception as e:
        print(f"❌ 生成測試數據時發生錯誤: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data() 