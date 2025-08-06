#!/usr/bin/env python3
"""
數據處理功能測試腳本
用於驗證數據處理服務的各項功能
"""

import asyncio
import json
import requests
from datetime import datetime

# 測試配置
BASE_URL = "http://localhost:8000"

def test_data_processing_apis():
    """測試數據處理相關的 API 端點"""
    
    print("=== 數據處理功能測試 ===\n")
    
    # 1. 測試獲取可用處理器
    print("1. 測試獲取可用處理器...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/available-processors")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 成功獲取 {data['count']} 個處理器")
            print(f"  處理器列表: {data['processors'][:5]}...")  # 只顯示前5個
        else:
            print(f"✗ 獲取處理器失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 2. 測試獲取處理器配置
    print("2. 測試獲取處理器配置...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/processor-configs")
        if response.status_code == 200:
            data = response.json()
            configs = data['configs']
            print(f"✓ 成功獲取 {len(configs)} 個處理器配置")
            # 顯示第一個處理器的配置
            first_processor = list(configs.keys())[0]
            print(f"  範例配置 ({first_processor}): {configs[first_processor]['description']}")
        else:
            print(f"✗ 獲取配置失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 3. 測試獲取數據源類型
    print("3. 測試獲取數據源類型...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/data-source-types")
        if response.status_code == 200:
            data = response.json()
            types = data['types']
            print(f"✓ 成功獲取 {len(types)} 種數據源類型")
            for source_type, info in types.items():
                print(f"  - {source_type}: {info['name']} ({info['description']})")
        else:
            print(f"✗ 獲取數據源類型失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 4. 測試獲取處理器類別
    print("4. 測試獲取處理器類別...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/processor-categories")
        if response.status_code == 200:
            data = response.json()
            categories = data['categories']
            print(f"✓ 成功獲取 {len(categories)} 個處理器類別")
            for category, info in categories.items():
                print(f"  - {category}: {info['name']} ({info['description']})")
        else:
            print(f"✗ 獲取處理器類別失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 5. 測試獲取預設處理管道
    print("5. 測試獲取預設處理管道...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/default-pipelines")
        if response.status_code == 200:
            data = response.json()
            pipelines = data['pipelines']
            print(f"✓ 成功獲取 {len(pipelines)} 個預設處理管道")
            for pipeline_name, steps in pipelines.items():
                print(f"  - {pipeline_name}: {steps}")
        else:
            print(f"✗ 獲取預設管道失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 6. 測試獲取當前處理管道
    print("6. 測試獲取當前處理管道...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-processing/pipeline")
        if response.status_code == 200:
            data = response.json()
            pipeline = data['pipeline']
            print(f"✓ 當前處理管道: {pipeline}")
        else:
            print(f"✗ 獲取當前管道失敗: {response.status_code}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()

def test_data_processing():
    """測試數據處理功能"""
    
    print("=== 數據處理功能測試 ===\n")
    
    # 1. 測試 MQTT 數據處理
    print("1. 測試 MQTT 數據處理...")
    mqtt_data = {
        "topic": "iot/device1/data",
        "payload": {
            "temperature": 25.5,
            "humidity": 60,
            "timestamp": datetime.now().isoformat()
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/data-processing/process-mqtt",
            json=mqtt_data
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ MQTT 數據處理成功")
            print(f"  處理時間: {result.get('processing_time', 'N/A')}秒")
            print(f"  處理結果: {result.get('success', False)}")
            if result.get('data'):
                print(f"  數據內容: {json.dumps(result['data'], indent=2, ensure_ascii=False)}")
        else:
            print(f"✗ MQTT 數據處理失敗: {response.status_code}")
            print(f"  錯誤信息: {response.text}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 2. 測試 Modbus 數據處理
    print("2. 測試 Modbus 數據處理...")
    modbus_data = {
        "device_id": "modbus_device_1",
        "registers": [100, 200, 300, 250, 180]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/data-processing/process-modbus",
            json=modbus_data
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Modbus 數據處理成功")
            print(f"  處理時間: {result.get('processing_time', 'N/A')}秒")
            print(f"  處理結果: {result.get('success', False)}")
            if result.get('data'):
                print(f"  數據內容: {json.dumps(result['data'], indent=2, ensure_ascii=False)}")
        else:
            print(f"✗ Modbus 數據處理失敗: {response.status_code}")
            print(f"  錯誤信息: {response.text}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 3. 測試資料庫數據處理
    print("3. 測試資料庫數據處理...")
    db_data = {
        "source_id": "postgresql_source",
        "query_result": {
            "rows": [
                {"id": 1, "value": 100, "status": "online"},
                {"id": 2, "value": 200, "status": "online"},
                {"id": 3, "value": 150, "status": "offline"}
            ]
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/data-processing/process-database",
            json=db_data
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ 資料庫數據處理成功")
            print(f"  處理時間: {result.get('processing_time', 'N/A')}秒")
            print(f"  處理結果: {result.get('success', False)}")
            if result.get('data'):
                print(f"  數據內容: {json.dumps(result['data'], indent=2, ensure_ascii=False)}")
        else:
            print(f"✗ 資料庫數據處理失敗: {response.status_code}")
            print(f"  錯誤信息: {response.text}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()

def test_configuration():
    """測試配置管理功能"""
    
    print("=== 配置管理功能測試 ===\n")
    
    # 1. 測試添加數據源
    print("1. 測試添加數據源...")
    source_config = {
        "source_id": "test_mqtt_source",
        "type": "mqtt",
        "description": "測試 MQTT 數據源",
        "config": {
            "min_temperature": -50,
            "max_temperature": 150,
            "unit_conversions": {
                "temperature": {
                    "from": "celsius",
                    "to": "fahrenheit"
                }
            },
            "range_validations": {
                "temperature": {
                    "min": -50,
                    "max": 150
                }
            },
            "required_fields": ["temperature", "timestamp"]
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/data-processing/add-data-source",
            json=source_config
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ 數據源添加成功: {result.get('message', '')}")
        else:
            print(f"✗ 數據源添加失敗: {response.status_code}")
            print(f"  錯誤信息: {response.text}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()
    
    # 2. 測試設置處理管道
    print("2. 測試設置處理管道...")
    pipeline = [
        "temperature_filter",
        "range_validation",
        "unit_conversion",
        "statistical_aggregate"
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/data-processing/set-pipeline",
            json=pipeline
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ 處理管道設置成功: {result.get('message', '')}")
            print(f"  管道內容: {result.get('pipeline', [])}")
        else:
            print(f"✗ 處理管道設置失敗: {response.status_code}")
            print(f"  錯誤信息: {response.text}")
    except Exception as e:
        print(f"✗ 請求失敗: {str(e)}")
    
    print()

def main():
    """主函數"""
    print("開始數據處理功能測試...\n")
    
    # 檢查服務是否運行
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("✗ 後端服務未運行，請先啟動服務")
            return
        print("✓ 後端服務運行正常\n")
    except Exception as e:
        print(f"✗ 無法連接到後端服務: {str(e)}")
        print("請確保後端服務正在運行在 http://localhost:8000")
        return
    
    # 執行測試
    test_data_processing_apis()
    test_data_processing()
    test_configuration()
    
    print("=== 測試完成 ===")

if __name__ == "__main__":
    main() 