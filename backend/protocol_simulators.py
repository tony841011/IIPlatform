import requests
import json
import time
import random
import datetime
from typing import Dict, Any

class ProtocolSimulator:
    """通訊協定模擬器基類"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        
    def send_data(self, device_id: int, value: float, timestamp: datetime.datetime = None):
        """發送數據到後端"""
        if timestamp is None:
            timestamp = datetime.datetime.utcnow()
            
        data = {
            "device_id": device_id,
            "value": value,
            "timestamp": timestamp.isoformat()
        }
        
        try:
            response = requests.post(f"{self.base_url}/data/", json=data)
            return response.json()
        except Exception as e:
            print(f"發送數據失敗: {e}")
            return None

class MQTTSimulator(ProtocolSimulator):
    """MQTT 協定模擬器"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        super().__init__(base_url)
        self.protocol_type = "mqtt"
        
    def simulate_device(self, device_id: int, topic: str, interval: int = 5):
        """模擬 MQTT 設備數據發送"""
        print(f"🔌 啟動 MQTT 設備模擬器 - 設備ID: {device_id}, Topic: {topic}")
        
        while True:
            # 模擬溫度數據 (20-35度)
            value = random.uniform(20, 35)
            
            # 偶爾生成異常數據
            if random.random() < 0.1:  # 10%機率
                value = random.uniform(40, 50)
                print(f"⚠️  MQTT 設備 {device_id} 檢測到異常溫度: {value:.2f}°C")
            
            # 發送數據
            result = self.send_data(device_id, value)
            if result:
                print(f"📡 MQTT 設備 {device_id} 發送數據: {value:.2f}°C")
            
            time.sleep(interval)

class ModbusTCPSimulator(ProtocolSimulator):
    """Modbus TCP 協定模擬器"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        super().__init__(base_url)
        self.protocol_type = "modbus_tcp"
        
    def simulate_device(self, device_id: int, register: str = "40001", interval: int = 5):
        """模擬 Modbus TCP 設備數據發送"""
        print(f"🔌 啟動 Modbus TCP 設備模擬器 - 設備ID: {device_id}, Register: {register}")
        
        while True:
            # 模擬壓力數據 (1.5-3.0 bar)
            value = random.uniform(1.5, 3.0)
            
            # 偶爾生成異常數據
            if random.random() < 0.1:  # 10%機率
                value = random.uniform(4.0, 5.0)
                print(f"⚠️  Modbus TCP 設備 {device_id} 檢測到異常壓力: {value:.2f} bar")
            
            # 發送數據
            result = self.send_data(device_id, value)
            if result:
                print(f"📡 Modbus TCP 設備 {device_id} 發送數據: {value:.2f} bar")
            
            time.sleep(interval)

class OPCUASimulator(ProtocolSimulator):
    """OPC UA 協定模擬器"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        super().__init__(base_url)
        self.protocol_type = "opc_ua"
        
    def simulate_device(self, device_id: int, node_id: str, interval: int = 5):
        """模擬 OPC UA 設備數據發送"""
        print(f"🔌 啟動 OPC UA 設備模擬器 - 設備ID: {device_id}, Node ID: {node_id}")
        
        while True:
            # 模擬品質檢測數據 (95-99%)
            value = random.uniform(95, 99)
            
            # 偶爾生成異常數據
            if random.random() < 0.1:  # 10%機率
                value = random.uniform(80, 85)
                print(f"⚠️  OPC UA 設備 {device_id} 檢測到異常品質: {value:.2f}%")
            
            # 發送數據
            result = self.send_data(device_id, value)
            if result:
                print(f"📡 OPC UA 設備 {device_id} 發送數據: {value:.2f}%")
            
            time.sleep(interval)

class RESTfulSimulator(ProtocolSimulator):
    """RESTful API 協定模擬器"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        super().__init__(base_url)
        self.protocol_type = "restful"
        
    def simulate_device(self, device_id: int, endpoint: str = "/api/data", interval: int = 5):
        """模擬 RESTful API 設備數據發送"""
        print(f"🔌 啟動 RESTful API 設備模擬器 - 設備ID: {device_id}, Endpoint: {endpoint}")
        
        while True:
            # 模擬流量數據 (100-200 L/min)
            value = random.uniform(100, 200)
            
            # 偶爾生成異常數據
            if random.random() < 0.1:  # 10%機率
                value = random.uniform(250, 300)
                print(f"⚠️  RESTful API 設備 {device_id} 檢測到異常流量: {value:.2f} L/min")
            
            # 發送數據
            result = self.send_data(device_id, value)
            if result:
                print(f"📡 RESTful API 設備 {device_id} 發送數據: {value:.2f} L/min")
            
            time.sleep(interval)

def main():
    """主函數 - 啟動所有協定模擬器"""
    print("🚀 啟動通訊協定模擬器...")
    print("=" * 50)
    
    # 建立模擬器實例
    mqtt_sim = MQTTSimulator()
    modbus_sim = ModbusTCPSimulator()
    opc_ua_sim = OPCUASimulator()
    restful_sim = RESTfulSimulator()
    
    try:
        # 啟動不同協定的設備模擬
        import threading
        
        # MQTT 設備 (溫度感測器)
        mqtt_thread1 = threading.Thread(target=mqtt_sim.simulate_device, args=(1, "sensor/temp/01"))
        mqtt_thread2 = threading.Thread(target=mqtt_sim.simulate_device, args=(4, "sensor/temp/02"))
        
        # Modbus TCP 設備 (包裝機)
        modbus_thread1 = threading.Thread(target=modbus_sim.simulate_device, args=(6, "40001"))
        modbus_thread2 = threading.Thread(target=modbus_sim.simulate_device, args=(7, "40001"))
        
        # OPC UA 設備 (品質檢測儀)
        opc_ua_thread1 = threading.Thread(target=opc_ua_sim.simulate_device, args=(9, "ns=2;s=QualitySensor1"))
        opc_ua_thread2 = threading.Thread(target=opc_ua_sim.simulate_device, args=(10, "ns=2;s=QualitySensor2"))
        
        # RESTful API 設備 (流量計)
        restful_thread1 = threading.Thread(target=restful_sim.simulate_device, args=(3, "/api/flow"))
        
        # 啟動所有線程
        mqtt_thread1.start()
        mqtt_thread2.start()
        modbus_thread1.start()
        modbus_thread2.start()
        opc_ua_thread1.start()
        opc_ua_thread2.start()
        restful_thread1.start()
        
        print("✅ 所有通訊協定模擬器已啟動")
        print("📊 模擬設備:")
        print("   - MQTT: 溫度感測器 (設備 1, 4)")
        print("   - Modbus TCP: 包裝機 (設備 6, 7)")
        print("   - OPC UA: 品質檢測儀 (設備 9, 10)")
        print("   - RESTful API: 流量計 (設備 3)")
        print("\n按 Ctrl+C 停止模擬器")
        
        # 保持主線程運行
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 停止通訊協定模擬器...")
        print("✅ 模擬器已停止")

if __name__ == "__main__":
    main() 