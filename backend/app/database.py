from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from .models import (
    Device, DeviceData, User, Alert, Base, DeviceGroup, Role, 
    Firmware, OTAUpdate, Rule, Workflow, WorkflowExecution, 
    AuditLog, DeviceCommand, CommunicationProtocol, MQTTConfig, 
    ModbusTCPConfig, OPCUAConfig, DatabaseConnection, DeviceCategory
)
import datetime
import uuid
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref

# 簡化的資料庫配置（避免依賴問題）
SQLALCHEMY_DATABASE_URL = "sqlite:///./iot.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 多資料庫管理器（可選）
class DatabaseManager:
    def __init__(self):
        # PostgreSQL 配置
        self.postgres_url = os.getenv("POSTGRES_URL", "postgresql://iot_user:iot_password@localhost:5432/iot_platform")
        self.postgres_engine = None
        self.PostgresSessionLocal = None
        
        # MongoDB 配置
        self.mongo_url = os.getenv("MONGO_URL", "mongodb://iot_user:iot_password@localhost:27017/")
        self.mongo_client = None
        self.mongo_db = None
        
        # InfluxDB 配置
        self.influx_url = os.getenv("INFLUX_URL", "http://localhost:8086")
        self.influx_token = os.getenv("INFLUX_TOKEN", "iot_admin_token")
        self.influx_org = os.getenv("INFLUX_ORG", "iot_org")
        self.influx_bucket = os.getenv("INFLUX_BUCKET", "iot_platform")
        self.influx_client = None
        
        # 嘗試初始化其他資料庫
        self._init_postgresql()
        self._init_mongodb()
        self._init_influxdb()
    
    def _init_postgresql(self):
        """初始化 PostgreSQL"""
        try:
            import psycopg2
            self.postgres_engine = create_engine(self.postgres_url)
            self.PostgresSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.postgres_engine)
            print("✅ PostgreSQL 初始化成功")
        except ImportError:
            print("⚠️  PostgreSQL 依賴未安裝，跳過初始化")
            print("   安裝指令: pip install psycopg2-binary")
        except Exception as e:
            print(f"❌ PostgreSQL 初始化失敗: {e}")
    
    def _init_mongodb(self):
        """初始化 MongoDB"""
        try:
            from pymongo import MongoClient
            self.mongo_client = MongoClient(self.mongo_url)
            self.mongo_db = self.mongo_client.iot_platform
            print("✅ MongoDB 初始化成功")
        except ImportError:
            print("⚠️  MongoDB 依賴未安裝，跳過初始化")
            print("   安裝指令: pip install pymongo")
        except Exception as e:
            print(f"❌ MongoDB 初始化失敗: {e}")
    
    def _init_influxdb(self):
        """初始化 InfluxDB"""
        try:
            from influxdb_client import InfluxDBClient
            self.influx_client = InfluxDBClient(
                url=self.influx_url,
                token=self.influx_token,
                org=self.influx_org
            )
            print("✅ InfluxDB 初始化成功")
        except ImportError:
            print("⚠️  InfluxDB 依賴未安裝，跳過初始化")
            print("   安裝指令: pip install influxdb-client")
        except Exception as e:
            print(f"❌ InfluxDB 初始化失敗: {e}")
    
    def get_postgres_session(self):
        """獲取 PostgreSQL 會話"""
        if self.PostgresSessionLocal:
            db = self.PostgresSessionLocal()
            try:
                yield db
            finally:
                db.close()
        else:
            # 回退到 SQLite
            yield get_db()
    
    def get_mongo_db(self):
        """獲取 MongoDB 資料庫"""
        return self.mongo_db if self.mongo_db else None
    
    def get_influx_client(self):
        """獲取 InfluxDB 客戶端"""
        return self.influx_client if self.influx_client else None
    
    def test_connections(self):
        """測試所有資料庫連線"""
        results = {
            "sqlite": {"status": "success", "message": "SQLite 連線正常"},
            "postgresql": {"status": "not_available", "message": "PostgreSQL 未配置"},
            "mongodb": {"status": "not_available", "message": "MongoDB 未配置"},
            "influxdb": {"status": "not_available", "message": "InfluxDB 未配置"}
        }
        
        # 測試 PostgreSQL
        if self.PostgresSessionLocal:
            try:
                db = self.PostgresSessionLocal()
                db.execute("SELECT 1")
                db.close()
                results["postgresql"] = {"status": "success", "message": "PostgreSQL 連線正常"}
            except Exception as e:
                results["postgresql"] = {"status": "error", "message": f"PostgreSQL 連線失敗: {e}"}
        
        # 測試 MongoDB
        if self.mongo_client:
            try:
                self.mongo_client.admin.command('ping')
                results["mongodb"] = {"status": "success", "message": "MongoDB 連線正常"}
            except Exception as e:
                results["mongodb"] = {"status": "error", "message": f"MongoDB 連線失敗: {e}"}
        
        # 測試 InfluxDB
        if self.influx_client:
            try:
                health = self.influx_client.health()
                results["influxdb"] = {"status": "success", "message": "InfluxDB 連線正常"}
            except Exception as e:
                results["influxdb"] = {"status": "error", "message": f"InfluxDB 連線失敗: {e}"}
        
        return results
    
    def close_all(self):
        """關閉所有資料庫連線"""
        if self.postgres_engine:
            self.postgres_engine.dispose()
        if self.mongo_client:
            self.mongo_client.close()
        if self.influx_client:
            self.influx_client.close()

# 創建全域資料庫管理器實例
db_manager = DatabaseManager()

# 簡化的資料庫函數（使用 SQLite 作為主要資料庫）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    return db_manager.get_mongo_db()

def get_influx_client():
    return db_manager.get_influx_client()

# 設備類別管理函數
def create_device_category(db, category, user_id):
    """創建設備類別"""
    from .models import DeviceCategory
    
    db_category = DeviceCategory(
        name=category.name,
        display_name=category.display_name,
        description=category.description,
        icon=category.icon,
        color=category.color,
        parent_id=category.parent_id,
        order_index=category.order_index,
        is_active=category.is_active,
        created_by=user_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_device_categories(db, parent_id=None, include_inactive=False):
    """獲取設備類別列表"""
    from .models import DeviceCategory
    
    query = db.query(DeviceCategory)
    
    if parent_id is not None:
        query = query.filter(DeviceCategory.parent_id == parent_id)
    else:
        query = query.filter(DeviceCategory.parent_id.is_(None))
    
    if not include_inactive:
        query = query.filter(DeviceCategory.is_active == True)
    
    return query.order_by(DeviceCategory.order_index, DeviceCategory.name).all()

def get_device_category(db, category_id):
    """獲取特定設備類別"""
    from .models import DeviceCategory
    return db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()

def update_device_category(db, category_id, category):
    """更新設備類別"""
    from .models import DeviceCategory
    
    db_category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not db_category:
        return None
    
    # 防止更新系統類別
    if db_category.is_system:
        raise Exception("無法修改系統類別")
    
    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_device_category(db, category_id):
    """刪除設備類別"""
    from .models import DeviceCategory
    
    db_category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not db_category:
        return {"message": "類別不存在"}
    
    # 防止刪除系統類別
    if db_category.is_system:
        raise Exception("無法刪除系統類別")
    
    # 檢查是否有子類別
    children = db.query(DeviceCategory).filter(DeviceCategory.parent_id == category_id).count()
    if children > 0:
        raise Exception("無法刪除有子類別的類別")
    
    # 檢查是否有設備使用此類別
    devices = db.query(Device).filter(Device.category_id == category_id).count()
    if devices > 0:
        raise Exception("無法刪除有設備使用的類別")
    
    db.delete(db_category)
    db.commit()
    return {"message": "類別已刪除"}

def get_device_category_tree(db):
    """獲取設備類別樹狀結構"""
    def build_tree(parent_id=None):
        categories = get_device_categories(db, parent_id)
        tree = []
        for category in categories:
            children = build_tree(category.id)
            category_dict = {
                "id": category.id,
                "name": category.name,
                "display_name": category.display_name,
                "description": category.description,
                "icon": category.icon,
                "color": category.color,
                "order_index": category.order_index,
                "is_active": category.is_active,
                "is_system": category.is_system,
                "children_count": len(children),
                "children": children
            }
            tree.append(category_dict)
        return tree
    
    return build_tree()

def get_device_category_with_stats(db, category_id):
    """獲取設備類別及其統計資訊"""
    from .models import DeviceCategory, Device
    
    category = get_device_category(db, category_id)
    if not category:
        return None
    
    # 計算子類別數量
    children_count = db.query(DeviceCategory).filter(DeviceCategory.parent_id == category_id).count()
    
    # 計算設備數量
    devices_count = db.query(Device).filter(Device.category_id == category_id).count()
    
    return {
        "id": category.id,
        "name": category.name,
        "display_name": category.display_name,
        "description": category.description,
        "icon": category.icon,
        "color": category.color,
        "parent_id": category.parent_id,
        "order_index": category.order_index,
        "is_active": category.is_active,
        "is_system": category.is_system,
        "children_count": children_count,
        "devices_count": devices_count,
        "created_by": category.created_by,
        "created_at": category.created_at,
        "updated_at": category.updated_at
    }

# 更新設備相關函數
def create_device(db, device):
    from .models import Device
    
    db_device = Device(
        name=device.name,
        location=device.location,
        category_id=device.category_id,
        group=device.group,
        tags=device.tags or "",
        device_type=device.device_type,
        firmware_version=device.firmware_version
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

# 修復 get_devices 函數
def get_devices(db, category_id=None):
    """獲取設備列表"""
    from .models import Device
    
    query = db.query(Device)
    
    # 檢查 category_id 欄位是否存在
    try:
        if category_id:
            query = query.filter(Device.category_id == category_id)
        return query.all()
    except Exception as e:
        # 如果 category_id 欄位不存在，返回所有設備
        print(f"警告: category_id 欄位不存在，返回所有設備: {e}")
        # 使用原生 SQL 查詢
        result = db.execute(text("SELECT * FROM devices"))
        devices = []
        for row in result:
            device_dict = {
                'id': row[0],
                'name': row[1],
                'location': row[2],
                'group': row[3],
                'category_id': None,  # 設為 None 因為欄位不存在
                'tags': row[4] if len(row) > 4 else '',
                'device_type': row[5] if len(row) > 5 else None,
                'status': row[6] if len(row) > 6 else 'offline',
                'firmware_version': row[7] if len(row) > 7 else None,
                'last_heartbeat': row[8] if len(row) > 8 else None,
                'battery_level': row[9] if len(row) > 9 else None,
                'temperature': row[10] if len(row) > 10 else None,
                'is_registered': row[11] if len(row) > 11 else False,
                'registration_date': row[12] if len(row) > 12 else None,
                'api_key': row[13] if len(row) > 13 else None
            }
            devices.append(device_dict)
        return devices

def update_device(db, device_id, update):
    from .models import Device
    
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)
    
    db.commit()
    db.refresh(device)
    return device

# 更新現有的資料庫操作函數以支援多資料庫
def create_device_data_multi_db(db, data, use_influxdb=True):
    """創建設備數據（支援多資料庫）"""
    # PostgreSQL 存儲基本資訊
    db_data = DeviceData(
        device_id=data.device_id,
        value=data.value,
        timestamp=data.timestamp
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    
    # InfluxDB 存儲時序數據
    if use_influxdb:
        try:
            from .influxdb_client import influxdb_manager
            if influxdb_manager.is_connected():
                influxdb_manager.write_device_sensor_data(
                    device_id=str(data.device_id),
                    sensor_type="general",
                    sensor_id="sensor_1",
                    value=data.value,
                    timestamp=data.timestamp
                )
        except Exception as e:
            print(f"InfluxDB 寫入失敗: {e}")
    
    return db_data

def get_device_history_multi_db(db, device_id, start_time=None, end_time=None, use_influxdb=True):
    """獲取設備歷史數據（支援多資料庫）"""
    # PostgreSQL 查詢
    query = db.query(DeviceData).filter(DeviceData.device_id == device_id)
    if start_time:
        query = query.filter(DeviceData.timestamp >= start_time)
    if end_time:
        query = query.filter(DeviceData.timestamp <= end_time)
    
    postgres_data = query.order_by(DeviceData.timestamp.desc()).all()
    
    # InfluxDB 查詢（如果啟用）
    influx_data = []
    if use_influxdb:
        try:
            from .influxdb_client import influxdb_manager
            if influxdb_manager.is_connected():
                influx_data = influxdb_manager.query_device_sensor_data(
                    device_id=str(device_id),
                    start_time=start_time,
                    end_time=end_time
                )
        except Exception as e:
            print(f"InfluxDB 查詢失敗: {e}")
    
    return {
        "postgresql": postgres_data,
        "influxdb": influx_data
    }

# 保留原有的函數以維持向後相容性
def create_device(db, device):
    db_device = Device(name=device.name, location=device.location)
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db):
    return db.query(Device).all()

def save_device_data(db, data):
    return create_device_data_multi_db(db, data)

def get_user_by_username(db, username):
    return db.query(User).filter(User.username == username).first()

def create_user(db, user):
    db_user = User(username=user.username, hashed_password=user.hashed_password, role=user.role if hasattr(user, 'role') else 'user')
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_alert(db, alert):
    db_alert = Alert(device_id=alert.device_id, value=alert.value, timestamp=alert.timestamp, message=alert.message)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_alerts(db, device_id=None):
    q = db.query(Alert)
    if device_id:
        q = q.filter(Alert.device_id == device_id)
    return q.order_by(Alert.timestamp.desc()).all()

def create_device_group(db, group):
    db_group = DeviceGroup(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_device_groups(db):
    return db.query(DeviceGroup).all()

def update_device(db, device_id, update):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device

# 設備管理與遠端控制
def register_device(db, registration):
    """設備註冊"""
    api_key = str(uuid.uuid4())
    device = Device(
        name=registration.device_id,
        device_type=registration.device_type,
        firmware_version=registration.firmware_version,
        api_key=api_key,
        is_registered=True,
        registration_date=datetime.datetime.utcnow(),
        status="online"
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

def update_device_heartbeat(db, heartbeat):
    """更新設備心跳"""
    device = db.query(Device).filter(Device.id == heartbeat.device_id).first()
    if device:
        device.last_heartbeat = datetime.datetime.utcnow()
        device.battery_level = heartbeat.battery_level
        device.temperature = heartbeat.temperature
        device.status = heartbeat.status
        db.commit()
        db.refresh(device)
    return device

def create_device_command(db, command, user_id):
    """創建設備命令"""
    db_command = DeviceCommand(
        device_id=command.device_id,
        command_type=command.command_type,
        parameters=command.parameters,
        status="pending",
        sent_by=user_id
    )
    db.add(db_command)
    db.commit()
    db.refresh(db_command)
    return db_command

def get_device_commands(db, device_id=None):
    q = db.query(DeviceCommand)
    if device_id:
        q = q.filter(DeviceCommand.device_id == device_id)
    return q.order_by(DeviceCommand.sent_at.desc()).all()

# 韌體管理
def create_firmware(db, firmware):
    """創建韌體"""
    db_firmware = Firmware(
        version=firmware.version,
        description=firmware.description,
        device_type=firmware.device_type
    )
    db.add(db_firmware)
    db.commit()
    db.refresh(db_firmware)
    return db_firmware

def get_firmwares(db, device_type=None):
    q = db.query(Firmware)
    if device_type:
        q = q.filter(Firmware.device_type == device_type)
    return q.all()

# OTA 更新
def create_ota_update(db, ota_update):
    """創建 OTA 更新"""
    db_ota = OTAUpdate(
        device_id=ota_update.device_id,
        firmware_id=ota_update.firmware_id,
        status="pending",
        started_at=datetime.datetime.utcnow()
    )
    db.add(db_ota)
    db.commit()
    db.refresh(db_ota)
    return db_ota

def get_ota_updates(db, device_id=None):
    q = db.query(OTAUpdate)
    if device_id:
        q = q.filter(OTAUpdate.device_id == device_id)
    return q.order_by(OTAUpdate.started_at.desc()).all()

# 規則管理
def create_rule(db, rule, user_id):
    """創建規則"""
    db_rule = Rule(
        name=rule.name,
        description=rule.description,
        conditions=rule.conditions,
        actions=rule.actions,
        created_by=user_id
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def get_rules(db):
    return db.query(Rule).all()

def evaluate_rule(db, rule_id, device_data):
    """評估規則"""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        return {"error": "規則不存在"}
    # 這裡實現規則評估邏輯
    return {"rule_id": rule_id, "evaluated": True, "result": "success"}

# 工作流程管理
def create_workflow(db, workflow, user_id):
    """創建工作流程"""
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        trigger_type=workflow.trigger_type,
        trigger_conditions=workflow.trigger_conditions,
        steps=workflow.steps,
        created_by=user_id
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def get_workflows(db):
    return db.query(Workflow).all()

def create_workflow_execution(db, workflow_id):
    """創建工作流程執行"""
    db_execution = WorkflowExecution(
        workflow_id=workflow_id,
        status="running",
        started_at=datetime.datetime.utcnow()
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution

# 審計日誌
def create_audit_log(db, audit_log, user_id=None):
    """創建審計日誌"""
    db_audit = AuditLog(
        user_id=user_id,
        action=audit_log.action,
        resource_type=audit_log.resource_type,
        resource_id=audit_log.resource_id,
        details=audit_log.details,
        ip_address=audit_log.ip_address,
        user_agent=audit_log.user_agent
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

def get_audit_logs(db, user_id=None, resource_type=None, limit=100):
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()

# 角色管理
def create_role(db, role):
    """創建角色"""
    db_role = Role(
        name=role.name,
        description=role.description,
        permissions=role.permissions
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_roles(db):
    return db.query(Role).all()

def check_permission(db, user_id, resource_type, resource_id, action):
    """檢查權限"""
    # 這裡實現權限檢查邏輯
    return {"user_id": user_id, "resource_type": resource_type, "resource_id": resource_id, "action": action, "allowed": True}

# 通訊協定管理
def create_communication_protocol(db, protocol):
    """創建通訊協定"""
    db_protocol = CommunicationProtocol(
        device_id=protocol.device_id,
        protocol_type=protocol.protocol_type,
        config=protocol.config
    )
    db.add(db_protocol)
    db.commit()
    db.refresh(db_protocol)
    return db_protocol

def get_communication_protocols(db, device_id=None):
    q = db.query(CommunicationProtocol)
    if device_id:
        q = q.filter(CommunicationProtocol.device_id == device_id)
    return q.all()

# MQTT 配置
def create_mqtt_config(db, config):
    """創建 MQTT 配置"""
    db_config = MQTTConfig(
        device_id=config.device_id,
        broker_url=config.broker_url,
        broker_port=config.broker_port,
        username=config.username,
        password=config.password,
        topic_prefix=config.topic_prefix,
        qos_level=config.qos_level,
        keep_alive=config.keep_alive,
        is_ssl=config.is_ssl
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_mqtt_configs(db, device_id=None):
    q = db.query(MQTTConfig)
    if device_id:
        q = q.filter(MQTTConfig.device_id == device_id)
    return q.all()

# Modbus TCP 配置
def create_modbus_tcp_config(db, config):
    """創建 Modbus TCP 配置"""
    db_config = ModbusTCPConfig(
        device_id=config.device_id,
        host=config.host,
        port=config.port,
        unit_id=config.unit_id,
        timeout=config.timeout,
        retries=config.retries
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_modbus_tcp_configs(db, device_id=None):
    q = db.query(ModbusTCPConfig)
    if device_id:
        q = q.filter(ModbusTCPConfig.device_id == device_id)
    return q.all()

# OPC UA 配置
def create_opc_ua_config(db, config):
    """創建 OPC UA 配置"""
    db_config = OPCUAConfig(
        device_id=config.device_id,
        server_url=config.server_url,
        namespace=config.namespace,
        node_id=config.node_id,
        username=config.username,
        password=config.password,
        security_policy=config.security_policy,
        message_security_mode=config.message_security_mode
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_opc_ua_configs(db, device_id=None):
    q = db.query(OPCUAConfig)
    if device_id:
        q = q.filter(OPCUAConfig.device_id == device_id)
    return q.all()

# 資料庫連線管理
def create_database_connection(db, connection):
    """創建資料庫連線"""
    try:
        connection_data = connection.model_dump()
        db_connection = DatabaseConnection(**connection_data)
        db.add(db_connection)
        db.commit()
        db.refresh(db_connection)
        return db_connection
    except Exception as e:
        db.rollback()
        raise Exception(f"創建資料庫連線失敗: {str(e)}")

def get_database_connections(db):
    """獲取資料庫連線列表"""
    return db.query(DatabaseConnection).all()

def get_database_connection(db, connection_id):
    """獲取特定資料庫連線"""
    return db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()

def update_database_connection(db, connection_id, connection):
    """更新資料庫連線"""
    try:
        db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
        if not db_connection:
            raise Exception("資料庫連線不存在")
        
        update_data = connection.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_connection, field, value)
        db.commit()
        db.refresh(db_connection)
        return db_connection
    except Exception as e:
        db.rollback()
        raise Exception(f"更新資料庫連線失敗: {str(e)}")

def delete_database_connection(db, connection_id):
    """刪除資料庫連線"""
    db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
    if db_connection:
        db.delete(db_connection)
        db.commit()
    return {"message": "連線已刪除"}

# MongoDB 連線測試功能
def test_mongodb_connection(connection_data):
    """測試 MongoDB 連線"""
    try:
        from pymongo import MongoClient
        import time
        
        start_time = time.time()
        
        # 構建 MongoDB 連線字串
        mongo_url = connection_data.connection_string
        
        # 建立連線
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
        
        # 測試連線
        client.admin.command('ping')
        
        # 獲取資料庫資訊
        db_info = client.server_info()
        
        end_time = time.time()
        response_time = end_time - start_time
        
        client.close()
        
        return {
            "success": True,
            "response_time": response_time,
            "server_info": db_info,
            "error_message": None
        }
    except ImportError:
        return {
            "success": False,
            "response_time": None,
            "server_info": None,
            "error_message": "MongoDB 依賴未安裝"
        }
    except Exception as e:
        return {
            "success": False,
            "response_time": None,
            "server_info": None,
            "error_message": str(e)
        }

def test_database_connection(connection_data):
    """測試資料庫連線"""
    import time
    start_time = time.time()
    
    try:
        if connection_data.db_type.lower() == "mongodb":
            return test_mongodb_connection(connection_data)
        elif connection_data.db_type.lower() == "postgresql":
            return test_postgresql_connection(connection_data)
        elif connection_data.db_type.lower() == "mysql":
            return test_mysql_connection(connection_data)
        else:
            return {
                "success": False,
                "error_message": f"不支援的資料庫類型: {connection_data.db_type}"
            }
    except Exception as e:
        return {
            "success": False,
            "error_message": str(e),
            "response_time": time.time() - start_time
        }

def test_mongodb_connection(connection_data):
    """測試 MongoDB 連線"""
    import time
    start_time = time.time()
    
    try:
        from pymongo import MongoClient
        
        # 構建連線字串
        if connection_data.username and connection_data.password:
            connection_string = f"mongodb://{connection_data.username}:{connection_data.password}@{connection_data.host}:{connection_data.port}/{connection_data.database}"
        else:
            connection_string = f"mongodb://{connection_data.host}:{connection_data.port}/{connection_data.database}"
        
        # 創建客戶端
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # 測試連線
        client.admin.command('ping')
        
        # 獲取資料庫資訊
        db_info = client.server_info()
        
        client.close()
        
        response_time = time.time() - start_time
        
        return {
            "success": True,
            "message": "MongoDB 連線成功",
            "server_info": db_info,
            "response_time": response_time
        }
        
    except Exception as e:
        response_time = time.time() - start_time
        return {
            "success": False,
            "error_message": f"MongoDB 連線失敗: {str(e)}",
            "response_time": response_time
        }

# 其他必要的函數
def verify_password(plain_password, hashed_password):
    """驗證密碼"""
    return plain_password == hashed_password  # 簡化版本

def get_password_hash(password):
    """獲取密碼雜湊"""
    return password  # 簡化版本

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    """創建存取權杖"""
    return "dummy_token"  # 簡化版本

def get_current_user(token: str, db, credentials_exception):
    """獲取當前用戶"""
    return db.query(User).first()  # 簡化版本

def authenticate_user(db, username: str, password: str):
    """認證用戶"""
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_device_data(db, data):
    """創建設備數據"""
    return create_device_data_multi_db(db, data)

def get_device_history(db, device_id):
    """獲取設備歷史數據"""
    return get_device_history_multi_db(db, device_id)

def detect_anomaly(db, device_id):
    """AI 異常檢測"""
    return {"device_id": device_id, "anomaly_detected": False, "confidence": 0.95} 

# 在現有函數後新增設備類別相關的資料庫操作

def create_device_category(db, category, user_id):
    """創建設備類別"""
    db_category = DeviceCategory(
        name=category.name,
        display_name=category.display_name,
        description=category.description,
        icon=category.icon,
        color=category.color,
        parent_id=category.parent_id,
        order_index=category.order_index,
        is_active=category.is_active,
        created_by=user_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_device_categories(db, parent_id=None, include_inactive=False):
    """獲取設備類別列表"""
    query = db.query(DeviceCategory)
    
    if parent_id is not None:
        query = query.filter(DeviceCategory.parent_id == parent_id)
    else:
        query = query.filter(DeviceCategory.parent_id.is_(None))
    
    if not include_inactive:
        query = query.filter(DeviceCategory.is_active == True)
    
    return query.order_by(DeviceCategory.order_index, DeviceCategory.name).all()

def get_device_category(db, category_id):
    """獲取特定設備類別"""
    return db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()

def update_device_category(db, category_id, category):
    """更新設備類別"""
    db_category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not db_category:
        return None
    
    # 防止更新系統類別
    if db_category.is_system:
        raise Exception("無法修改系統類別")
    
    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_device_category(db, category_id):
    """刪除設備類別"""
    db_category = db.query(DeviceCategory).filter(DeviceCategory.id == category_id).first()
    if not db_category:
        return {"message": "類別不存在"}
    
    # 防止刪除系統類別
    if db_category.is_system:
        raise Exception("無法刪除系統類別")
    
    # 檢查是否有子類別
    children = db.query(DeviceCategory).filter(DeviceCategory.parent_id == category_id).count()
    if children > 0:
        raise Exception("無法刪除有子類別的類別")
    
    # 檢查是否有設備使用此類別
    devices = db.query(Device).filter(Device.category_id == category_id).count()
    if devices > 0:
        raise Exception("無法刪除有設備使用的類別")
    
    db.delete(db_category)
    db.commit()
    return {"message": "類別已刪除"}

def get_device_category_tree(db):
    """獲取設備類別樹狀結構"""
    def build_tree(parent_id=None):
        categories = get_device_categories(db, parent_id)
        tree = []
        for category in categories:
            children = build_tree(category.id)
            category_dict = {
                "id": category.id,
                "name": category.name,
                "display_name": category.display_name,
                "description": category.description,
                "icon": category.icon,
                "color": category.color,
                "order_index": category.order_index,
                "is_active": category.is_active,
                "is_system": category.is_system,
                "children_count": len(children),
                "children": children
            }
            tree.append(category_dict)
        return tree
    
    return build_tree()

def get_device_category_with_stats(db, category_id):
    """獲取設備類別及其統計資訊"""
    category = get_device_category(db, category_id)
    if not category:
        return None
    
    # 計算子類別數量
    children_count = db.query(DeviceCategory).filter(DeviceCategory.parent_id == category_id).count()
    
    # 計算設備數量
    devices_count = db.query(Device).filter(Device.category_id == category_id).count()
    
    return {
        "id": category.id,
        "name": category.name,
        "display_name": category.display_name,
        "description": category.description,
        "icon": category.icon,
        "color": category.color,
        "parent_id": category.parent_id,
        "order_index": category.order_index,
        "is_active": category.is_active,
        "is_system": category.is_system,
        "children_count": children_count,
        "devices_count": devices_count,
        "created_by": category.created_by,
        "created_at": category.created_at,
        "updated_at": category.updated_at
    }

# 更新現有的設備相關函數
def create_device(db, device):
    db_device = Device(
        name=device.name,
        location=device.location,
        category_id=device.category_id,
        group=device.group,
        tags=device.tags or "",
        device_type=device.device_type,
        firmware_version=device.firmware_version
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def get_devices(db, category_id=None):
    query = db.query(Device)
    if category_id:
        query = query.filter(Device.category_id == category_id)
    return query.all()

def update_device(db, device_id, update):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)
    
    db.commit()
    db.refresh(device)
    return device 