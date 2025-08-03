from sqlalchemy.orm import Session
from ..models import PermissionCategory, Permission, Role, PageCategory, Page
import datetime

def init_permission_categories(db: Session):
    """初始化權限分類"""
    categories = [
        {
            "name": "dashboard",
            "display_name": "儀表板",
            "description": "儀表板相關權限",
            "icon": "DashboardOutlined",
            "order_index": 1
        },
        {
            "name": "device_management",
            "display_name": "設備管理",
            "description": "設備管理相關權限",
            "icon": "DesktopOutlined",
            "order_index": 2
        },
        {
            "name": "data_analysis",
            "display_name": "資料分析",
            "description": "資料分析相關權限",
            "icon": "BarChartOutlined",
            "order_index": 3
        },
        {
            "name": "ai_analysis",
            "display_name": "AI 分析",
            "description": "AI 分析相關權限",
            "icon": "RobotOutlined",
            "order_index": 4
        },
        {
            "name": "system_management",
            "display_name": "系統管理",
            "description": "系統管理相關權限",
            "icon": "SettingOutlined",
            "order_index": 5
        },
        {
            "name": "user_management",
            "display_name": "用戶管理",
            "description": "用戶管理相關權限",
            "icon": "UserOutlined",
            "order_index": 6
        }
    ]
    
    for cat_data in categories:
        category = PermissionCategory(**cat_data)
        db.add(category)
    
    db.commit()

def init_permissions(db: Session):
    """初始化權限"""
    permissions = [
        # 儀表板權限
        {"name": "dashboard:view", "display_name": "查看儀表板", "resource_type": "dashboard", "action": "view", "category_name": "dashboard"},
        
        # 設備管理權限
        {"name": "device:view", "display_name": "查看設備", "resource_type": "device", "action": "view", "category_name": "device_management"},
        {"name": "device:create", "display_name": "創建設備", "resource_type": "device", "action": "create", "category_name": "device_management"},
        {"name": "device:edit", "display_name": "編輯設備", "resource_type": "device", "action": "edit", "category_name": "device_management"},
        {"name": "device:delete", "display_name": "刪除設備", "resource_type": "device", "action": "delete", "category_name": "device_management"},
        {"name": "device:control", "display_name": "控制設備", "resource_type": "device", "action": "control", "category_name": "device_management"},
        
        # 資料分析權限
        {"name": "data:view", "display_name": "查看資料", "resource_type": "data", "action": "view", "category_name": "data_analysis"},
        {"name": "data:export", "display_name": "匯出資料", "resource_type": "data", "action": "export", "category_name": "data_analysis"},
        
        # AI 分析權限
        {"name": "ai:view", "display_name": "查看 AI 分析", "resource_type": "ai", "action": "view", "category_name": "ai_analysis"},
        {"name": "ai:train", "display_name": "訓練模型", "resource_type": "ai", "action": "train", "category_name": "ai_analysis"},
        {"name": "ai:deploy", "display_name": "部署模型", "resource_type": "ai", "action": "deploy", "category_name": "ai_analysis"},
        
        # 系統管理權限
        {"name": "system:view", "display_name": "查看系統設定", "resource_type": "system", "action": "view", "category_name": "system_management"},
        {"name": "system:edit", "display_name": "編輯系統設定", "resource_type": "system", "action": "edit", "category_name": "system_management"},
        
        # 用戶管理權限
        {"name": "user:view", "display_name": "查看用戶", "resource_type": "user", "action": "view", "category_name": "user_management"},
        {"name": "user:create", "display_name": "創建用戶", "resource_type": "user", "action": "create", "category_name": "user_management"},
        {"name": "user:edit", "display_name": "編輯用戶", "resource_type": "user", "action": "edit", "category_name": "user_management"},
        {"name": "user:delete", "display_name": "刪除用戶", "resource_type": "user", "action": "delete", "category_name": "user_management"},
        {"name": "role:manage", "display_name": "管理角色", "resource_type": "role", "action": "manage", "category_name": "user_management"}
    ]
    
    for perm_data in permissions:
        category = db.query(PermissionCategory).filter(
            PermissionCategory.name == perm_data["category_name"]
        ).first()
        
        if category:
            permission = Permission(
                name=perm_data["name"],
                display_name=perm_data["display_name"],
                resource_type=perm_data["resource_type"],
                action=perm_data["action"],
                category_id=category.id
            )
            db.add(permission)
    
    db.commit()

def init_roles(db: Session):
    """初始化角色"""
    roles = [
        {
            "name": "super_admin",
            "display_name": "超級管理員",
            "description": "擁有所有權限的超級管理員",
            "level": 999,
            "is_system": True
        },
        {
            "name": "admin",
            "display_name": "管理員",
            "description": "系統管理員，擁有大部分權限",
            "level": 100,
            "is_system": True
        },
        {
            "name": "operator",
            "display_name": "操作員",
            "description": "設備操作員，可以控制設備和查看資料",
            "level": 50,
            "is_system": True
        },
        {
            "name": "viewer",
            "display_name": "查看者",
            "description": "只能查看資料，無編輯權限",
            "level": 10,
            "is_system": True
        }
    ]
    
    for role_data in roles:
        role = Role(**role_data)
        db.add(role)
    
    db.commit()

def init_page_categories(db: Session):
    """初始化頁面分類"""
    categories = [
        {
            "name": "dashboard",
            "display_name": "儀表板",
            "description": "系統儀表板和概覽",
            "icon": "DashboardOutlined",
            "color": "#1890ff",
            "order_index": 1
        },
        {
            "name": "device_management",
            "display_name": "設備管理",
            "description": "設備註冊、監控和控制",
            "icon": "DesktopOutlined",
            "color": "#52c41a",
            "order_index": 2
        },
        {
            "name": "data_analysis",
            "display_name": "資料分析",
            "description": "資料處理和分析工具",
            "icon": "BarChartOutlined",
            "color": "#722ed1",
            "order_index": 3
        },
        {
            "name": "ai_analysis",
            "display_name": "AI 分析",
            "description": "AI 模型和機器學習",
            "icon": "RobotOutlined",
            "color": "#fa8c16",
            "order_index": 4
        },
        {
            "name": "system_management",
            "display_name": "系統管理",
            "description": "系統設定和配置",
            "icon": "SettingOutlined",
            "color": "#eb2f96",
            "order_index": 5
        }
    ]
    
    for cat_data in categories:
        category = PageCategory(**cat_data)
        db.add(category)
    
    db.commit()

def init_pages(db: Session):
    """初始化頁面"""
    pages = [
        # 儀表板分類
        {
            "name": "dashboard",
            "display_name": "儀表板",
            "path": "/",
            "component": "Dashboard",
            "icon": "DashboardOutlined",
            "category_name": "dashboard",
            "required_permission": "dashboard:view",
            "order_index": 1
        },
        
        # 設備管理分類
        {
            "name": "device_management",
            "display_name": "設備管理",
            "path": "/devices",
            "component": "DeviceManagement",
            "icon": "DesktopOutlined",
            "category_name": "device_management",
            "required_permission": "device:view",
            "order_index": 1
        },
        {
            "name": "device_control",
            "display_name": "設備控制",
            "path": "/device-control",
            "component": "DeviceControl",
            "icon": "ApiOutlined",
            "category_name": "device_management",
            "required_permission": "device:control",
            "order_index": 2
        },
        {
            "name": "ota_update",
            "display_name": "OTA 更新",
            "path": "/ota-update",
            "component": "OTAUpdate",
            "icon": "CloudUploadOutlined",
            "category_name": "device_management",
            "required_permission": "device:edit",
            "order_index": 3
        },
        {
            "name": "communication_protocols",
            "display_name": "通訊協定",
            "path": "/communication",
            "component": "CommunicationProtocols",
            "icon": "ApiOutlined",
            "category_name": "device_management",
            "required_permission": "device:edit",
            "order_index": 4
        },
        {
            "name": "video_recognition",
            "display_name": "串流影像辨識",
            "path": "/video-recognition",
            "component": "VideoRecognition",
            "icon": "VideoCameraOutlined",
            "category_name": "device_management",
            "required_permission": "device:view",
            "order_index": 5
        },
        
        # 資料分析分類
        {
            "name": "alert_center",
            "display_name": "告警中心",
            "path": "/alerts",
            "component": "AlertCenter",
            "icon": "AlertOutlined",
            "category_name": "data_analysis",
            "required_permission": "data:view",
            "order_index": 1
        },
        {
            "name": "history_analysis",
            "display_name": "歷史分析",
            "path": "/history",
            "component": "HistoryAnalysis",
            "icon": "HistoryOutlined",
            "category_name": "data_analysis",
            "required_permission": "data:view",
            "order_index": 2
        },
        {
            "name": "etl_flow_designer",
            "display_name": "ETL 流程設計器",
            "path": "/etl-flow-designer",
            "component": "ETLFlowDesigner",
            "icon": "NodeIndexOutlined",
            "category_name": "data_analysis",
            "required_permission": "data:view",
            "order_index": 3
        },
        
        # AI 分析分類
        {
            "name": "ai_analysis",
            "display_name": "AI 分析",
            "path": "/ai",
            "component": "AIAnalysis",
            "icon": "RobotOutlined",
            "category_name": "ai_analysis",
            "required_permission": "ai:view",
            "order_index": 1
        },
        
        # 系統管理分類
        {
            "name": "rule_engine",
            "display_name": "規則引擎",
            "path": "/rule-engine",
            "component": "RuleEngine",
            "icon": "SafetyCertificateOutlined",
            "category_name": "system_management",
            "required_permission": "system:edit",
            "order_index": 1
        },
        {
            "name": "workflow_automation",
            "display_name": "工作流程",
            "path": "/workflow",
            "component": "WorkflowAutomation",
            "icon": "ProjectOutlined",
            "category_name": "system_management",
            "required_permission": "system:edit",
            "order_index": 2
        },
        {
            "name": "audit_trail",
            "display_name": "審計日誌",
            "path": "/audit-trail",
            "component": "AuditTrail",
            "icon": "AuditOutlined",
            "category_name": "system_management",
            "required_permission": "system:view",
            "order_index": 3
        },
        {
            "name": "role_management",
            "display_name": "角色管理",
            "path": "/role-management",
            "component": "RoleManagement",
            "icon": "KeyOutlined",
            "category_name": "system_management",
            "required_permission": "role:manage",
            "order_index": 4
        },
        {
            "name": "database_connections",
            "display_name": "資料庫連線",
            "path": "/database-connections",
            "component": "DatabaseConnectionManagement",
            "icon": "DatabaseOutlined",
            "category_name": "system_management",
            "required_permission": "system:edit",
            "order_index": 5
        },
        {
            "name": "table_schemas",
            "display_name": "資料表設定",
            "path": "/table-schemas",
            "component": "TableSchemaManagement",
            "icon": "TableOutlined",
            "category_name": "system_management",
            "required_permission": "system:edit",
            "order_index": 6
        },
        {
            "name": "settings",
            "display_name": "系統設定",
            "path": "/settings",
            "component": "Settings",
            "icon": "SettingOutlined",
            "category_name": "system_management",
            "required_permission": "system:edit",
            "order_index": 7
        }
    ]
    
    for page_data in pages:
        category = db.query(PageCategory).filter(
            PageCategory.name == page_data["category_name"]
        ).first()
        
        if category:
            page = Page(
                name=page_data["name"],
                display_name=page_data["display_name"],
                path=page_data["path"],
                component=page_data["component"],
                icon=page_data["icon"],
                category_id=category.id,
                required_permission=page_data["required_permission"],
                order_index=page_data["order_index"]
            )
            db.add(page)
    
    db.commit()

def init_all(db: Session):
    """初始化所有權限和頁面資料"""
    init_permission_categories(db)
    init_permissions(db)
    init_roles(db)
    init_page_categories(db)
    init_pages(db) 