# 數據處理功能使用指南

## 概述

本平台的數據處理功能提供了從各種通訊協定和資料庫接回來的數據進行進一步處理的能力。支援多種數據源和處理器，可以靈活配置處理管道。

## 功能特色

### 支援的數據源
- **MQTT**: 支援 MQTT 通訊協定的數據接收和處理
- **Modbus**: 支援 Modbus TCP 通訊協定的數據處理
- **OPC UA**: 支援 OPC UA 通訊協定的數據處理
- **PostgreSQL**: 支援 PostgreSQL 資料庫查詢結果處理
- **MongoDB**: 支援 MongoDB 資料庫查詢結果處理
- **InfluxDB**: 支援 InfluxDB 時序資料庫查詢結果處理

### 數據處理器類型

#### 1. 過濾器 (Filter)
- **溫度過濾器**: 根據溫度範圍過濾數據
- **壓力過濾器**: 根據壓力範圍過濾數據
- **異常值過濾器**: 使用 IQR 方法檢測和過濾異常值

#### 2. 驗證器 (Validator)
- **範圍驗證**: 驗證數據值是否在指定範圍內
- **格式驗證**: 使用正則表達式驗證數據格式
- **完整性檢查**: 檢查必要欄位是否存在

#### 3. 轉換器 (Transformer)
- **單位轉換**: 支援溫度、壓力等單位的轉換
- **格式轉換**: 支援 JSON、CSV 等格式轉換
- **數據類型轉換**: 支援 int、float、str、bool 類型轉換

#### 4. 聚合器 (Aggregator)
- **統計聚合**: 計算平均值、標準差、最大值、最小值等
- **時間序列聚合**: 按時間窗口進行數據聚合
- **滾動平均**: 計算滾動平均值

#### 5. 標準化器 (Normalizer)
- **最小-最大標準化**: 將數據標準化到指定範圍
- **Z-score 標準化**: 使用 Z-score 方法標準化數據
- **小數縮放標準化**: 使用小數縮放方法標準化數據

## API 端點

### 數據處理端點

#### 處理 MQTT 數據
```http
POST /api/v1/data-processing/process-mqtt
Content-Type: application/json

{
  "topic": "iot/device1/data",
  "payload": {
    "temperature": 25.5,
    "humidity": 60
  }
}
```

#### 處理 Modbus 數據
```http
POST /api/v1/data-processing/process-modbus
Content-Type: application/json

{
  "device_id": "modbus_device_1",
  "registers": [100, 200, 300]
}
```

#### 處理資料庫數據
```http
POST /api/v1/data-processing/process-database
Content-Type: application/json

{
  "source_id": "postgresql_source",
  "query_result": {
    "rows": [
      {"id": 1, "value": 100}
    ]
  }
}
```

### 配置管理端點

#### 添加數據源
```http
POST /api/v1/data-processing/add-data-source
Content-Type: application/json

{
  "source_id": "mqtt_temperature_sensor",
  "type": "mqtt",
  "description": "溫度感測器 MQTT 數據源",
  "config": {
    "min_temperature": -50,
    "max_temperature": 150,
    "unit_conversions": {
      "temperature": {
        "from": "celsius",
        "to": "fahrenheit"
      }
    }
  }
}
```

#### 設置處理管道
```http
POST /api/v1/data-processing/set-pipeline
Content-Type: application/json

[
  "temperature_filter",
  "range_validation",
  "unit_conversion",
  "statistical_aggregate"
]
```

### 查詢端點

#### 獲取可用處理器
```http
GET /api/v1/data-processing/available-processors
```

#### 獲取處理器配置
```http
GET /api/v1/data-processing/processor-configs
```

#### 獲取數據源類型
```http
GET /api/v1/data-processing/data-source-types
```

#### 獲取處理器類別
```http
GET /api/v1/data-processing/processor-categories
```

#### 獲取預設處理管道
```http
GET /api/v1/data-processing/default-pipelines
```

## 使用範例

### 1. 配置溫度感測器數據處理

```python
# 添加溫度感測器數據源
source_config = {
    "source_id": "mqtt_temperature_sensor",
    "type": "mqtt",
    "description": "溫度感測器 MQTT 數據源",
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
            },
            "humidity": {
                "min": 0,
                "max": 100
            }
        },
        "required_fields": ["temperature", "humidity", "timestamp"]
    }
}

# 設置處理管道
pipeline = [
    "temperature_filter",
    "range_validation",
    "unit_conversion",
    "statistical_aggregate"
]
```

### 2. 處理 MQTT 數據

```python
import requests

# 處理 MQTT 數據
response = requests.post(
    "http://localhost:8000/api/v1/data-processing/process-mqtt",
    json={
        "topic": "iot/device1/data",
        "payload": {
            "temperature": 25.5,
            "humidity": 60,
            "timestamp": "2024-01-15T14:30:00Z"
        }
    }
)

result = response.json()
print(f"處理成功: {result['success']}")
print(f"處理時間: {result['processing_time']}秒")
print(f"處理結果: {result['data']}")
```

### 3. 處理 Modbus 數據

```python
# 處理 Modbus 數據
response = requests.post(
    "http://localhost:8000/api/v1/data-processing/process-modbus",
    json={
        "device_id": "modbus_device_1",
        "registers": [100, 200, 300]
    }
)

result = response.json()
print(f"處理成功: {result['success']}")
```

## 前端使用

### 1. 數據處理中心

在前端數據處理頁面中，您可以：

1. **查看數據源**: 在「數據源管理」標籤頁中查看所有配置的數據源
2. **配置處理規則**: 在「處理規則」標籤頁中配置數據處理規則
3. **查看處理結果**: 在「處理結果」標籤頁中查看數據處理結果
4. **配置處理管道**: 在「處理管道配置」標籤頁中配置數據處理管道
5. **測試處理功能**: 使用快速測試功能測試各種數據源的處理

### 2. 處理管道配置

在「處理管道配置」標籤頁中，您可以：

1. **查看可用處理器**: 查看所有可用的數據處理器
2. **配置處理管道**: 設置數據處理的步驟順序
3. **快速測試**: 測試 MQTT、Modbus、資料庫數據的處理

### 3. 即時處理結果

在「處理結果」標籤頁中，您可以：

1. **查看處理狀態**: 查看每次數據處理的成功/失敗狀態
2. **查看處理時間**: 查看數據處理的耗時
3. **查看處理結果**: 查看處理後的數據內容
4. **查看錯誤信息**: 如果處理失敗，查看詳細的錯誤信息

## 配置說明

### 數據源配置

每個數據源需要包含以下配置：

```json
{
  "source_id": "唯一標識符",
  "type": "數據源類型 (mqtt/modbus/postgresql/mongodb/influxdb)",
  "description": "數據源描述",
  "config": {
    // 具體的配置參數
  }
}
```

### 處理器配置

每個處理器可以配置以下參數：

- **過濾器**: 過濾條件、範圍設置
- **驗證器**: 驗證規則、格式要求
- **轉換器**: 轉換規則、目標格式
- **聚合器**: 聚合方法、窗口大小
- **標準化器**: 標準化方法、範圍設置

## 注意事項

1. **數據格式**: 確保輸入數據格式符合處理器的要求
2. **處理順序**: 處理管道的順序會影響最終結果
3. **錯誤處理**: 處理失敗時會記錄錯誤信息，但不會中斷整個管道
4. **性能考慮**: 複雜的處理管道可能會影響性能，請根據實際需求調整
5. **數據保存**: 處理結果會自動保存到配置的目標資料庫中

## 擴展開發

### 添加自定義處理器

您可以通過繼承 `DataProcessingService` 類來添加自定義處理器：

```python
class CustomDataProcessingService(DataProcessingService):
    def __init__(self):
        super().__init__()
        self.register_processor("custom_processor", self._custom_processor)
    
    async def _custom_processor(self, data: Any, config: Dict[str, Any]) -> Any:
        # 自定義處理邏輯
        return processed_data
```

### 添加自定義數據源

您可以通過配置檔案添加新的數據源類型：

```python
CUSTOM_DATA_SOURCES = {
    "custom_source": {
        "source_id": "custom_source",
        "type": "custom",
        "description": "自定義數據源",
        "config": {
            # 自定義配置
        }
    }
}
```

## 故障排除

### 常見問題

1. **處理失敗**: 檢查數據格式和處理器配置
2. **性能問題**: 優化處理管道順序，減少不必要的處理步驟
3. **連接問題**: 檢查數據源連接配置
4. **配置錯誤**: 檢查 JSON 格式和必要欄位

### 日誌查看

處理過程中的詳細日誌會記錄在後端日誌中，可以通過查看日誌來診斷問題。 