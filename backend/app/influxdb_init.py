#!/usr/bin/env python3
"""
InfluxDB 測量點初始化腳本
"""

import os
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime, timedelta
import random

def init_influxdb_measurements():
    """初始化 InfluxDB 測量點"""
    
    # 連接到 InfluxDB
    url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
    token = os.getenv('INFLUXDB_TOKEN', '')
    org = os.getenv('INFLUXDB_ORG', 'IIPlatform')
    bucket = os.getenv('INFLUXDB_BUCKET', 'iiplatform')
    
    client = InfluxDBClient(url=url, token=token, org=org)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    
    print("🔧 開始初始化 InfluxDB 測量點...")
    
    # 創建示例時序數據
    create_sample_time_series_data(write_api, bucket)
    
    client.close()
    print("🎉 InfluxDB 測量點初始化完成！")

def create_sample_time_series_data(write_api, bucket):
    """創建示例時序數據"""
    
    # 1. 設備感測器數據
    print("📊 創建設備感測器數據...")
    for i in range(100):
        timestamp = datetime.utcnow() - timedelta(minutes=i)
        
        # 溫度數據
        temperature_point = Point("device_sensor_data")\
            .tag("device_id", "1")\
            .tag("device_name", "temperature_sensor_01")\
            .tag("sensor_type", "temperature")\
            .field("value", 20 + random.uniform(-5, 5))\
            .field("unit", "celsius")\
            .time(timestamp)
        
        # 濕度數據
        humidity_point = Point("device_sensor_data")\
            .tag("device_id", "1")\
            .tag("device_name", "humidity_sensor_01")\
            .tag("sensor_type", "humidity")\
            .field("value", 50 + random.uniform(-10, 10))\
            .field("unit", "percent")\
            .time(timestamp)
        
        # 壓力數據
        pressure_point = Point("device_sensor_data")\
            .tag("device_id", "1")\
            .tag("device_name", "pressure_sensor_01")\
            .tag("sensor_type", "pressure")\
            .field("value", 1013 + random.uniform(-20, 20))\
            .field("unit", "hpa")\
            .time(timestamp)
        
        write_api.write(bucket=bucket, record=[temperature_point, humidity_point, pressure_point])
    
    # 2. 設備狀態數據
    print("📊 創建設備狀態數據...")
    for i in range(50):
        timestamp = datetime.utcnow() - timedelta(minutes=i*2)
        
        status_point = Point("device_status")\
            .tag("device_id", "1")\
            .tag("device_name", "sensor_device_01")\
            .field("status", "online")\
            .field("battery_level", 80 + random.uniform(-10, 10))\
            .field("temperature", 35 + random.uniform(-5, 5))\
            .field("signal_strength", -50 + random.uniform(-10, 10))\
            .time(timestamp)
        
        write_api.write(bucket=bucket, record=status_point)
    
    # 3. 系統指標數據
    print("📊 創建系統指標數據...")
    for i in range(100):
        timestamp = datetime.utcnow() - timedelta(minutes=i)
        
        # CPU 使用率
        cpu_point = Point("system_metrics")\
            .tag("metric_type", "cpu")\
            .tag("host", "server-01")\
            .field("usage_percent", 30 + random.uniform(0, 40))\
            .field("temperature", 45 + random.uniform(-5, 10))\
            .time(timestamp)
        
        # 記憶體使用率
        memory_point = Point("system_metrics")\
            .tag("metric_type", "memory")\
            .tag("host", "server-01")\
            .field("usage_percent", 60 + random.uniform(0, 30))\
            .field("total_gb", 16)\
            .field("used_gb", 9.6 + random.uniform(-1, 1))\
            .time(timestamp)
        
        # 磁碟使用率
        disk_point = Point("system_metrics")\
            .tag("metric_type", "disk")\
            .tag("host", "server-01")\
            .field("usage_percent", 45 + random.uniform(0, 20))\
            .field("total_gb", 1000)\
            .field("used_gb", 450 + random.uniform(-10, 10))\
            .time(timestamp)
        
        write_api.write(bucket=bucket, record=[cpu_point, memory_point, disk_point])
    
    # 4. AI 分析結果數據
    print("📊 創建 AI 分析結果數據...")
    for i in range(30):
        timestamp = datetime.utcnow() - timedelta(minutes=i*3)
        
        # 異常檢測結果
        anomaly_point = Point("ai_analysis_results")\
            .tag("analysis_type", "anomaly_detection")\
            .tag("model_name", "anomaly_detection_v1")\
            .tag("device_id", "1")\
            .field("anomaly_score", random.uniform(0, 1))\
            .field("is_anomaly", random.choice([True, False]))\
            .field("confidence", random.uniform(0.7, 1.0))\
            .time(timestamp)
        
        # 預測結果
        prediction_point = Point("ai_analysis_results")\
            .tag("analysis_type", "prediction")\
            .tag("model_name", "temperature_prediction_v1")\
            .tag("device_id", "1")\
            .field("predicted_value", 22 + random.uniform(-3, 3))\
            .field("confidence", random.uniform(0.8, 0.95))\
            .field("horizon_hours", 24)\
            .time(timestamp)
        
        write_api.write(bucket=bucket, record=[anomaly_point, prediction_point])
    
    # 5. 告警事件數據
    print("📊 創建告警事件數據...")
    for i in range(10):
        timestamp = datetime.utcnow() - timedelta(hours=i*2)
        
        alert_point = Point("alert_events")\
            .tag("alert_type", random.choice(["temperature_high", "humidity_low", "pressure_anomaly"]))\
            .tag("device_id", "1")\
            .tag("severity", random.choice(["low", "medium", "high"]))\
            .field("alert_id", f"alert_{i+1}")\
            .field("value", 25 + random.uniform(-5, 10))\
            .field("threshold", 30)\
            .field("message", "設備溫度異常")\
            .time(timestamp)
        
        write_api.write(bucket=bucket, record=alert_point)
    
    print("✅ 示例時序數據創建完成")

if __name__ == "__main__":
    init_influxdb_measurements()