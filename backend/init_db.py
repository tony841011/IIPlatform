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