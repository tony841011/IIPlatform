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
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 認證相關
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
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
def create_device(device: schemas.DeviceCreate, db: Session = Depends(database.get_db)):
    """創建設備"""
    return database.create_device(db, device)

@app.get("/devices/", response_model=List[schemas.Device])
def list_devices(category_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    """獲取設備列表"""
    return database.get_devices(db, category_id)

@app.patch("/devices/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, update: schemas.DeviceUpdate, db: Session = Depends(database.get_db)):
    """更新設備"""
    return database.update_device(db, device_id, update)

# 設備類別管理 API
@app.post("/device-categories/", response_model=schemas.DeviceCategoryOut)
def create_device_category(
    category: schemas.DeviceCategoryCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """創建設備類別"""
    return database.create_device_category(db, category, current_user.id)

@app.get("/device-categories/", response_model=List[schemas.DeviceCategoryOut])
def list_device_categories(
    parent_id: Optional[int] = None,
    include_inactive: bool = False,
    db: Session = Depends(database.get_db)
):
    """獲取設備類別列表"""
    return database.get_device_categories(db, parent_id, include_inactive)

@app.get("/device-categories/tree")
def get_device_category_tree(db: Session = Depends(database.get_db)):
    """獲取設備類別樹狀結構"""
    return database.get_device_category_tree(db)

@app.get("/device-categories/{category_id}", response_model=schemas.DeviceCategoryOut)
def get_device_category(category_id: int, db: Session = Depends(database.get_db)):
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
    db: Session = Depends(database.get_db)
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
    db: Session = Depends(database.get_db)
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
def create_database_connection(connection: schemas.DatabaseConnectionCreate, db: Session = Depends(database.get_db)):
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
def list_database_connections(db: Session = Depends(database.get_db)):
    """獲取資料庫連線列表"""
    return db.query(models.DatabaseConnection).all()

@app.get("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def get_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """獲取單個資料庫連線"""
    connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    return connection

@app.patch("/database-connections/{connection_id}", response_model=schemas.DatabaseConnectionOut)
def update_database_connection(connection_id: int, connection: schemas.DatabaseConnectionUpdate, db: Session = Depends(database.get_db)):
    """更新資料庫連線"""
    db_connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not db_connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    for field, value in connection.dict(exclude_unset=True).items():
        setattr(db_connection, field, value)
    
    db.commit()
    db.refresh(db_connection)
    return db_connection

@app.delete("/database-connections/{connection_id}")
def delete_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """刪除資料庫連線"""
    db_connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not db_connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    db.delete(db_connection)
    db.commit()
    return {"message": "資料庫連線刪除成功"}

@app.post("/database-connections/{connection_id}/test")
def test_database_connection(connection_id: int, db: Session = Depends(database.get_db)):
    """測試資料庫連線"""
    connection = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="資料庫連線不存在")
    
    try:
        if connection.db_type == "mongodb":
            result = database.test_mongodb_connection(connection)
        else:
            result = database.test_database_connection(connection)
        
        # 更新測試結果
        connection.last_test_time = datetime.utcnow()
        connection.last_test_result = "success" if result.get("success") else "failed"
        connection.last_test_error = result.get("error")
        connection.response_time = result.get("response_time")
        db.commit()
        
        return result
    except Exception as e:
        # 更新測試結果
        connection.last_test_time = datetime.utcnow()
        connection.last_test_result = "failed"
        connection.last_test_error = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"測試失敗: {str(e)}")

# 用戶認證 API
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """用戶註冊"""
    return database.create_user(db, user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
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

# 其他基本 API
@app.get("/alerts/", response_model=List[schemas.AlertOut])
def get_alerts(device_id: int = None, db: Session = Depends(database.get_db)):
    """獲取告警列表"""
    return database.get_alerts(db, device_id)

@app.post("/data/")
def receive_data(data: schemas.DeviceData, db: Session = Depends(database.get_db)):
    """接收設備數據"""
    return database.create_device_data(db, data)

@app.get("/history/", response_model=List[schemas.DeviceData])
def get_history(device_id: int, db: Session = Depends(database.get_db)):
    """獲取設備歷史數據"""
    return database.get_device_history(db, device_id) 

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
        "admin": ["all"],
        "operator": ["device_management", "data_view", "alert_management", "dashboard_view"],
        "viewer": ["data_view", "report_view", "dashboard_view"]
    }
    return permissions.get(role, permissions["viewer"])

async def test_selected_databases(selected_databases):
    """測試選定的資料庫連線"""
    status = {}
    
    try:
        # 測試 PostgreSQL
        if selected_databases.get("postgresql"):
            try:
                from .database import engine
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                status["postgresql"] = True
            except Exception as e:
                status["postgresql"] = False
                print(f"PostgreSQL 連線失敗: {e}")
        
        # 測試 MongoDB
        if selected_databases.get("mongodb"):
            try:
                from .database import db_manager
                if db_manager.mongo_client:
                    db_manager.mongo_client.admin.command('ping')
                    status["mongodb"] = True
                else:
                    status["mongodb"] = False
            except Exception as e:
                status["mongodb"] = False
                print(f"MongoDB 連線失敗: {e}")
        
        # 測試 InfluxDB
        if selected_databases.get("influxdb"):
            try:
                from .database import db_manager
                if db_manager.influx_client:
                    health = db_manager.influx_client.health()
                    status["influxdb"] = True
                else:
                    status["influxdb"] = False
            except Exception as e:
                status["influxdb"] = False
                print(f"InfluxDB 連線失敗: {e}")
                
    except Exception as e:
        print(f"資料庫測試失敗: {e}")
    
    return status

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
        "username": "admin",
        "display_name": "系統管理員",
        "role": "admin",
        "permissions": ["all"]
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