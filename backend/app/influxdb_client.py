from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class InfluxDBManager:
    def __init__(self):
        self.url = os.getenv("INFLUX_URL", "http://localhost:8086")
        self.token = os.getenv("INFLUX_TOKEN", "iot_admin_token")
        self.org = os.getenv("INFLUX_ORG", "iot_org")
        self.bucket = os.getenv("INFLUX_BUCKET", "iot_platform")
        
        try:
            self.client = InfluxDBClient(
                url=self.url,
                token=self.token,
                org=self.org
            )
            self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
            self.query_api = self.client.query_api()
            logger.info("InfluxDB 客戶端初始化成功")
        except Exception as e:
            logger.error(f"InfluxDB 客戶端初始化失敗: {e}")
            self.client = None
            self.write_api = None
            self.query_api = None
    
    def is_connected(self):
        """檢查連線狀態"""
        try:
            if self.client:
                self.client.ping()
                return True
            return False
        except:
            return False
    
    def write_device_sensor_data(self, device_id: str, sensor_type: str, sensor_id: str, 
                                value: float, unit: str = "", location: str = "", 
                                quality: str = "good", status: str = "active", 
                                battery_level: Optional[int] = None, timestamp: Optional[datetime] = None):
        """寫入設備感測器數據"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，跳過數據寫入")
            return False
            
        try:
            point = Point("device_sensors") \
                .tag("device_id", device_id) \
                .tag("sensor_type", sensor_type) \
                .tag("sensor_id", sensor_id) \
                .tag("location", location) \
                .tag("unit", unit) \
                .field("value", value) \
                .field("quality", quality) \
                .field("status", status)
            
            if battery_level is not None:
                point = point.field("battery_level", battery_level)
            
            if timestamp:
                point = point.time(timestamp, WritePrecision.NS)
            
            self.write_api.write(bucket=self.bucket, record=point)
            logger.info(f"寫入設備感測器數據: {device_id} - {sensor_type} = {value}")
            return True
        except Exception as e:
            logger.error(f"寫入設備感測器數據失敗: {e}")
            return False
    
    def write_device_status(self, device_id: str, device_type: str, location: str, 
                           department: str, status: str, cpu_usage: float, 
                           memory_usage: float, disk_usage: float, temperature: float,
                           uptime_seconds: int, network_latency_ms: int, timestamp: Optional[datetime] = None):
        """寫入設備狀態數據"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，跳過數據寫入")
            return False
            
        try:
            point = Point("device_status") \
                .tag("device_id", device_id) \
                .tag("device_type", device_type) \
                .tag("location", location) \
                .tag("department", department) \
                .field("status", status) \
                .field("cpu_usage", cpu_usage) \
                .field("memory_usage", memory_usage) \
                .field("disk_usage", disk_usage) \
                .field("temperature", temperature) \
                .field("uptime_seconds", uptime_seconds) \
                .field("network_latency_ms", network_latency_ms)
            
            if timestamp:
                point = point.time(timestamp, WritePrecision.NS)
            
            self.write_api.write(bucket=self.bucket, record=point)
            logger.info(f"寫入設備狀態數據: {device_id} - {status}")
            return True
        except Exception as e:
            logger.error(f"寫入設備狀態數據失敗: {e}")
            return False
    
    def write_system_metrics(self, service: str, instance: str, environment: str, 
                            version: str, response_time_ms: float, throughput_rps: float,
                            error_rate: float, active_connections: int, memory_usage_mb: int,
                            cpu_usage_percent: float, timestamp: Optional[datetime] = None):
        """寫入系統效能指標"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，跳過數據寫入")
            return False
            
        try:
            point = Point("system_metrics") \
                .tag("service", service) \
                .tag("instance", instance) \
                .tag("environment", environment) \
                .tag("version", version) \
                .field("response_time_ms", response_time_ms) \
                .field("throughput_rps", throughput_rps) \
                .field("error_rate", error_rate) \
                .field("active_connections", active_connections) \
                .field("memory_usage_mb", memory_usage_mb) \
                .field("cpu_usage_percent", cpu_usage_percent)
            
            if timestamp:
                point = point.time(timestamp, WritePrecision.NS)
            
            self.write_api.write(bucket=self.bucket, record=point)
            logger.info(f"寫入系統效能指標: {service} - {instance}")
            return True
        except Exception as e:
            logger.error(f"寫入系統效能指標失敗: {e}")
            return False
    
    def write_ai_analysis(self, device_id: str, model_id: str, analysis_type: str,
                         model_version: str, anomaly_score: float, prediction_value: float,
                         confidence: float, status: str, severity: str, features_used: int,
                         timestamp: Optional[datetime] = None):
        """寫入 AI 分析結果"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，跳過數據寫入")
            return False
            
        try:
            point = Point("ai_analysis") \
                .tag("device_id", device_id) \
                .tag("model_id", model_id) \
                .tag("analysis_type", analysis_type) \
                .tag("model_version", model_version) \
                .field("anomaly_score", anomaly_score) \
                .field("prediction_value", prediction_value) \
                .field("confidence", confidence) \
                .field("status", status) \
                .field("severity", severity) \
                .field("features_used", features_used)
            
            if timestamp:
                point = point.time(timestamp, WritePrecision.NS)
            
            self.write_api.write(bucket=self.bucket, record=point)
            logger.info(f"寫入 AI 分析結果: {device_id} - {model_id}")
            return True
        except Exception as e:
            logger.error(f"寫入 AI 分析結果失敗: {e}")
            return False
    
    def write_alert_event(self, device_id: str, alert_type: str, severity: str,
                         category: str, alert_id: str, threshold_value: float,
                         actual_value: float, status: str, acknowledged: bool,
                         resolved: bool, timestamp: Optional[datetime] = None):
        """寫入警報事件"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，跳過數據寫入")
            return False
            
        try:
            point = Point("alert_events") \
                .tag("device_id", device_id) \
                .tag("alert_type", alert_type) \
                .tag("severity", severity) \
                .tag("category", category) \
                .field("alert_id", alert_id) \
                .field("threshold_value", threshold_value) \
                .field("actual_value", actual_value) \
                .field("status", status) \
                .field("acknowledged", acknowledged) \
                .field("resolved", resolved)
            
            if timestamp:
                point = point.time(timestamp, WritePrecision.NS)
            
            self.write_api.write(bucket=self.bucket, record=point)
            logger.info(f"寫入警報事件: {device_id} - {alert_type}")
            return True
        except Exception as e:
            logger.error(f"寫入警報事件失敗: {e}")
            return False
    
    def query_device_sensor_data(self, device_id: str, sensor_type: Optional[str] = None,
                                start_time: Optional[datetime] = None, end_time: Optional[datetime] = None,
                                limit: int = 1000) -> List[Dict[str, Any]]:
        """查詢設備感測器數據"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，無法查詢數據")
            return []
            
        try:
            query = f'''
            from(bucket: "{self.bucket}")
                |> range(start: {start_time.isoformat() if start_time else "-1h"}, 
                        stop: {end_time.isoformat() if end_time else "now()"})
                |> filter(fn: (r) => r["_measurement"] == "device_sensors")
                |> filter(fn: (r) => r["device_id"] == "{device_id}")
            '''
            
            if sensor_type:
                query += f'|> filter(fn: (r) => r["sensor_type"] == "{sensor_type}")'
            
            query += f'|> limit(n: {limit})'
            
            result = self.query_api.query(query)
            
            data = []
            for table in result:
                for record in table.records:
                    data.append({
                        "timestamp": record.get_time(),
                        "device_id": record.values.get("device_id"),
                        "sensor_type": record.values.get("sensor_type"),
                        "sensor_id": record.values.get("sensor_id"),
                        "value": record.get_value(),
                        "unit": record.values.get("unit"),
                        "quality": record.values.get("quality"),
                        "status": record.values.get("status")
                    })
            
            return data
        except Exception as e:
            logger.error(f"查詢設備感測器數據失敗: {e}")
            return []
    
    def query_device_status(self, device_id: str, start_time: Optional[datetime] = None,
                           end_time: Optional[datetime] = None, limit: int = 1000) -> List[Dict[str, Any]]:
        """查詢設備狀態數據"""
        if not self.is_connected():
            logger.warning("InfluxDB 未連線，無法查詢數據")
            return []
            
        try:
            query = f'''
            from(bucket: "{self.bucket}")
                |> range(start: {start_time.isoformat() if start_time else "-1h"}, 
                        stop: {end_time.isoformat() if end_time else "now()"})
                |> filter(fn: (r) => r["_measurement"] == "device_status")
                |> filter(fn: (r) => r["device_id"] == "{device_id}")
                |> limit(n: {limit})
            '''
            
            result = self.query_api.query(query)
            
            data = []
            for table in result:
                for record in table.records:
                    data.append({
                        "timestamp": record.get_time(),
                        "device_id": record.values.get("device_id"),
                        "status": record.values.get("status"),
                        "cpu_usage": record.values.get("cpu_usage"),
                        "memory_usage": record.values.get("memory_usage"),
                        "disk_usage": record.values.get("disk_usage"),
                        "temperature": record.values.get("temperature"),
                        "uptime_seconds": record.values.get("uptime_seconds"),
                        "network_latency_ms": record.values.get("network_latency_ms")
                    })
            
            return data
        except Exception as e:
            logger.error(f"查詢設備狀態數據失敗: {e}")
            return []
    
    def close(self):
        """關閉連線"""
        if self.client:
            self.client.close()

# 全域 InfluxDB 管理器實例
influxdb_manager = InfluxDBManager() 