from fastapi import FastAPI, Depends, HTTPException, status, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
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
async def login(credentials: dict, db: Session = Depends(get_db)):
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
            
            # 檢查是否為首次登入
            is_first_time = database.check_first_time_setup(db)
            
            if is_first_time:
                # 首次登入，返回設定狀態
                return {
                    "success": True,
                    "is_first_time": True,
                    "user": {
                        "username": username,
                        "display_name": "系統管理員",
                        "role": role,
                        "permissions": permissions
                    },
                    "message": "首次登入，請設定資料庫連線"
                }
            else:
                # 非首次登入，使用已保存的設定
                active_settings = database.get_active_database_connection_settings(db)
                database_status = {}
                
                # 測試所有活躍的資料庫連線
                for setting in active_settings:
                    try:
                        if setting.db_type == "postgresql":
                            # 測試 PostgreSQL 連線
                            db_test = database.get_postgres_session()
                            db_test.execute(text("SELECT 1"))
                            db_test.close()
                            database_status[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線正常'}
                        elif setting.db_type == "mongodb":
                            # 測試 MongoDB 連線
                            mongo_db = database.get_mongo_db()
                            if mongo_db:
                                mongo_db.command('ping')
                                database_status[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線正常'}
                            else:
                                database_status[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗'}
                        elif setting.db_type == "influxdb":
                            # 測試 InfluxDB 連線
                            influx_client = database.get_influx_client()
                            if influx_client:
                                health = influx_client.health()
                                database_status[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線正常'}
                            else:
                                database_status[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗'}
                    except Exception as e:
                        database_status[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗: {str(e)}'}
                
                return {
                    "success": True,
                    "is_first_time": False,
                    "user": {
                        "username": username,
                        "display_name": "系統管理員",
                        "role": role,
                        "permissions": permissions,
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

# 首次登入設定相關 API
@app.get("/api/v1/auth/setup-status")
async def get_setup_status(db: Session = Depends(get_db)):
    """獲取設定狀態"""
    try:
        is_first_time = database.check_first_time_setup(db)
        setup_completed = database.get_system_setting(db, "first_time_setup_completed")
        
        return {
            "success": True,
            "is_first_time": is_first_time,
            "setup_completed": setup_completed is not None and setup_completed.value == "true",
            "message": "首次設定" if is_first_time else "設定已完成"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取設定狀態失敗: {str(e)}"
        }

@app.post("/api/v1/auth/first-time-setup")
async def first_time_setup(setup_data: schemas.FirstTimeSetup, db: Session = Depends(get_db)):
    """首次登入設定"""
    try:
        # 創建資料庫連線設定
        settings = []
        
        # PostgreSQL 設定
        postgresql_setting = database.create_database_connection_setting(
            db, 
            setup_data.postgresql, 
            created_by="admin"
        )
        settings.append(postgresql_setting)
        
        # MongoDB 設定
        mongodb_setting = database.create_database_connection_setting(
            db, 
            setup_data.mongodb, 
            created_by="admin"
        )
        settings.append(mongodb_setting)
        
        # InfluxDB 設定
        influxdb_setting = database.create_database_connection_setting(
            db, 
            setup_data.influxdb, 
            created_by="admin"
        )
        settings.append(influxdb_setting)
        
        # 標記設定完成
        database.mark_setup_completed(db)
        
        # 測試所有連線
        test_results = {}
        for setting in settings:
            try:
                if setting.db_type == "postgresql":
                    # 測試 PostgreSQL 連線
                    db_test = database.get_postgres_session()
                    db_test.execute(text("SELECT 1"))
                    db_test.close()
                    test_results[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線成功'}
                elif setting.db_type == "mongodb":
                    # 測試 MongoDB 連線
                    mongo_db = database.get_mongo_db()
                    if mongo_db:
                        mongo_db.command('ping')
                        test_results[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線成功'}
                    else:
                        test_results[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗'}
                elif setting.db_type == "influxdb":
                    # 測試 InfluxDB 連線
                    influx_client = database.get_influx_client()
                    if influx_client:
                        health = influx_client.health()
                        test_results[setting.db_type] = {'status': 'success', 'message': f'{setting.name} 連線成功'}
                    else:
                        test_results[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗'}
            except Exception as e:
                test_results[setting.db_type] = {'status': 'error', 'message': f'{setting.name} 連線失敗: {str(e)}'}
        
        return {
            "success": True,
            "message": "首次設定完成",
            "settings": [schemas.DatabaseConnectionSettingsOut.from_orm(s) for s in settings],
            "test_results": test_results
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"首次設定失敗: {str(e)}"
        }

@app.get("/api/v1/database-connection-settings/")
async def get_database_connection_settings(db: Session = Depends(get_db)):
    """獲取所有資料庫連線設定"""
    try:
        settings = database.get_database_connection_settings(db)
        return {
            "success": True,
            "settings": [schemas.DatabaseConnectionSettingsOut.from_orm(s) for s in settings]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取設定失敗: {str(e)}"
        }

@app.post("/api/v1/database-connection-settings/")
async def create_database_connection_setting(setting: schemas.DatabaseConnectionSettingsCreate, db: Session = Depends(get_db)):
    """創建資料庫連線設定"""
    try:
        db_setting = database.create_database_connection_setting(db, setting, created_by="admin")
        return {
            "success": True,
            "setting": schemas.DatabaseConnectionSettingsOut.from_orm(db_setting),
            "message": "設定創建成功"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"創建設定失敗: {str(e)}"
        }

@app.put("/api/v1/database-connection-settings/{setting_id}")
async def update_database_connection_setting(setting_id: int, setting: schemas.DatabaseConnectionSettingsUpdate, db: Session = Depends(get_db)):
    """更新資料庫連線設定"""
    try:
        db_setting = database.update_database_connection_setting(db, setting_id, setting)
        if db_setting:
            return {
                "success": True,
                "setting": schemas.DatabaseConnectionSettingsOut.from_orm(db_setting),
                "message": "設定更新成功"
            }
        else:
            return {
                "success": False,
                "message": "設定不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新設定失敗: {str(e)}"
        }

@app.delete("/api/v1/database-connection-settings/{setting_id}")
async def delete_database_connection_setting(setting_id: int, db: Session = Depends(get_db)):
    """刪除資料庫連線設定"""
    try:
        db_setting = database.delete_database_connection_setting(db, setting_id)
        if db_setting:
            return {
                "success": True,
                "message": "設定刪除成功"
            }
        else:
            return {
                "success": False,
                "message": "設定不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"刪除設定失敗: {str(e)}"
        }

# AI Model 管理 API
@app.get("/api/v1/ai-models/")
async def get_ai_models(
    skip: int = 0, 
    limit: int = 100, 
    type_filter: str = None,
    db: Session = Depends(get_db)
):
    """獲取 AI Model 列表"""
    try:
        models = database.get_ai_models(db, skip, limit, type_filter)
        return {
            "success": True,
            "models": [schemas.AIModelOut.from_orm(m) for m in models]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取模型列表失敗: {str(e)}"
        }

@app.post("/api/v1/ai-models/")
async def create_ai_model(
    model: schemas.AIModelCreate,
    db: Session = Depends(get_db)
):
    """創建 AI Model"""
    try:
        db_model = database.create_ai_model(db, model, created_by="admin")
        return {
            "success": True,
            "model": schemas.AIModelOut.from_orm(db_model),
            "message": "模型創建成功"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"創建模型失敗: {str(e)}"
        }

@app.get("/api/v1/ai-models/{model_id}")
async def get_ai_model(model_id: int, db: Session = Depends(get_db)):
    """獲取單個 AI Model"""
    try:
        model = database.get_ai_model(db, model_id)
        if model:
            return {
                "success": True,
                "model": schemas.AIModelOut.from_orm(model)
            }
        else:
            return {
                "success": False,
                "message": "模型不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取模型失敗: {str(e)}"
        }

@app.put("/api/v1/ai-models/{model_id}")
async def update_ai_model(
    model_id: int,
    model: schemas.AIModelUpdate,
    db: Session = Depends(get_db)
):
    """更新 AI Model"""
    try:
        db_model = database.update_ai_model(db, model_id, model)
        if db_model:
            return {
                "success": True,
                "model": schemas.AIModelOut.from_orm(db_model),
                "message": "模型更新成功"
            }
        else:
            return {
                "success": False,
                "message": "模型不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新模型失敗: {str(e)}"
        }

@app.delete("/api/v1/ai-models/{model_id}")
async def delete_ai_model(model_id: int, db: Session = Depends(get_db)):
    """刪除 AI Model"""
    try:
        db_model = database.delete_ai_model(db, model_id)
        if db_model:
            return {
                "success": True,
                "message": "模型刪除成功"
            }
        else:
            return {
                "success": False,
                "message": "模型不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"刪除模型失敗: {str(e)}"
        }

@app.post("/api/v1/ai-models/{model_id}/toggle-status")
async def toggle_ai_model_status(model_id: int, db: Session = Depends(get_db)):
    """切換 AI Model 狀態"""
    try:
        db_model = database.toggle_ai_model_status(db, model_id)
        if db_model:
            return {
                "success": True,
                "model": schemas.AIModelOut.from_orm(db_model),
                "message": "模型狀態已切換"
            }
        else:
            return {
                "success": False,
                "message": "模型不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"切換狀態失敗: {str(e)}"
        }

@app.post("/api/v1/ai-models/{model_id}/test")
async def test_ai_model(
    model_id: int,
    test_request: schemas.AIModelTestRequest,
    db: Session = Depends(get_db)
):
    """測試 AI Model"""
    try:
        import time
        start_time = time.time()
        
        # 這裡可以添加實際的模型測試邏輯
        # 目前只是模擬測試
        processing_time = time.time() - start_time
        
        # 記錄使用情況
        usage = schemas.AIModelUsageCreate(
            model_id=model_id,
            user_id="admin",
            request_type="inference",
            input_data=test_request.input_data,
            output_data={"result": "測試成功", "confidence": 0.95},
            processing_time=processing_time,
            success=True
        )
        database.create_ai_model_usage(db, usage)
        
        return {
            "success": True,
            "output_data": {"result": "測試成功", "confidence": 0.95},
            "processing_time": processing_time,
            "message": "模型測試成功"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"模型測試失敗: {str(e)}"
        }

@app.get("/api/v1/ai-models/{model_id}/usage")
async def get_ai_model_usage(
    model_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """獲取 AI Model 使用記錄"""
    try:
        usage_records = database.get_ai_model_usage(db, model_id, skip, limit)
        return {
            "success": True,
            "usage_records": [schemas.AIModelUsageOut.from_orm(u) for u in usage_records]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取使用記錄失敗: {str(e)}"
        }

@app.get("/api/v1/ai-models/{model_id}/performance")
async def get_ai_model_performance(
    model_id: int,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """獲取 AI Model 性能記錄"""
    try:
        performance_records = database.get_ai_model_performance(db, model_id, hours)
        return {
            "success": True,
            "performance_records": [schemas.AIModelPerformanceOut.from_orm(p) for p in performance_records]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取性能記錄失敗: {str(e)}"
        }

@app.get("/api/v1/ai-models/stats/overview")
async def get_ai_model_stats(db: Session = Depends(get_db)):
    """獲取 AI Model 統計信息"""
    try:
        stats = database.get_ai_model_stats(db)
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取統計信息失敗: {str(e)}"
        }

# 平台內容管理 API
@app.get("/api/v1/platform-content/")
async def get_platform_content(
    section: str = None,
    content_type: str = None,
    db: Session = Depends(get_db)
):
    """獲取平台內容"""
    try:
        contents = database.get_platform_content(db, section, content_type)
        return {
            "success": True,
            "contents": [schemas.PlatformContentOut.from_orm(c) for c in contents]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取平台內容失敗: {str(e)}"
        }

@app.get("/api/v1/platform-content/full")
async def get_platform_content_full(db: Session = Depends(get_db)):
    """獲取完整的平台內容"""
    try:
        content = database.get_platform_content_full(db)
        return {
            "success": True,
            "content": content
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取平台內容失敗: {str(e)}"
        }

@app.post("/api/v1/platform-content/")
async def create_platform_content(
    content: schemas.PlatformContentCreate,
    db: Session = Depends(get_db)
):
    """創建平台內容"""
    try:
        db_content = database.create_platform_content(db, content, created_by="admin")
        return {
            "success": True,
            "content": schemas.PlatformContentOut.from_orm(db_content),
            "message": "內容創建成功"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"創建內容失敗: {str(e)}"
        }

@app.put("/api/v1/platform-content/{content_id}")
async def update_platform_content(
    content_id: int,
    content: schemas.PlatformContentUpdate,
    db: Session = Depends(get_db)
):
    """更新平台內容"""
    try:
        db_content = database.update_platform_content(db, content_id, content)
        if db_content:
            return {
                "success": True,
                "content": schemas.PlatformContentOut.from_orm(db_content),
                "message": "內容更新成功"
            }
        else:
            return {
                "success": False,
                "message": "內容不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新內容失敗: {str(e)}"
        }

@app.delete("/api/v1/platform-content/{content_id}")
async def delete_platform_content(content_id: int, db: Session = Depends(get_db)):
    """刪除平台內容"""
    try:
        db_content = database.delete_platform_content(db, content_id)
        if db_content:
            return {
                "success": True,
                "message": "內容刪除成功"
            }
        else:
            return {
                "success": False,
                "message": "內容不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"刪除內容失敗: {str(e)}"
        }

# 平台圖片管理 API
@app.get("/api/v1/platform-images/")
async def get_platform_images(
    category: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """獲取平台圖片"""
    try:
        images = database.get_platform_images(db, category, is_active)
        return {
            "success": True,
            "images": [schemas.PlatformImageOut.from_orm(img) for img in images]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取圖片失敗: {str(e)}"
        }

@app.get("/api/v1/platform-images/{image_id}")
async def get_platform_image(image_id: int, db: Session = Depends(get_db)):
    """獲取單個平台圖片"""
    try:
        image = database.get_platform_image(db, image_id)
        if image:
            return {
                "success": True,
                "image": schemas.PlatformImageOut.from_orm(image)
            }
        else:
            return {
                "success": False,
                "message": "圖片不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取圖片失敗: {str(e)}"
        }

@app.post("/api/v1/platform-images/")
async def create_platform_image(
    image: schemas.PlatformImageCreate,
    db: Session = Depends(get_db)
):
    """創建平台圖片記錄"""
    try:
        db_image = database.create_platform_image(db, image, created_by="admin")
        return {
            "success": True,
            "image": schemas.PlatformImageOut.from_orm(db_image),
            "message": "圖片記錄創建成功"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"創建圖片記錄失敗: {str(e)}"
        }

@app.put("/api/v1/platform-images/{image_id}")
async def update_platform_image(
    image_id: int,
    image: schemas.PlatformImageUpdate,
    db: Session = Depends(get_db)
):
    """更新平台圖片"""
    try:
        db_image = database.update_platform_image(db, image_id, image)
        if db_image:
            return {
                "success": True,
                "image": schemas.PlatformImageOut.from_orm(db_image),
                "message": "圖片更新成功"
            }
        else:
            return {
                "success": False,
                "message": "圖片不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新圖片失敗: {str(e)}"
        }

@app.delete("/api/v1/platform-images/{image_id}")
async def delete_platform_image(image_id: int, db: Session = Depends(get_db)):
    """刪除平台圖片"""
    try:
        db_image = database.delete_platform_image(db, image_id)
        if db_image:
            return {
                "success": True,
                "message": "圖片刪除成功"
            }
        else:
            return {
                "success": False,
                "message": "圖片不存在"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"刪除圖片失敗: {str(e)}"
        }

@app.get("/api/v1/platform-images/stats/categories")
async def get_platform_image_categories(db: Session = Depends(get_db)):
    """獲取圖片分類統計"""
    try:
        categories = database.get_platform_images_by_category(db)
        return {
            "success": True,
            "categories": categories
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取分類統計失敗: {str(e)}"
        }

# 圖片上傳 API
@app.post("/api/v1/platform-images/upload")
async def upload_platform_image(
    file: UploadFile = File(...),
    category: str = Form("other"),
    description: str = Form(""),
    alt_text: str = Form(""),
    db: Session = Depends(get_db)
):
    """上傳平台圖片"""
    try:
        from app.services.image_service import image_service
        
        # 驗證文件類型
        if not file.content_type.startswith('image/'):
            return {
                "success": False,
                "message": "只支援圖片文件"
            }
        
        # 驗證文件大小（5MB）
        if file.size and file.size > 5 * 1024 * 1024:
            return {
                "success": False,
                "message": "文件大小不能超過 5MB"
            }
        
        # 保存圖片
        image_info = image_service.save_image(file, category)
        
        # 創建資料庫記錄
        image_data = schemas.PlatformImageCreate(
            name=image_info['original_filename'],
            original_filename=image_info['original_filename'],
            file_size=image_info['file_size'],
            file_type=image_info['file_type'],
            alt_text=alt_text or image_info['original_filename'],
            description=description,
            category=category,
            width=image_info['width'],
            height=image_info['height']
        )
        
        db_image = database.create_platform_image(db, image_data, created_by="admin")
        
        return {
            "success": True,
            "image": schemas.PlatformImageOut.from_orm(db_image),
            "message": "圖片上傳成功"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"圖片上傳失敗: {str(e)}"
        }

@app.get("/api/v1/platform-images/storage/info")
async def get_image_storage_info():
    """獲取圖片存儲信息"""
    try:
        from app.services.image_service import image_service
        info = image_service.get_storage_info()
        return {
            "success": True,
            "info": info
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"獲取存儲信息失敗: {str(e)}"
        }

# 靜態文件服務
@app.get("/api/images/{category}/{filename}")
async def serve_image(category: str, filename: str):
    """提供圖片文件服務"""
    try:
        from app.services.image_service import image_service
        from pathlib import Path
        
        # 構建文件路徑
        file_path = image_service.base_path / category / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="圖片不存在")
        
        # 返回文件
        return FileResponse(str(file_path))
        
    except Exception as e:
        raise HTTPException(status_code=404, detail="圖片不存在") 