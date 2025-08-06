import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd
import numpy as np
from dataclasses import dataclass
from enum import Enum

from ..database import get_postgres_session, get_influx_client
from ..models import Device
from ..config.data_processing_config import (
    DEFAULT_DATA_SOURCES, 
    DEFAULT_PROCESSING_PIPELINES,
    PROCESSOR_CONFIGS,
    DATA_SOURCE_TYPE_MAPPING,
    PROCESSOR_CATEGORY_MAPPING
)

logger = logging.getLogger(__name__)

class ProcessingType(Enum):
    FILTER = "filter"
    AGGREGATE = "aggregate"
    TRANSFORM = "transform"
    ENRICH = "enrich"
    VALIDATE = "validate"
    NORMALIZE = "normalize"

class DataSourceType(Enum):
    MQTT = "mqtt"
    MODBUS = "modbus"
    OPCUA = "opcua"
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    INFLUXDB = "influxdb"

@dataclass
class ProcessingResult:
    success: bool
    data: Any
    metadata: Dict[str, Any]
    error_message: Optional[str] = None
    processing_time: Optional[float] = None

class DataProcessingService:
    def __init__(self):
        self.processing_rules: Dict[str, Callable] = {}
        self.data_sources: Dict[str, Any] = {}
        self.processing_pipeline: List[str] = []
        self._register_default_processors()
        self._load_default_configurations()
    
    def _register_default_processors(self):
        """註冊預設的數據處理器"""
        # 過濾器
        self.register_processor("temperature_filter", self._temperature_filter)
        self.register_processor("pressure_filter", self._pressure_filter)
        self.register_processor("outlier_filter", self._outlier_filter)
        
        # 聚合器
        self.register_processor("time_series_aggregate", self._time_series_aggregate)
        self.register_processor("statistical_aggregate", self._statistical_aggregate)
        self.register_processor("rolling_average", self._rolling_average)
        
        # 轉換器
        self.register_processor("unit_conversion", self._unit_conversion)
        self.register_processor("format_conversion", self._format_conversion)
        self.register_processor("data_type_conversion", self._data_type_conversion)
        
        # 驗證器
        self.register_processor("range_validation", self._range_validation)
        self.register_processor("format_validation", self._format_validation)
        self.register_processor("completeness_check", self._completeness_check)
        
        # 標準化器
        self.register_processor("min_max_normalize", self._min_max_normalize)
        self.register_processor("z_score_normalize", self._z_score_normalize)
        self.register_processor("decimal_scaling", self._decimal_scaling)
    
    def register_processor(self, name: str, processor_func: Callable):
        """註冊數據處理器"""
        self.processing_rules[name] = processor_func
        logger.info(f"註冊數據處理器: {name}")
    
    def add_data_source(self, source_id: str, source_config: Dict[str, Any]):
        """添加數據源配置"""
        self.data_sources[source_id] = source_config
        logger.info(f"添加數據源: {source_id}")
    
    def set_processing_pipeline(self, pipeline: List[str]):
        """設置處理管道"""
        self.processing_pipeline = pipeline
        logger.info(f"設置處理管道: {pipeline}")
    
    async def process_data_from_source(self, source_id: str, data: Any) -> ProcessingResult:
        """從指定數據源處理數據"""
        start_time = datetime.now()
        
        try:
            # 獲取數據源配置
            source_config = self.data_sources.get(source_id)
            if not source_config:
                return ProcessingResult(
                    success=False,
                    data=None,
                    metadata={},
                    error_message=f"未找到數據源配置: {source_id}"
                )
            
            # 執行處理管道
            processed_data = data
            metadata = {
                "source_id": source_id,
                "original_data": data,
                "processing_steps": []
            }
            
            for step in self.processing_pipeline:
                processor = self.processing_rules.get(step)
                if processor:
                    try:
                        step_start = datetime.now()
                        processed_data = await processor(processed_data, source_config)
                        step_time = (datetime.now() - step_start).total_seconds()
                        
                        metadata["processing_steps"].append({
                            "step": step,
                            "processing_time": step_time,
                            "success": True
                        })
                        
                        logger.debug(f"處理步驟 {step} 完成，耗時: {step_time:.3f}秒")
                    except Exception as e:
                        logger.error(f"處理步驟 {step} 失敗: {str(e)}")
                        metadata["processing_steps"].append({
                            "step": step,
                            "processing_time": 0,
                            "success": False,
                            "error": str(e)
                        })
                        return ProcessingResult(
                            success=False,
                            data=processed_data,
                            metadata=metadata,
                            error_message=f"處理步驟 {step} 失敗: {str(e)}"
                        )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            metadata["total_processing_time"] = processing_time
            
            return ProcessingResult(
                success=True,
                data=processed_data,
                metadata=metadata,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"數據處理失敗: {str(e)}")
            return ProcessingResult(
                success=False,
                data=data,
                metadata={"source_id": source_id, "error": str(e)},
                error_message=str(e),
                processing_time=processing_time
            )
    
    async def process_mqtt_data(self, topic: str, payload: Dict[str, Any]) -> ProcessingResult:
        """處理 MQTT 數據"""
        device_id = topic.split('/')[1]
        source_id = f"mqtt_{device_id}"
        
        # 添加 MQTT 特定的元數據
        enhanced_data = {
            "device_id": device_id,
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "data": payload
        }
        
        return await self.process_data_from_source(source_id, enhanced_data)
    
    async def process_modbus_data(self, device_id: str, registers: List[int]) -> ProcessingResult:
        """處理 Modbus 數據"""
        source_id = f"modbus_{device_id}"
        
        # 添加 Modbus 特定的元數據
        enhanced_data = {
            "device_id": device_id,
            "protocol": "modbus",
            "timestamp": datetime.now().isoformat(),
            "registers": registers
        }
        
        return await self.process_data_from_source(source_id, enhanced_data)
    
    async def process_database_data(self, source_id: str, query_result: Any) -> ProcessingResult:
        """處理資料庫查詢結果"""
        enhanced_data = {
            "source_id": source_id,
            "timestamp": datetime.now().isoformat(),
            "data": query_result
        }
        
        return await self.process_data_from_source(source_id, enhanced_data)
    
    # 預設處理器實現
    async def _temperature_filter(self, data: Any, config: Dict[str, Any]) -> Any:
        """溫度過濾器"""
        if isinstance(data, dict) and "data" in data:
            temp_data = data["data"]
            if isinstance(temp_data, dict) and "temperature" in temp_data:
                temp = temp_data["temperature"]
                min_temp = config.get("min_temperature", -50)
                max_temp = config.get("max_temperature", 150)
                
                if min_temp <= temp <= max_temp:
                    return data
                else:
                    logger.warning(f"溫度值 {temp} 超出範圍 [{min_temp}, {max_temp}]")
                    return None
        return data
    
    async def _pressure_filter(self, data: Any, config: Dict[str, Any]) -> Any:
        """壓力過濾器"""
        if isinstance(data, dict) and "data" in data:
            pressure_data = data["data"]
            if isinstance(pressure_data, dict) and "pressure" in pressure_data:
                pressure = pressure_data["pressure"]
                min_pressure = config.get("min_pressure", 0)
                max_pressure = config.get("max_pressure", 1000)
                
                if min_pressure <= pressure <= max_pressure:
                    return data
                else:
                    logger.warning(f"壓力值 {pressure} 超出範圍 [{min_pressure}, {max_pressure}]")
                    return None
        return data
    
    async def _outlier_filter(self, data: Any, config: Dict[str, Any]) -> Any:
        """異常值過濾器"""
        if isinstance(data, dict) and "data" in data:
            # 使用 IQR 方法檢測異常值
            values = []
            for key, value in data["data"].items():
                if isinstance(value, (int, float)):
                    values.append(value)
            
            if len(values) >= 3:
                q1 = np.percentile(values, 25)
                q3 = np.percentile(values, 75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                
                # 檢查是否有異常值
                outliers = [v for v in values if v < lower_bound or v > upper_bound]
                if outliers:
                    logger.warning(f"檢測到異常值: {outliers}")
                    return None
        return data
    
    async def _time_series_aggregate(self, data: Any, config: Dict[str, Any]) -> Any:
        """時間序列聚合"""
        if isinstance(data, dict) and "data" in data:
            window_size = config.get("window_size", 5)
            aggregation_type = config.get("aggregation_type", "mean")
            
            # 這裡需要歷史數據來進行聚合，暫時返回原始數據
            # 實際實現中需要從 InfluxDB 獲取歷史數據
            return data
        return data
    
    async def _statistical_aggregate(self, data: Any, config: Dict[str, Any]) -> Any:
        """統計聚合"""
        if isinstance(data, dict) and "data" in data:
            numeric_values = []
            for key, value in data["data"].items():
                if isinstance(value, (int, float)):
                    numeric_values.append(value)
            
            if numeric_values:
                stats = {
                    "count": len(numeric_values),
                    "mean": np.mean(numeric_values),
                    "std": np.std(numeric_values),
                    "min": np.min(numeric_values),
                    "max": np.max(numeric_values),
                    "median": np.median(numeric_values)
                }
                
                data["statistics"] = stats
        return data
    
    async def _rolling_average(self, data: Any, config: Dict[str, Any]) -> Any:
        """滾動平均"""
        window_size = config.get("window_size", 3)
        # 需要歷史數據實現滾動平均
        return data
    
    async def _unit_conversion(self, data: Any, config: Dict[str, Any]) -> Any:
        """單位轉換"""
        if isinstance(data, dict) and "data" in data:
            conversions = config.get("unit_conversions", {})
            for field, conversion in conversions.items():
                if field in data["data"]:
                    value = data["data"][field]
                    if conversion.get("from") == "celsius" and conversion.get("to") == "fahrenheit":
                        data["data"][field] = value * 9/5 + 32
                    elif conversion.get("from") == "fahrenheit" and conversion.get("to") == "celsius":
                        data["data"][field] = (value - 32) * 5/9
        return data
    
    async def _format_conversion(self, data: Any, config: Dict[str, Any]) -> Any:
        """格式轉換"""
        target_format = config.get("target_format", "json")
        if target_format == "csv":
            # 轉換為 CSV 格式
            if isinstance(data, dict):
                import io
                output = io.StringIO()
                pd.DataFrame([data]).to_csv(output, index=False)
                return output.getvalue()
        return data
    
    async def _data_type_conversion(self, data: Any, config: Dict[str, Any]) -> Any:
        """數據類型轉換"""
        type_mappings = config.get("type_mappings", {})
        if isinstance(data, dict) and "data" in data:
            for field, target_type in type_mappings.items():
                if field in data["data"]:
                    value = data["data"][field]
                    try:
                        if target_type == "int":
                            data["data"][field] = int(value)
                        elif target_type == "float":
                            data["data"][field] = float(value)
                        elif target_type == "str":
                            data["data"][field] = str(value)
                        elif target_type == "bool":
                            data["data"][field] = bool(value)
                    except (ValueError, TypeError):
                        logger.warning(f"無法轉換 {field} 為 {target_type}")
        return data
    
    async def _range_validation(self, data: Any, config: Dict[str, Any]) -> Any:
        """範圍驗證"""
        validations = config.get("range_validations", {})
        if isinstance(data, dict) and "data" in data:
            for field, validation in validations.items():
                if field in data["data"]:
                    value = data["data"][field]
                    min_val = validation.get("min")
                    max_val = validation.get("max")
                    
                    if min_val is not None and value < min_val:
                        logger.warning(f"{field} 值 {value} 小於最小值 {min_val}")
                        return None
                    if max_val is not None and value > max_val:
                        logger.warning(f"{field} 值 {value} 大於最大值 {max_val}")
                        return None
        return data
    
    async def _format_validation(self, data: Any, config: Dict[str, Any]) -> Any:
        """格式驗證"""
        validations = config.get("format_validations", {})
        if isinstance(data, dict) and "data" in data:
            for field, validation in validations.items():
                if field in data["data"]:
                    value = data["data"][field]
                    pattern = validation.get("pattern")
                    if pattern:
                        import re
                        if not re.match(pattern, str(value)):
                            logger.warning(f"{field} 格式驗證失敗: {value}")
                            return None
        return data
    
    async def _completeness_check(self, data: Any, config: Dict[str, Any]) -> Any:
        """完整性檢查"""
        required_fields = config.get("required_fields", [])
        if isinstance(data, dict) and "data" in data:
            missing_fields = []
            for field in required_fields:
                if field not in data["data"] or data["data"][field] is None:
                    missing_fields.append(field)
            
            if missing_fields:
                logger.warning(f"缺少必要欄位: {missing_fields}")
                return None
        return data
    
    async def _min_max_normalize(self, data: Any, config: Dict[str, Any]) -> Any:
        """最小-最大標準化"""
        if isinstance(data, dict) and "data" in data:
            normalization_config = config.get("normalization", {})
            for field, norm_config in normalization_config.items():
                if field in data["data"]:
                    value = data["data"][field]
                    min_val = norm_config.get("min", 0)
                    max_val = norm_config.get("max", 1)
                    feature_min = norm_config.get("feature_min", 0)
                    feature_max = norm_config.get("feature_max", 100)
                    
                    if feature_max != feature_min:
                        normalized = (value - feature_min) / (feature_max - feature_min) * (max_val - min_val) + min_val
                        data["data"][f"{field}_normalized"] = normalized
        return data
    
    async def _z_score_normalize(self, data: Any, config: Dict[str, Any]) -> Any:
        """Z-score 標準化"""
        if isinstance(data, dict) and "data" in data:
            normalization_config = config.get("z_score_normalization", {})
            for field, norm_config in normalization_config.items():
                if field in data["data"]:
                    value = data["data"][field]
                    mean = norm_config.get("mean", 0)
                    std = norm_config.get("std", 1)
                    
                    if std != 0:
                        z_score = (value - mean) / std
                        data["data"][f"{field}_z_score"] = z_score
        return data
    
    async def _decimal_scaling(self, data: Any, config: Dict[str, Any]) -> Any:
        """小數縮放標準化"""
        if isinstance(data, dict) and "data" in data:
            scaling_config = config.get("decimal_scaling", {})
            for field, scale_config in scaling_config.items():
                if field in data["data"]:
                    value = data["data"][field]
                    max_abs = scale_config.get("max_absolute", 1000)
                    
                    if max_abs != 0:
                        scaled = value / max_abs
                        data["data"][f"{field}_scaled"] = scaled
        return data
    
    def save_processing_result(self, result: ProcessingResult, target_database: str = "influxdb"):
        """保存處理結果"""
        try:
            if target_database == "influxdb":
                self._save_to_influxdb(result)
            elif target_database == "postgresql":
                self._save_to_postgresql(result)
            elif target_database == "mongodb":
                self._save_to_mongodb(result)
            
            logger.info(f"處理結果已保存到 {target_database}")
        except Exception as e:
            logger.error(f"保存處理結果失敗: {str(e)}")
    
    def _save_to_influxdb(self, result: ProcessingResult):
        """保存到 InfluxDB"""
        if result.success and result.data:
            try:
                influx_client = get_influx_client()
                if influx_client:
                    point = {
                        "measurement": "processed_data",
                        "tags": {
                            "source_id": result.metadata.get("source_id", "unknown"),
                            "status": "success"
                        },
                        "fields": result.data,
                        "time": datetime.utcnow()
                    }
                    
                    write_api = influx_client.write_api()
                    write_api.write(bucket="iot_platform", org="IIPlatform", record=point)
                    logger.info("數據已保存到 InfluxDB")
                else:
                    logger.warning("InfluxDB 客戶端不可用")
            except Exception as e:
                logger.error(f"保存到 InfluxDB 失敗: {str(e)}")
    
    def _save_to_postgresql(self, result: ProcessingResult):
        """保存到 PostgreSQL"""
        db = get_postgres_session()
        try:
            # 這裡可以實現保存到 PostgreSQL 的邏輯
            pass
        finally:
            db.close()
    
    def _save_to_mongodb(self, result: ProcessingResult):
        """保存到 MongoDB"""
        # 這裡可以實現保存到 MongoDB 的邏輯
        pass
    
    def _load_default_configurations(self):
        """載入預設配置"""
        # 載入預設數據源
        for source_id, source_config in DEFAULT_DATA_SOURCES.items():
            self.add_data_source(source_id, source_config)
        
        # 設置預設處理管道
        default_pipeline = DEFAULT_PROCESSING_PIPELINES.get("temperature_processing", [])
        self.set_processing_pipeline(default_pipeline)
        
        logger.info("預設配置載入完成")
    
    def get_processor_configs(self) -> Dict[str, Any]:
        """獲取處理器配置"""
        return PROCESSOR_CONFIGS
    
    def get_data_source_type_mapping(self) -> Dict[str, Any]:
        """獲取數據源類型映射"""
        return DATA_SOURCE_TYPE_MAPPING
    
    def get_processor_category_mapping(self) -> Dict[str, Any]:
        """獲取處理器類別映射"""
        return PROCESSOR_CATEGORY_MAPPING
    
    def get_default_pipelines(self) -> Dict[str, List[str]]:
        """獲取預設處理管道"""
        return DEFAULT_PROCESSING_PIPELINES

# 全局實例
data_processing_service = DataProcessingService() 