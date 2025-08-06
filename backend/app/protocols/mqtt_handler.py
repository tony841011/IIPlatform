import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class MQTTHandler:
    def __init__(self, broker_url="localhost", broker_port=1883):
        self.broker_url = broker_url
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
    def on_connect(self, client, userdata, flags, rc):
        logger.info(f"MQTT 連線成功，返回碼: {rc}")
        client.subscribe("iot/+/data")
        client.subscribe("iot/+/status")
        client.subscribe("iot/+/command")
        
    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logger.info(f"收到 MQTT 訊息: {topic} - {payload}")
            
            # 處理設備數據
            if "data" in topic:
                self.handle_device_data(topic, payload)
            elif "status" in topic:
                self.handle_device_status(topic, payload)
            elif "command" in topic:
                self.handle_device_command(topic, payload)
                
        except Exception as e:
            logger.error(f"處理 MQTT 訊息失敗: {str(e)}")
    
    def on_disconnect(self, client, userdata, rc):
        logger.warning(f"MQTT 連線斷開，返回碼: {rc}")
    
    def handle_device_data(self, topic, payload):
        """處理設備數據"""
        device_id = topic.split('/')[1]
        
        # 使用數據處理服務處理數據
        try:
            import asyncio
            from app.services.data_processing_service import data_processing_service
            
            # 創建事件循環來執行異步處理
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # 處理數據
                result = loop.run_until_complete(
                    data_processing_service.process_mqtt_data(topic, payload)
                )
                
                if result.success:
                    # 保存處理結果
                    data_processing_service.save_processing_result(result)
                    logger.info(f"MQTT 數據處理成功: {topic}")
                else:
                    logger.warning(f"MQTT 數據處理失敗: {result.error_message}")
                
            finally:
                loop.close()
                
        except Exception as e:
            logger.error(f"數據處理服務調用失敗: {str(e)}")
        
        # 同時保存原始數據到 InfluxDB
        from app.database import influx_client
        from app.database import INFLUXDB_BUCKET, INFLUXDB_ORG
        
        point = {
            "measurement": "device_sensor_data",
            "tags": {
                "device_id": device_id
            },
            "fields": payload,
            "time": datetime.utcnow()
        }
        
        write_api = influx_client.write_api()
        write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
    
    def handle_device_status(self, topic, payload):
        """處理設備狀態"""
        device_id = topic.split('/')[1]
        # 更新 PostgreSQL 中的設備狀態
        from app.database import SessionLocal
        from app.models import Device
        
        db = SessionLocal()
        try:
            device = db.query(Device).filter(Device.id == int(device_id)).first()
            if device:
                device.status = payload.get('status', 'unknown')
                device.last_heartbeat = datetime.utcnow()
                db.commit()
        except Exception as e:
            logger.error(f"更新設備狀態失敗: {str(e)}")
        finally:
            db.close()
    
    def handle_device_command(self, topic, payload):
        """處理設備命令"""
        device_id = topic.split('/')[1]
        command = payload.get('command')
        logger.info(f"設備 {device_id} 執行命令: {command}")
    
    def connect(self):
        """連接到 MQTT Broker"""
        try:
            self.client.connect(self.broker_url, self.broker_port, 60)
            self.client.loop_start()
            logger.info("MQTT 客戶端啟動成功")
        except Exception as e:
            logger.error(f"MQTT 連線失敗: {str(e)}")
    
    def disconnect(self):
        """斷開 MQTT 連線"""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("MQTT 客戶端已斷開")
    
    def publish_command(self, device_id, command):
        """發布設備命令"""
        topic = f"iot/{device_id}/command"
        payload = json.dumps(command)
        self.client.publish(topic, payload)
        logger.info(f"發布命令到設備 {device_id}: {command}") 