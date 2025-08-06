from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import hashlib
import secrets

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