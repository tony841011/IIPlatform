import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Base
from app.database import engine

def init_db():
    """初始化資料庫，建立所有資料表"""
    print("🗄️  正在初始化資料庫...")
    Base.metadata.create_all(bind=engine)
    print("✅ 資料庫初始化完成！")
    print("📋 已建立的資料表：")
    print("   - users (用戶)")
    print("   - roles (角色)")
    print("   - devices (設備)")
    print("   - device_data (設備數據)")
    print("   - alerts (告警)")
    print("   - device_groups (設備群組)")
    print("   - firmwares (韌體)")
    print("   - ota_updates (OTA更新)")
    print("   - rules (規則)")
    print("   - workflows (工作流程)")
    print("   - workflow_executions (工作流程執行)")
    print("   - audit_logs (審計日誌)")
    print("   - device_commands (設備命令)")
    print("   - communication_protocols (通訊協定)")
    print("   - mqtt_configs (MQTT配置)")
    print("   - modbus_tcp_configs (Modbus TCP配置)")
    print("   - opc_ua_configs (OPC UA配置)")

if __name__ == "__main__":
    init_db() 
    print("   - database_connection_tests (資料庫連線測試)")
    print("   - ai_models (AI模型)")
    print("   - data_preprocessing (資料預處理)")
    print("   - model_trainings (模型訓練)")
    print("   - anomaly_detections (異常偵測)")
    print("   - anomaly_alerts (異常告警)")
    print("   - model_explainability (模型可解釋性)")
    print("   - model_operations (模型營運)")
    print("   - model_versions (模型版本)")
    print("   - gpu_devices (GPU設備)")
    print("   - gpu_monitoring (GPU監控)")
    print("   - gpu_resource_allocation (GPU資源分配)")
    print("   - gpu_alerts (GPU告警)")
    print("   - gpu_performance_config (GPU性能配置)")
    print("   - etl_workflows (ETL工作流程)")
    print("   - etl_executions (ETL執行記錄)")
    print("   - data_points (資料點位)")
    print("   - data_transformations (資料轉換)")
    print("   - data_quality_checks (資料品質檢查)")
    print("   - data_quality_results (資料品質結果)")
    print("   - data_mappings (資料映射)")
    print("   - data_cache (資料快取)")

if __name__ == "__main__":
    init_db() 