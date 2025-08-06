import axios from 'axios';

// 認證相關的工具函數

// 檢查用戶是否已登入
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// 獲取當前用戶資訊
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用戶資訊失敗:', error);
      return null;
    }
  }
  return null;
};

// 獲取用戶權限
export const getUserPermissions = () => {
  const user = getCurrentUser();
  return user ? user.permissions : [];
};

// 檢查用戶是否有特定權限
export const hasPermission = (permission) => {
  const permissions = getUserPermissions();
  return permissions.includes('all') || permissions.includes(permission);
};

// 檢查用戶是否有多個權限中的任一個
export const hasAnyPermission = (permissions) => {
  const userPermissions = getUserPermissions();
  return userPermissions.includes('all') || permissions.some(p => userPermissions.includes(p));
};

// 檢查用戶是否有所有指定權限
export const hasAllPermissions = (permissions) => {
  const userPermissions = getUserPermissions();
  return userPermissions.includes('all') || permissions.every(p => userPermissions.includes(p));
};

// 登入函數
export const login = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/auth/login', credentials);
    
    if (response.data.success) {
      // 儲存認證資訊
      localStorage.setItem('authToken', response.data.token || 'dummy-token');
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 設定 axios 預設 headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token || 'dummy-token'}`;
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } else {
      return {
        success: false,
        message: response.data.message
      };
    }
  } catch (error) {
    console.error('登入失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '登入失敗，請檢查網路連線'
    };
  }
};

// 登出函數
export const logout = () => {
  // 清除本地儲存的認證資訊
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // 清除 axios 預設 headers
  delete axios.defaults.headers.common['Authorization'];
  
  // 重新導向到登入頁面
  window.location.reload();
};

// 更新用戶資訊
export const updateUserInfo = (userData) => {
  const currentUser = getCurrentUser();
  const updatedUser = { ...currentUser, ...userData };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};

// 獲取資料庫連線狀態
export const getDatabaseStatus = () => {
  const user = getCurrentUser();
  return user ? user.database_status || {} : {};
};

// 測試資料庫連線
export const testDatabaseConnection = async (connectionId) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/v1/database-connections/${connectionId}/test`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '連線測試失敗'
    };
  }
};

// 初始化資料庫
export const initializeDatabases = async (selectedDatabases) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/database-connections/initialize', {
      selected_databases: selectedDatabases
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '資料庫初始化失敗'
    };
  }
};

// 權限對應表
export const PERMISSION_MAP = {
  // 平台相關
  'platform_view': '平台檢視',
  'platform_manage': '平台管理',
  
  // 儀表板相關
  'dashboard_view': '儀表板檢視',
  'dashboard_manage': '儀表板管理',
  
  // 設備相關
  'device_view': '設備檢視',
  'device_manage': '設備管理',
  'device_control': '設備控制',
  
  // 數據相關
  'data_view': '數據檢視',
  'data_manage': '數據管理',
  'data_export': '數據匯出',
  
  // 告警相關
  'alert_view': '告警檢視',
  'alert_manage': '告警管理',
  'alert_acknowledge': '告警確認',
  
  // 用戶管理
  'user_view': '用戶檢視',
  'user_manage': '用戶管理',
  'role_manage': '角色管理',
  
  // 系統管理
  'system_view': '系統檢視',
  'system_manage': '系統管理',
  'system_config': '系統配置',
  
  // 通知相關
  'notification_view': '通知檢視',
  'notification_manage': '通知管理',
  
  // 分析相關
  'analytics_view': '分析檢視',
  'analytics_manage': '分析管理',
  
  // 開發者相關
  'developer_access': '開發者存取',
  'api_access': 'API 存取',
  
  // 報表相關
  'report_view': '報表檢視',
  'report_manage': '報表管理',
  'report_export': '報表匯出'
};

// 獲取權限顯示名稱
export const getPermissionDisplayName = (permission) => {
  return PERMISSION_MAP[permission] || permission;
};

// 角色權限對應
export const ROLE_PERMISSIONS = {
  admin: [
    'all'
  ],
  operator: [
    'platform_view',
    'dashboard_view',
    'device_view',
    'device_manage',
    'device_control',
    'data_view',
    'data_export',
    'alert_view',
    'alert_manage',
    'alert_acknowledge',
    'notification_view',
    'analytics_view',
    'report_view',
    'report_export'
  ],
  viewer: [
    'platform_view',
    'dashboard_view',
    'device_view',
    'data_view',
    'alert_view',
    'notification_view',
    'analytics_view',
    'report_view'
  ]
};

// 獲取角色權限
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
};

// 檢查是否為管理員
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && (user.role === 'admin' || user.permissions?.includes('all'));
};

// 檢查是否為操作員
export const isOperator = () => {
  const user = getCurrentUser();
  return user && user.role === 'operator';
};

// 檢查是否為檢視者
export const isViewer = () => {
  const user = getCurrentUser();
  return user && user.role === 'viewer';
}; 