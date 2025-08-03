from functools import wraps
from fastapi import HTTPException, Depends
from ..services.permission_service import PermissionService
from ..database import get_db
from ..models import User
from ..auth import get_current_user

def require_permission(resource_type: str, action: str):
    """權限檢查裝飾器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 這裡需要根據實際的 FastAPI 路由結構調整
            # 這是一個簡化的示例
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def check_resource_permission(resource_type: str, action: str):
    """檢查資源權限的依賴函數"""
    def permission_checker(
        current_user: User = Depends(get_current_user),
        db = Depends(get_db)
    ):
        permission_service = PermissionService(db)
        
        # 從路徑參數中獲取資源 ID
        # 這裡需要根據實際路由調整
        resource_id = None
        
        if not permission_service.check_permission(
            current_user.id, 
            resource_type, 
            action, 
            resource_id
        ):
            raise HTTPException(
                status_code=403, 
                detail=f"沒有權限執行 {action} 操作於 {resource_type}"
            )
        
        return current_user
    
    return permission_checker 