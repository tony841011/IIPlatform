import sys
        
        # 生成平台設定測試資料
        print("生成平台設定測試資料...")
        from app.models import PlatformSettings, PlatformInfo, UserRoleSwitch, UserSession
        
        # 平台設定
        platform_settings = [
            PlatformSettings(
                setting_key="platform_name",
                setting_value="IIoT 工廠物聯網平台",
                setting_type="string",
                description="平台名稱",
                category="general",
                is_public=True
            ),
            PlatformSettings(
                setting_key="theme_color",
                setting_value="#1890ff",
                setting_type="string",
                description="主題色彩",
                category="appearance",
                is_public=True
            ),
            PlatformSettings(
                setting_key="session_timeout",
                setting_value="480",
                setting_type="number",
                description="會話超時時間（分鐘）",
                category="security",
                is_public=False
            ),
            PlatformSettings(
                setting_key="enable_notifications",
                setting_value="true",
                setting_type="boolean",
                description="啟用通知",
                category="notification",
                is_public=True
            ),
            PlatformSettings(
                setting_key="max_file_upload_size",
                setting_value="10485760",
                setting_type="number",
                description="最大檔案上傳大小（位元組）",
                category="general",
                is_public=False
            ),
            PlatformSettings(
                setting_key="enable_ai_features",
                setting_value="true",
                setting_type="boolean",
                description="啟用 AI 功能",
                category="features",
                is_public=True
            ),
            PlatformSettings(
                setting_key="enable_gpu_monitoring",
                setting_value="true",
                setting_type="boolean",
                description="啟用 GPU 監控",
                category="features",
                is_public=True
            ),
            PlatformSettings(
                setting_key="enable_etl_processing",
                setting_value="true",
                setting_type="boolean",
                description="啟用 ETL 處理",
                category="features",
                is_public=True
            )
        ]
        
        for setting in platform_settings:
            db.add(setting)
        db.commit()
        
        # 平台資訊
        platform_info = PlatformInfo(
            platform_name="IIoT 工廠物聯網平台",
            version="v2.0.0",
            description="完整的工業物聯網解決方案，支援設備管理、數據分析、AI 預測等功能",
            company_name="智慧製造科技有限公司",
            contact_email="support@smartmanufacturing.com",
            website="https://www.smartmanufacturing.com",
            logo_url="/logo.png",
            theme_config={
                "primary_color": "#1890ff",
                "secondary_color": "#52c41a",
                "dark_mode": False,
                "font_family": "Arial, sans-serif",
                "border_radius": "6px"
            },
            features={
                "device_management": True,
                "data_analysis": True,
                "ai_prediction": True,
                "etl_processing": True,
                "gpu_monitoring": True,
                "rule_engine": True,
                "workflow_automation": True,
                "audit_trail": True,
                "role_management": True,
                "communication_protocols": True
            }
        )
        db.add(platform_info)
        db.commit()
        
        # 用戶角色切換記錄
        role_switches = [
            UserRoleSwitch(
                user_id=1,
                from_role="admin",
                to_role="operator",
                switch_reason="測試操作員權限",
                switch_type="manual",
                duration=60,  # 1小時
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=1),
                is_active=True,
                created_by=1
            ),
            UserRoleSwitch(
                user_id=2,
                from_role="operator",
                to_role="viewer",
                switch_reason="臨時檢視權限",
                switch_type="manual",
                duration=30,  # 30分鐘
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
                is_active=True,
                created_by=1
            ),
            UserRoleSwitch(
                user_id=3,
                from_role="viewer",
                to_role="maintenance",
                switch_reason="設備維護需求",
                switch_type="manual",
                duration=120,  # 2小時
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=2),
                is_active=True,
                created_by=1
            )
        ]
        
        for role_switch in role_switches:
            db.add(role_switch)
        db.commit()
        
        # 用戶會話
        user_sessions = [
            UserSession(
                user_id=1,
                session_token="session_admin_001",
                current_role="admin",
                original_role="admin",
                ip_address="192.168.1.100",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                login_time=datetime.datetime.utcnow(),
                last_activity=datetime.datetime.utcnow(),
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                is_active=True
            ),
            UserSession(
                user_id=2,
                session_token="session_operator_001",
                current_role="operator",
                original_role="operator",
                ip_address="192.168.1.101",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                login_time=datetime.datetime.utcnow(),
                last_activity=datetime.datetime.utcnow(),
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                is_active=True
            ),
            UserSession(
                user_id=3,
                session_token="session_viewer_001",
                current_role="viewer",
                original_role="viewer",
                ip_address="192.168.1.102",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                login_time=datetime.datetime.utcnow(),
                last_activity=datetime.datetime.utcnow(),
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                is_active=True
            )
        ]
        
        for session in user_sessions:
            db.add(session)
        db.commit()
        
        print("✅ 平台設定和用戶角色切換測試資料生成完成！")
        
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
    except Exception as e:
        print(f"❌ 生成測試數據時發生錯誤: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data() 

## 總結

我已經成功為你的 IIoT 平台新增了完整的串流影

        # 生成串流影像辨識測試資料
        print("生成串流影像辨識測試資料...")
        from app.models import (
            VideoStreamDevice, VideoRecognitionModel, VideoRecognitionTask,
            VideoRecognitionResult, VideoRecognitionAlert, VideoProcessingConfig,
            VideoStreamStatus, VideoRecordingConfig, VideoAnalyticsStats
        )
        
        # 串流影像設備
        video_devices = [
            VideoStreamDevice(
                name="生產線監控攝影機",
                device_type="ip_camera",
                stream_url="rtsp://192.168.1.100:554/stream1",
                stream_type="rtsp",
                resolution="1920x1080",
                frame_rate=30,
                bitrate=4000,
                location="生產線A",
                description="監控生產線運作狀況",
                is_active=True
            ),
            VideoStreamDevice(
                name="品質檢測攝影機",
                device_type="ip_camera",
                stream_url="rtsp://192.168.1.101:554/stream1",
                stream_type="rtsp",
                resolution="1920x1080",
                frame_rate=25,
                bitrate=3000,
                location="檢測站B",
                description="檢測產品品質缺陷",
                is_active=True
            ),
            VideoStreamDevice(
                name="安全監控攝影機",
                device_type="ip_camera",
                stream_url="rtsp://192.168.1.102:554/stream1",
                stream_type="rtsp",
                resolution="1280x720",
                frame_rate=20,
                bitrate=2000,
                location="安全區域",
                description="監控安全區域人員進出",
                is_active=True
            )
        ]
        
        for device in video_devices:
            db.add(device)
        db.commit()
        
        # 影像辨識模型
        video_models = [
            VideoRecognitionModel(
                name="YOLO 物件偵測模型",
                model_type="object_detection",
                framework="yolo",
                model_path="/models/yolo_v5.pt",
                model_config={"confidence": 0.7, "iou": 0.5},
                classes=["person", "car", "truck", "bicycle", "motorcycle"],
                confidence_threshold=0.7,
                is_active=True,
                is_production=True,
                created_by=1
            ),
            VideoRecognitionModel(
                name="品質缺陷檢測模型",
                model_type="quality_inspection",
                framework="tensorflow",
                model_path="/models/quality_inspection.h5",
                model_config={"input_size": [224, 224], "batch_size": 32},
                classes=["scratch", "crack", "discoloration", "misalignment", "contamination"],
                confidence_threshold=0.8,
                is_active=True,
                is_production=True,
                created_by=1
            ),
            VideoRecognitionModel(
                name="人臉辨識模型",
                model_type="face_recognition",
                framework="opencv",
                model_path="/models/face_recognition.xml",
                model_config={"scale_factor": 1.1, "min_neighbors": 5},
                classes=["authorized_person", "unauthorized_person"],
                confidence_threshold=0.9,
                is_active=True,
                is_production=False,
                created_by=1
            )
        ]
        
        for model in video_models:
            db.add(model)
        db.commit()
        
        # 影像辨識任務
        video_tasks = [
            VideoRecognitionTask(
                name="生產線監控任務",
                device_id=1,
                model_id=1,
                task_type="real_time",
                status="running",
                config={"fps": 30, "roi": [100, 100, 800, 600], "alert_enabled": True},
                is_active=True,
                created_by=1
            ),
            VideoRecognitionTask(
                name="品質檢測任務",
                device_id=2,
                model_id=2,
                task_type="real_time",
                status="running",
                config={"fps": 25, "roi": [200, 200, 700, 500], "alert_enabled": True},
                is_active=True,
                created_by=1
            ),
            VideoRecognitionTask(
                name="安全監控任務",
                device_id=3,
                model_id=3,
                task_type="real_time",
                status="stopped",
                config={"fps": 20, "roi": [0, 0, 1280, 720], "alert_enabled": True},
                is_active=True,
                created_by=1
            )
        ]
        
        for task in video_tasks:
            db.add(task)
        db.commit()
        
        # 影像辨識結果（模擬數據）
        import random
        import datetime
        
        for task in video_tasks:
            for i in range(10):  # 每個任務生成10個結果
                result = VideoRecognitionResult(
                    task_id=task.id,
                    frame_timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=i*5),
                    frame_number=random.randint(1, 1000),
                    detection_results={
                        "objects": [
                            {"class": "person", "confidence": random.uniform(0.7, 0.95), "bbox": [100, 100, 200, 300]},
                            {"class": "car", "confidence": random.uniform(0.6, 0.9), "bbox": [300, 200, 500, 400]}
                        ]
                    },
                    confidence_scores={"person": random.uniform(0.7, 0.95), "car": random.uniform(0.6, 0.9)},
                    bounding_boxes=[[100, 100, 200, 300], [300, 200, 500, 400]],
                    class_labels=["person", "car"],
                    processing_time=random.uniform(50, 200),
                    is_alert=random.choice([True, False])
                )
                db.add(result)
        db.commit()
        
        # 影像辨識警報
        video_alerts = [
            VideoRecognitionAlert(
                result_id=1,
                alert_type="quality_defect",
                alert_level="high",
                alert_message="檢測到產品缺陷：刮痕",
                detected_objects=["scratch"],
                location_info={"x": 150, "y": 200, "width": 100, "height": 50},
                image_snapshot="/snapshots/defect_001.jpg"
            ),
            VideoRecognitionAlert(
                result_id=2,
                alert_type="safety_violation",
                alert_level="critical",
                alert_message="檢測到未授權人員進入",
                detected_objects=["unauthorized_person"],
                location_info={"x": 300, "y": 250, "width": 80, "height": 120},
                image_snapshot="/snapshots/security_001.jpg"
            ),
            VideoRecognitionAlert(
                result_id=3,
                alert_type="quality_defect",
                alert_level="medium",
                alert_message="檢測到產品變色",
                detected_objects=["discoloration"],
                location_info={"x": 400, "y": 300, "width": 120, "height": 80},
                image_snapshot="/snapshots/defect_002.jpg"
            )
        ]
        
        for alert in video_alerts:
            db.add(alert)
        db.commit()
        
        # 影像處理配置
        video_processing_configs = [
            VideoProcessingConfig(
                task_id=1,
                preprocessing_steps=[
                    {"type": "resize", "params": {"width": 640, "height": 480}},
                    {"type": "normalize", "params": {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}}
                ],
                postprocessing_steps=[
                    {"type": "nms", "params": {"iou_threshold": 0.5}},
                    {"type": "confidence_filter", "params": {"threshold": 0.7}}
                ],
                filter_settings={"blur": False, "sharpen": True},
                enhancement_settings={"brightness": 1.1, "contrast": 1.2},
                roi_settings={"enabled": True, "coordinates": [100, 100, 800, 600]},
                is_active=True
            ),
            VideoProcessingConfig(
                task_id=2,
                preprocessing_steps=[
                    {"type": "resize", "params": {"width": 224, "height": 224}},
                    {"type": "normalize", "params": {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}}
                ],
                postprocessing_steps=[
                    {"type": "confidence_filter", "params": {"threshold": 0.8}}
                ],
                filter_settings={"blur": False, "sharpen": False},
                enhancement_settings={"brightness": 1.0, "contrast": 1.0},
                roi_settings={"enabled": True, "coordinates": [200, 200, 700, 500]},
                is_active=True
            )
        ]
        
        for config in video_processing_configs:
            db.add(config)
        db.commit()
        
        # 影像串流狀態
        video_stream_status = [
            VideoStreamStatus(
                device_id=1,
                connection_status="connected",
                stream_quality="excellent",
                frame_rate_current=30.0,
                bitrate_current=4000,
                resolution_current="1920x1080",
                latency=50.0,
                is_recording=False
            ),
            VideoStreamStatus(
                device_id=2,
                connection_status="connected",
                stream_quality="good",
                frame_rate_current=25.0,
                bitrate_current=3000,
                resolution_current="1920x1080",
                latency=75.0,
                is_recording=True
            ),
            VideoStreamStatus(
                device_id=3,
                connection_status="disconnected",
                stream_quality="poor",
                frame_rate_current=0.0,
                bitrate_current=0,
                resolution_current="1280x720",
                latency=0.0,
                error_message="Connection timeout",
                is_recording=False
            )
        ]
        
        for status in video_stream_status:
            db.add(status)
        db.commit()
        
        # 影像錄製配置
        video_recording_configs = [
            VideoRecordingConfig(
                device_id=1,
                recording_enabled=False,
                recording_trigger="manual",
                recording_format="mp4",
                recording_quality="high",
                storage_path="/recordings/device_1/",
                retention_days=30,
                max_file_size=1024,
                is_active=True
            ),
            VideoRecordingConfig(
                device_id=2,
                recording_enabled=True,
                recording_trigger="motion",
                recording_format="mp4",
                recording_quality="medium",
                storage_path="/recordings/device_2/",
                retention_days=15,
                max_file_size=512,
                is_active=True
            ),
            VideoRecordingConfig(
                device_id=3,
                recording_enabled=True,
                recording_trigger="alert",
                recording_format="avi",
                recording_quality="high",
                storage_path="/recordings/device_3/",
                retention_days=60,
                max_file_size=2048,
                is_active=True
            )
        ]
        
        for config in video_recording_configs:
            db.add(config)
        db.commit()
        
        # 影像分析統計
        video_analytics_stats = [
            VideoAnalyticsStats(
                task_id=1,
                date=datetime.datetime.utcnow().date(),
                total_frames_processed=86400,  # 24小時 * 30fps
                total_detections=1200,
                average_processing_time=150.0,
                detection_rate=0.85,
                false_positive_rate=0.05,
                false_negative_rate=0.10,
                alert_count=15,
                class_distribution={"person": 800, "car": 400},
                performance_metrics={"fps": 30, "memory_usage": 512, "cpu_usage": 45}
            ),
            VideoAnalyticsStats(
                task_id=2,
                date=datetime.datetime.utcnow().date(),
                total_frames_processed=64800,  # 24小時 * 25fps
                total_detections=800,
                average_processing_time=120.0,
                detection_rate=0.90,
                false_positive_rate=0.03,
                false_negative_rate=0.07,
                alert_count=8,
                class_distribution={"scratch": 300, "crack": 200, "discoloration": 300},
                performance_metrics={"fps": 25, "memory_usage": 384, "cpu_usage": 35}
            )
        ]
        
        for stats in video_analytics_stats:
            db.add(stats)
        db.commit()
        
        print("✅ 串流影像辨識測試數據生成完成！")
        print(f"🖥️ 已建立 {len(video_devices)} 個影像設備")
        print(f"🤖 已建立 {len(video_models)} 個辨識模型")
        print(f"📋 已建立 {len(video_tasks)} 個辨識任務")
        print(f"📊 已生成 {len(video_alerts)} 個影像警報")
        print(f"⚙️  已建立 {len(video_processing_configs)} 個處理配置")
        print(f"📈 已建立 {len(video_analytics_stats)} 個分析統計") 