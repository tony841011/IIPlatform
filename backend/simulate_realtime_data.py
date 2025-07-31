import requests
import time
import random
import datetime
import json

# 後端 API 地址
BASE_URL = "http://localhost:8000"

def simulate_device_data():
    """模擬設備數據上傳"""
    
    # 設備配置
    devices = [
        {"id": 1, "name": "溫度感測器-01", "type": "溫度", "base_value": 25, "range": 5},
        {"id": 2, "name": "壓力感測器-01", "type": "壓力", "base_value": 2.0, "range": 0.5},
        {"id": 3, "name": "流量計-01", "type": "流量", "base_value": 150, "range": 30},
        {"id": 4, "name": "溫度感測器-02", "type": "溫度", "base_value": 28, "range": 4},
        {"id": 5, "name": "振動感測器-01", "type": "振動", "base_value": 0.3, "range": 0.1},
        {"id": 6, "name": "包裝機-01", "type": "效率", "base_value": 88, "range": 8},
        {"id": 7, "name": "包裝機-02", "type": "效率", "base_value": 92, "range": 6},
        {"id": 8, "name": "倉儲溫控-01", "type": "溫度", "base_value": 22, "range": 3},
        {"id": 9, "name": "品質檢測儀-01", "type": "品質", "base_value": 97, "range": 2},
        {"id": 10, "name": "品質檢測儀-02", "type": "品質", "base_value": 96, "range": 3}
    ]
    
    print("🚀 開始模擬即時數據上傳...")
    print("📊 將每5秒上傳一次設備數據")
    print("⏹️  按 Ctrl+C 停止模擬")
    print("-" * 50)
    
    try:
        while True:
            for device in devices:
                # 生成隨機數據
                value = device["base_value"] + random.uniform(-device["range"], device["range"])
                
                # 偶爾生成異常數據 (10% 機率)
                if random.random() < 0.1:
                    value *= random.uniform(1.5, 2.0)
                
                # 準備數據
                data = {
                    "device_id": device["id"],
                    "value": round(value, 2),
                    "timestamp": datetime.datetime.now().isoformat()
                }
                
                try:
                    # 發送到後端
                    response = requests.post(f"{BASE_URL}/data/", json=data)
                    
                    if response.status_code == 200:
                        status = "✅" if value <= device["base_value"] + device["range"] else "⚠️"
                        print(f"{status} {device['name']}: {value:.2f}")
                    else:
                        print(f"❌ {device['name']}: 上傳失敗 ({response.status_code})")
                        
                except requests.exceptions.RequestException as e:
                    print(f"❌ {device['name']}: 連線錯誤 - {e}")
            
            print("-" * 30)
            time.sleep(5)  # 每5秒上傳一次
            
    except KeyboardInterrupt:
        print("\n🛑 模擬已停止")

def test_api_endpoints():
    """測試 API 端點"""
    print("🧪 測試 API 端點...")
    
    endpoints = [
        ("GET", "/", "根目錄"),
        ("GET", "/devices/", "設備列表"),
        ("GET", "/alerts/", "告警列表"),
        ("GET", "/groups/", "群組列表")
    ]
    
    for method, endpoint, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    count = len(data) if isinstance(data, list) else "OK"
                    print(f"✅ {description}: {count}")
                else:
                    print(f"❌ {description}: {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: 連線錯誤 - {e}")

if __name__ == "__main__":
    print("🏭 IIoT 平台數據模擬器")
    print("=" * 50)
    
    # 先測試 API
    test_api_endpoints()
    print()
    
    # 開始模擬數據
    simulate_device_data() 