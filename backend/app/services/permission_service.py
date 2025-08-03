from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..models import User, Role, Permission, RolePermission, UserPermission, ResourcePermission, PermissionCategory, PageCategory, Page
import datetime

class PermissionService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_permissions(self, user_id: int) -> Dict[str, List[str]]:
        """獲取用戶所有權限"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # 超級管理員擁有所有權限
        if user.is_superuser:
            return {"*": ["*"]}
        
        permissions = {}
        
        # 獲取角色權限
        for user_role in user.user_roles:
            role_permissions = self.db.query(RolePermission).filter(
                RolePermission.role_id == user_role.role_id,
                RolePermission.granted == True
            ).all()
            
            for rp in role_permissions:
                permission = self.db.query(Permission).filter(Permission.id == rp.permission_id).first()
                if permission and permission.is_active:
                    if permission.resource_type not in permissions:
                        permissions[permission.resource_type] = []
                    permissions[permission.resource_type].append(permission.action)
        
        # 獲取用戶特定權限（覆蓋角色權限）
        user_permissions = self.db.query(UserPermission).filter(
            UserPermission.user_id == user_id
        ).all()
        
        for up in user_permissions:
            permission = self.db.query(Permission).filter(Permission.id == up.permission_id).first()
            if permission and permission.is_active:
                if permission.resource_type not in permissions:
                    permissions[permission.resource_type] = []
                
                if up.granted:
                    if permission.action not in permissions[permission.resource_type]:
                        permissions[permission.resource_type].append(permission.action)
                else:
                    if permission.action in permissions[permission.resource_type]:
                        permissions[permission.resource_type].remove(permission.action)
        
        return permissions

    def check_permission(self, user_id: int, resource_type: str, action: str, resource_id: Optional[int] = None) -> bool:
        """檢查用戶是否有特定權限"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # 超級管理員擁有所有權限
        if user.is_superuser:
            return True
        
        # 檢查資源特定權限
        if resource_id:
            resource_permission = self.db.query(ResourcePermission).filter(
                ResourcePermission.user_id == user_id,
                ResourcePermission.resource_type == resource_type,
                ResourcePermission.resource_id == resource_id,
                ResourcePermission.permission == action,
                ResourcePermission.granted == True
            ).first()
            
            if resource_permission:
                return True
        
        # 檢查一般權限
        permissions = self.get_user_permissions(user_id)
        
        # 檢查通配符權限
        if "*" in permissions and "*" in permissions["*"]:
            return True
        
        # 檢查特定資源類型權限
        if resource_type in permissions:
            if "*" in permissions[resource_type] or action in permissions[resource_type]:
                return True
        
        return False

    def grant_permission_to_user(self, user_id: int, permission_id: int, granted_by: int) -> bool:
        """授予用戶權限"""
        try:
            user_permission = UserPermission(
                user_id=user_id,
                permission_id=permission_id,
                granted=True,
                granted_by=granted_by
            )
            self.db.add(user_permission)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False

    def revoke_permission_from_user(self, user_id: int, permission_id: int, revoked_by: int) -> bool:
        """撤銷用戶權限"""
        try:
            user_permission = UserPermission(
                user_id=user_id,
                permission_id=permission_id,
                granted=False,
                granted_by=revoked_by
            )
            self.db.add(user_permission)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False

    def grant_resource_permission(self, user_id: int, resource_type: str, resource_id: int, permission: str, granted_by: int) -> bool:
        """授予資源特定權限"""
        try:
            resource_permission = ResourcePermission(
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                permission=permission,
                granted=True,
                granted_by=granted_by
            )
            self.db.add(resource_permission)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False

    def get_permission_categories(self) -> List[Dict]:
        """獲取權限分類"""
        categories = self.db.query(PermissionCategory).filter(
            PermissionCategory.is_active == True
        ).order_by(PermissionCategory.order_index).all()
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "display_name": cat.display_name,
                "description": cat.description,
                "icon": cat.icon,
                "order_index": cat.order_index
            }
            for cat in categories
        ]

    def get_permissions_by_category(self, category_id: int) -> List[Dict]:
        """獲取分類下的權限"""
        permissions = self.db.query(Permission).filter(
            Permission.category_id == category_id,
            Permission.is_active == True
        ).all()
        
        return [
            {
                "id": perm.id,
                "name": perm.name,
                "display_name": perm.display_name,
                "description": perm.description,
                "resource_type": perm.resource_type,
                "action": perm.action
            }
            for perm in permissions
        ] 