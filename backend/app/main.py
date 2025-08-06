from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import hashlib
import secrets
from sqlalchemy import text

from . import models
from . import schemas
from . import database
from .services.data_processing_service import data_processing_service, ProcessingResult

app = FastAPI(title="工業物聯網平台 API", version="1.0.0")

# 添加 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康檢查端點
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 資料庫依賴
def get_db():
    db = database.get_postgres_session()
    try:
        yield db
    finally:
        db.close()

# 認證相關
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return database.get_current_user(token, db, credentials_exception)

# 基本端點
@app.get("/")
def read_root():
    return {"message": "工業物聯網平台 API", "version": "1.0.0"}

# 設備管理 API
@app.post("/devices/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    """創建設備"""
    return database.create_device(db, device)

@app.get("/devices/", response_model=List[schemas.Device])
def list_devices(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """獲取設備列表"""
    return database.get_devices(db, category_id)

@app.patch("/devices/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, update: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    """更新設備"""
    return database.update_device(db, device_id, update)

# 設備類別管理 API
@app.post("/device-categories/", response_model=schemas.DeviceCategoryOut)
def create_device_category(
    category: schemas.DeviceCategoryCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建設備類別"""
    return database.create_device_category(db, category, current_user.id)

@app.get("/device-categories/", response_model=List[schemas.DeviceCategoryOut])
def list_device_categories(
    parent_id: Optional[int] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """獲取設備類別列表"""
    return database.get_device_categories(db, parent_id, include_inactive)

@app.get("/device-categories/tree")
def get_device_category_tree(db: Session = Depends(get_db)):
    """獲取設備類別樹狀結構"""
    return database.get_device_category_tree(db)

@app.get("/device-categories/{category_id}", response_model=schemas.DeviceCategoryOut)
def get_device_category(category_id: int, db: Session = Depends(get_db)):
    """獲取單個設備類別"""
    category = database.get_device_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="設備類別不存在")
    return category

@app.patch("/device-categories/{category_id}", response_model=schemas.DeviceCategoryOut)
def update_device_category(
    category_id: int,
    category: schemas.DeviceCategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新設備類別"""
    updated_category = database.update_device_category(db, category_id, category)
    if not updated_category:
        raise HTTPException(status_code=404, detail="設備類別不存在")
    return updated_category

@app.delete("/device-categories/{category_id}")
def delete_device_category(
    category_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除設備類別"""
    try:
        success = database.delete_device_category(db, category_id)
        if not success:
            raise HTTPException(status_code=404, detail="設備類別不存在")
        return {"message": "設備類別刪除成功"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# 資料庫連線管理 API
@app.post("/database-connections/", response_model=schemas.DatabaseConnectionOut)
def create_database_connection(connection: schemas.DatabaseConnectionCreate, db: Session = Depends(get_db)):
    """創建資料庫連線"""
    try:
        db_connection = models.DatabaseConnection(**connection.dict())
        db.add(db_connection)
        db.commit()
        db.refresh(db_connection)
        return db_connection
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"創建連線失敗: {str(e)}")

@app.get("/database-connections/", response_model=List[schemas.DatabaseConnectionOut])
def list_database_connections(db: Session = Depends(get_db)):
    """獲取資料庫連線列表"""
    return db.query(models.DatabaseConnection).all()

@app.get("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def get_database_connection(connection_id: int, db: Session = Depends(get_db)):
    """獲取單個資料庫連線"""
    connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    return connection

@app.patch("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def update_database_connection(connection_id: int, connection: schemas.DatabaseConnectionUpdate, db: Session = Depends(get_db)):
    """更新資料庫連線"""
    db_connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not db_connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    for key, value in connection.dict(exclude_unset=True).items():
        setattr(db_connection, key, value)
    
    db.commit()
    db.refresh(db_connection)
    return db_connection

@app.delete("/database-connections/{connection_id}")
def delete_database_connection(connection_id: int, db: Session = Depends(get_db)):
    """刪除資料庫連線"""
    db_connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not db_connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    db.delete(db_connection)
    db.commit()
    return {"message": "資料庫連線刪除成功"}

@app.post("/database-connections/{connection_id}/test")
def test_database_connection(connection_id: int, db: Session = Depends(get_db)):
    """測試資料庫連線"""
    db_connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not db_connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    try:
        # 這裡應該實現實際的連線測試邏輯
        # 暫時返回成功
        return {"success": True, "message": "連線測試成功"}
    except Exception as e:
        return {"success": False, "message": f"連線測試失敗: {str(e)}"}

# 用戶管理 API
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """用戶註冊"""
    return database.create_user(db, user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用戶登入"""
    user = database.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = database.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """獲取當前用戶資訊"""
    return current_user

# 警報管理 API
@app.get("/alerts/", response_model=List[schemas.AlertOut])
def get_alerts(device_id: int = None, db: Session = Depends(get_db)):
    """獲取警報列表"""
    return database.get_alerts(db, device_id)

# 數據接收 API
@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(get_db)):
    """接收設備數據"""
    return database.create_device_data(data.device_id, data.dict())

@app.get("/history/", response_model=List[schemas.DeviceData])
def get_history(device_id: int, db: Session = Depends(get_db)):
    """獲取設備歷史數據"""
    return database.get_device_history(device_id)

# 新增登入相關的 API 端點
@app.post("/api/v1/auth/login")
async def login(credentials: dict):
    """用戶登入"""
    try:
        username = credentials.get("username")
        password = credentials.get("password")
        selected_databases = credentials.get("selected_databases", {})
        role = credentials.get("role", "admin")
        
        # 驗證用戶名和密碼
        if username == "admin" and password == "admin123":
            # 獲取用戶權限
            permissions = get_permissions_by_role(role)
            
            # 測試選定的資料庫連線
            database_status = {}
            if selected_databases:
                database_status = await test_selected_databases(selected_databases)
            
            return {
                "success": True,
                "user": {
                    "username": username,
                    "display_name": "系統管理員",
                    "role": role,
                    "permissions": permissions,
                    "selected_databases": selected_databases,
                    "database_status": database_status
                },
                "message": "登入成功"
            }
        else:
            return {
                "success": False,
                "message": "用戶名或密碼錯誤"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"登入失敗: {str(e)}"
        }

def get_permissions_by_role(role):
    """根據角色獲取權限"""
    permissions = {
        'admin': ['all'],
        'operator': ['device_management', 'data_view', 'alert_management'],
        'viewer': ['data_view', 'report_view']
    }
    return permissions.get(role, permissions['viewer'])

async def test_selected_databases(selected_databases):
    """測試選定的資料庫"""
    results = {}
    
    if selected_databases.get('postgresql'):
        try:
            # 測試 PostgreSQL 連線
            db = database.get_postgres_session()
            db.execute(text("SELECT 1"))
            db.close()
            results['postgresql'] = {'status': 'success', 'message': 'PostgreSQL 連線正常'}
        except Exception as e:
            results['postgresql'] = {'status': 'error', 'message': f'PostgreSQL 連線失敗: {str(e)}'}
    
    if selected_databases.get('mongodb'):
        try:
            # 測試 MongoDB 連線
            mongo_db = database.get_mongo_db()
            if mongo_db:
                mongo_db.command('ping')
                results['mongodb'] = {'status': 'success', 'message': 'MongoDB 連線正常'}
            else:
                results['mongodb'] = {'status': 'error', 'message': 'MongoDB 客戶端未初始化'}
        except Exception as e:
            results['mongodb'] = {'status': 'error', 'message': f'MongoDB 連線失敗: {str(e)}'}
    
    if selected_databases.get('influxdb'):
        try:
            # 測試 InfluxDB 連線
            influx_client = database.get_influx_client()
            if influx_client:
                health = influx_client.health()
                results['influxdb'] = {'status': 'success', 'message': 'InfluxDB 連線正常'}
            else:
                results['influxdb'] = {'status': 'error', 'message': 'InfluxDB 客戶端未初始化'}
        except Exception as e:
            results['influxdb'] = {'status': 'error', 'message': f'InfluxDB 連線失敗: {str(e)}'}
    
    return results

@app.post("/api/v1/auth/logout")
async def logout():
    """用戶登出"""
    return {
        "success": True,
        "message": "登出成功"
    }

@app.get("/api/v1/auth/user")
async def get_current_user():
    """獲取當前用戶資訊"""
    return {
        "success": True,
        "user": {
            "username": "admin",
            "display_name": "系統管理員",
            "role": "admin",
            "permissions": ["all"]
        }
    }

# 更新資料庫連線相關的 API 端點
@app.post("/api/v1/database-connections/")
async def create_database_connection(connection: dict):
    """創建資料庫連線"""
    try:
        # 驗證連線參數
        if not connection.get("name") or not connection.get("db_type"):
            return {"success": False, "message": "連線名稱和資料庫類型為必填項"}
        
        # 生成連線字串
        connection_string = generate_connection_string(connection)
        connection["connection_string"] = connection_string
        
        # 儲存到資料庫
        from .database import get_postgres_session
        from .models import DatabaseConnection
        
        db = get_postgres_session()
        try:
            db_connection = DatabaseConnection(**connection)
            db.add(db_connection)
            db.commit()
            db.refresh(db_connection)
            
            return {
                "success": True,
                "message": "資料庫連線創建成功",
                "data": {
                    "id": db_connection.id,
                    "name": db_connection.name,
                    "db_type": db_connection.db_type,
                    "host": db_connection.host,
                    "port": db_connection.port,
                    "database": db_connection.database,
                    "is_active": db_connection.is_active,
                    "is_default": db_connection.is_default
                }
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"創建連線失敗: {str(e)}"}
        finally:
            db.close()
            
    except Exception as e:
        return {"success": False, "message": f"創建連線失敗: {str(e)}"}

@app.put("/api/v1/database-connections/{connection_id}")
async def update_database_connection(connection_id: int, connection: dict):
    """更新資料庫連線"""
    try:
        from .database import get_postgres_session
        from .models import DatabaseConnection
        
        db = get_postgres_session()
        try:
            db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
            if not db_connection:
                return {"success": False, "message": "連線不存在"}
            
            # 更新連線字串
            connection_string = generate_connection_string(connection)
            connection["connection_string"] = connection_string
            
            # 更新欄位
            for key, value in connection.items():
                if hasattr(db_connection, key):
                    setattr(db_connection, key, value)
            
            db.commit()
            
            return {
                "success": True,
                "message": "資料庫連線更新成功",
                "data": {
                    "id": db_connection.id,
                    "name": db_connection.name,
                    "db_type": db_connection.db_type,
                    "host": db_connection.host,
                    "port": db_connection.port,
                    "database": db_connection.database,
                    "is_active": db_connection.is_active,
                    "is_default": db_connection.is_default
                }
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"更新連線失敗: {str(e)}"}
        finally:
            db.close()
            
    except Exception as e:
        return {"success": False, "message": f"更新連線失敗: {str(e)}"}

@app.delete("/api/v1/database-connections/{connection_id}")
async def delete_database_connection(connection_id: int):
    """刪除資料庫連線"""
    try:
        from .database import get_postgres_session
        from .models import DatabaseConnection
        
        db = get_postgres_session()
        try:
            db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
            if not db_connection:
                return {"success": False, "message": "連線不存在"}
            
            db.delete(db_connection)
            db.commit()
            
            return {"success": True, "message": "資料庫連線刪除成功"}
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"刪除連線失敗: {str(e)}"}
        finally:
            db.close()
            
    except Exception as e:
        return {"success": False, "message": f"刪除連線失敗: {str(e)}"}

@app.post("/api/v1/database-connections/{connection_id}/test")
async def test_database_connection(connection_id: int):
    """測試資料庫連線"""
    try:
        from .database import get_postgres_session
        from .models import DatabaseConnection
        
        db = get_postgres_session()
        try:
            db_connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
            if not db_connection:
                return {"success": False, "message": "連線不存在"}
            
            # 測試連線
            test_result = await test_remote_connection(db_connection)
            
            # 更新測試結果
            db_connection.last_test_time = datetime.utcnow()
            db_connection.last_test_result = "success" if test_result["success"] else "failed"
            db_connection.last_test_error = test_result.get("error", "")
            db_connection.response_time = test_result.get("response_time", 0)
            
            db.commit()
            
            return {
                "success": test_result["success"],
                "message": test_result["message"],
                "data": {
                    "response_time": test_result.get("response_time", 0),
                    "error": test_result.get("error", "")
                }
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"測試連線失敗: {str(e)}"}
        finally:
            db.close()
            
    except Exception as e:
        return {"success": False, "message": f"測試連線失敗: {str(e)}"}

@app.post("/api/v1/database-connections/initialize")
async def initialize_databases(selected_databases: dict):
    """初始化選定的資料庫"""
    try:
        results = {}
        
        for db_type, enabled in selected_databases.items():
            if enabled:
                result = await initialize_database_by_type(db_type)
                results[db_type] = result
        
        return {
            "success": True,
            "message": "資料庫初始化完成",
            "data": results
        }
    except Exception as e:
        return {"success": False, "message": f"資料庫初始化失敗: {str(e)}"}

# 數據處理 API
@app.post("/api/v1/data-processing/process-mqtt")
async def process_mqtt_data(topic: str, payload: dict):
    """處理 MQTT 數據"""
    try:
        result = await data_processing_service.process_mqtt_data(topic, payload)
        if result.success:
            data_processing_service.save_processing_result(result)
        return {
            "success": result.success,
            "data": result.data,
            "metadata": result.metadata,
            "error_message": result.error_message,
            "processing_time": result.processing_time
        }
    except Exception as e:
        # logger.error(f"處理 MQTT 數據失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"處理失敗: {str(e)}")

@app.post("/api/v1/data-processing/process-modbus")
async def process_modbus_data(device_id: str, registers: List[int]):
    """處理 Modbus 數據"""
    try:
        result = await data_processing_service.process_modbus_data(device_id, registers)
        if result.success:
            data_processing_service.save_processing_result(result)
        return {
            "success": result.success,
            "data": result.data,
            "metadata": result.metadata,
            "error_message": result.error_message,
            "processing_time": result.processing_time
        }
    except Exception as e:
        # logger.error(f"處理 Modbus 數據失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"處理失敗: {str(e)}")

@app.post("/api/v1/data-processing/process-database")
async def process_database_data(source_id: str, query_result: dict):
    """處理資料庫查詢結果"""
    try:
        result = await data_processing_service.process_database_data(source_id, query_result)
        if result.success:
            data_processing_service.save_processing_result(result)
        return {
            "success": result.success,
            "data": result.data,
            "metadata": result.metadata,
            "error_message": result.error_message,
            "processing_time": result.processing_time
        }
    except Exception as e:
        # logger.error(f"處理資料庫數據失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"處理失敗: {str(e)}")

@app.post("/api/v1/data-processing/add-data-source")
async def add_data_source(source_config: dict):
    """添加數據源配置"""
    try:
        source_id = source_config.get("source_id")
        if not source_id:
            raise HTTPException(status_code=400, detail="缺少 source_id")
        
        data_processing_service.add_data_source(source_id, source_config)
        return {"success": True, "message": f"數據源 {source_id} 添加成功"}
    except Exception as e:
        # logger.error(f"添加數據源失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"添加失敗: {str(e)}")

@app.post("/api/v1/data-processing/set-pipeline")
async def set_processing_pipeline(pipeline: List[str]):
    """設置處理管道"""
    try:
        data_processing_service.set_processing_pipeline(pipeline)
        return {"success": True, "message": "處理管道設置成功", "pipeline": pipeline}
    except Exception as e:
        # logger.error(f"設置處理管道失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"設置失敗: {str(e)}")

@app.get("/api/v1/data-processing/available-processors")
async def get_available_processors():
    """獲取可用的處理器列表"""
    try:
        processors = list(data_processing_service.processing_rules.keys())
        return {
            "success": True,
            "processors": processors,
            "count": len(processors)
        }
    except Exception as e:
        # logger.error(f"獲取處理器列表失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/data-sources")
async def get_data_sources():
    """獲取數據源列表"""
    try:
        sources = list(data_processing_service.data_sources.keys())
        return {
            "success": True,
            "sources": sources,
            "count": len(sources)
        }
    except Exception as e:
        # logger.error(f"獲取數據源列表失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/pipeline")
async def get_processing_pipeline():
    """獲取當前處理管道"""
    try:
        return {
            "success": True,
            "pipeline": data_processing_service.processing_pipeline
        }
    except Exception as e:
        # logger.error(f"獲取處理管道失敗: {str(e)}") # Original code had this line commented out
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/processor-configs")
async def get_processor_configs():
    """獲取處理器配置"""
    try:
        configs = data_processing_service.get_processor_configs()
        return {
            "success": True,
            "configs": configs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/data-source-types")
async def get_data_source_types():
    """獲取數據源類型映射"""
    try:
        types = data_processing_service.get_data_source_type_mapping()
        return {
            "success": True,
            "types": types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/processor-categories")
async def get_processor_categories():
    """獲取處理器類別映射"""
    try:
        categories = data_processing_service.get_processor_category_mapping()
        return {
            "success": True,
            "categories": categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

@app.get("/api/v1/data-processing/default-pipelines")
async def get_default_pipelines():
    """獲取預設處理管道"""
    try:
        pipelines = data_processing_service.get_default_pipelines()
        return {
            "success": True,
            "pipelines": pipelines
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取失敗: {str(e)}")

# 輔助函數
def generate_connection_string(connection):
    """生成資料庫連線字串"""
    from urllib.parse import quote_plus
    
    db_type = connection.get("db_type")
    host = connection.get("host")
    port = connection.get("port")
    database = connection.get("database")
    username = connection.get("username", "")
    password = connection.get("password", "")
    
    # URL 編碼用戶名和密碼
    encoded_username = quote_plus(username)
    encoded_password = quote_plus(password)
    
    if db_type == "postgresql":
        return f"postgresql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
    elif db_type == "mysql":
        return f"mysql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
    elif db_type == "mongodb":
        # MongoDB 連線字串
        auth_part = f"{encoded_username}:{encoded_password}@" if username and password else ""
        base_url = f"mongodb://{auth_part}{host}:{port}/{database}"
        
        # 添加 MongoDB 特定參數
        params = []
        if connection.get("auth_source"):
            params.append(f"authSource={connection['auth_source']}")
        if connection.get("auth_mechanism"):
            params.append(f"authMechanism={connection['auth_mechanism']}")
        if connection.get("replica_set"):
            params.append(f"replicaSet={connection['replica_set']}")
        if connection.get("ssl_enabled"):
            params.append("ssl=true")
        
        if params:
            base_url += f"?{'&'.join(params)}"
        
        return base_url
    elif db_type == "influxdb":
        return f"http://{host}:{port}"
    elif db_type == "oracle":
        return f"oracle://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
    elif db_type == "sqlserver":
        return f"mssql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
    else:
        return f"unknown://{encoded_username}:{encoded_password}@{host}:{port}/{database}"

async def test_remote_connection(connection):
    """測試遠端資料庫連線"""
    import time
    import asyncio
    
    start_time = time.time()
    
    try:
        db_type = connection.db_type
        connection_string = connection.connection_string
        
        if db_type == "postgresql":
            # 測試 PostgreSQL 連線
            import psycopg2
            from psycopg2 import OperationalError
            
            try:
                conn = psycopg2.connect(connection_string)
                conn.close()
                response_time = (time.time() - start_time) * 1000
                return {
                    "success": True,
                    "message": "PostgreSQL 連線成功",
                    "response_time": response_time
                }
            except OperationalError as e:
                return {
                    "success": False,
                    "message": "PostgreSQL 連線失敗",
                    "error": str(e)
                }
        
        elif db_type == "mongodb":
            # 測試 MongoDB 連線
            try:
                from pymongo import MongoClient
                from pymongo.errors import ConnectionFailure
                
                client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
                client.admin.command('ping')
                client.close()
                
                response_time = (time.time() - start_time) * 1000
                return {
                    "success": True,
                    "message": "MongoDB 連線成功",
                    "response_time": response_time
                }
            except ConnectionFailure as e:
                return {
                    "success": False,
                    "message": "MongoDB 連線失敗",
                    "error": str(e)
                }
        
        elif db_type == "influxdb":
            # 測試 InfluxDB 連線
            try:
                from influxdb_client import InfluxDBClient
                
                url = f"http://{connection.host}:{connection.port}"
                token = connection.token or ""
                org = connection.org or "IIPlatform"
                
                client = InfluxDBClient(url=url, token=token, org=org, timeout=5000)
                health = client.health()
                client.close()
                
                response_time = (time.time() - start_time) * 1000
                return {
                    "success": True,
                    "message": "InfluxDB 連線成功",
                    "response_time": response_time
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": "InfluxDB 連線失敗",
                    "error": str(e)
                }
        
        elif db_type == "mysql":
            # 測試 MySQL 連線
            try:
                import mysql.connector
                from mysql.connector import Error
                
                # 解析連線字串
                parts = connection_string.replace("mysql://", "").split("@")
                auth_part = parts[0].split(":")
                host_part = parts[1].split("/")
                
                username = auth_part[0]
                password = auth_part[1] if len(auth_part) > 1 else ""
                host_port = host_part[0].split(":")
                host = host_port[0]
                port = int(host_port[1]) if len(host_port) > 1 else 3306
                database = host_part[1] if len(host_part) > 1 else ""
                
                conn = mysql.connector.connect(
                    host=host,
                    port=port,
                    user=username,
                    password=password,
                    database=database,
                    connection_timeout=5
                )
                conn.close()
                
                response_time = (time.time() - start_time) * 1000
                return {
                    "success": True,
                    "message": "MySQL 連線成功",
                    "response_time": response_time
                }
            except Error as e:
                return {
                    "success": False,
                    "message": "MySQL 連線失敗",
                    "error": str(e)
                }
        
        else:
            return {
                "success": False,
                "message": f"不支援的資料庫類型: {db_type}",
                "error": "Unsupported database type"
            }
    
    except Exception as e:
        return {
            "success": False,
            "message": "連線測試失敗",
            "error": str(e)
        }

async def initialize_database_by_type(db_type):
    """根據類型初始化資料庫"""
    try:
        if db_type == "postgresql":
            # 初始化 PostgreSQL
            from .database import engine
            from .models import Base
            Base.metadata.create_all(bind=engine)
            return {"success": True, "message": "PostgreSQL 初始化成功"}
        
        elif db_type == "mongodb":
            # 初始化 MongoDB
            try:
                from .mongodb_init import init_mongodb_collections
                init_mongodb_collections()
                return {"success": True, "message": "MongoDB 初始化成功"}
            except Exception as e:
                return {"success": False, "message": f"MongoDB 初始化失敗: {str(e)}"}
        
        elif db_type == "influxdb":
            # 初始化 InfluxDB
            try:
                from .influxdb_init import init_influxdb_measurements
                init_influxdb_measurements()
                return {"success": True, "message": "InfluxDB 初始化成功"}
            except Exception as e:
                return {"success": False, "message": f"InfluxDB 初始化失敗: {str(e)}"}
        
        else:
            return {"success": False, "message": f"不支援的資料庫類型: {db_type}"}
    
    except Exception as e:
        return {"success": False, "message": f"資料庫初始化失敗: {str(e)}"} 