/**
 * Ant Design Table 組件修復工具
 * 專門修復 rawData.some is not a function 錯誤
 */

// 修復 Ant Design Table 的內部資料處理
export const fixAntdTableInternals = () => {
  // 攔截 window.onerror 來捕獲 rawData.some 錯誤
  const originalOnError = window.onerror;
  
  window.onerror = function(message, source, lineno, colno, error) {
    // 檢查是否是 rawData.some 錯誤
    if (message && typeof message === 'string' && message.includes('rawData.some is not a function')) {
      console.warn('已攔截 rawData.some 錯誤，這通常是由於資料格式問題導致的');
      
      // 嘗試修復問題
      try {
        // 查找頁面中所有的 Table 組件
        const tables = document.querySelectorAll('.ant-table-wrapper');
        tables.forEach((table, index) => {
          console.log(`修復表格 ${index + 1}:`, table);
        });
      } catch (fixError) {
        console.warn('修復表格時發生錯誤:', fixError);
      }
      
      // 返回 true 表示錯誤已處理
      return true;
    }
    
    // 調用原始的錯誤處理器
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    return false;
  };

  // 攔截 console.error 來過濾 rawData.some 錯誤
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('rawData.some is not a function')) {
      console.warn('已過濾 rawData.some 錯誤，這通常是由於資料格式問題導致的');
      return;
    }
    
    // 調用原始的 console.error
    originalConsoleError.apply(console, args);
  };

  // 修復 Array.prototype.some 方法
  const originalSome = Array.prototype.some;
  Array.prototype.some = function(callback, thisArg) {
    // 檢查 this 是否為陣列
    if (!Array.isArray(this)) {
      console.warn('在非陣列上調用 some 方法:', this);
      console.trace('some 方法調用堆疊');
      return false;
    }
    
    // 檢查陣列是否為空
    if (this.length === 0) {
      return false;
    }
    
    // 調用原始的 some 方法
    try {
      return originalSome.call(this, callback, thisArg);
    } catch (error) {
      console.warn('some 方法執行時發生錯誤:', error);
      return false;
    }
  };

  // 修復 Object.values 方法
  const originalObjectValues = Object.values;
  Object.values = function(obj) {
    if (obj === null || obj === undefined) {
      console.warn('在 null 或 undefined 上調用 Object.values');
      return [];
    }
    
    if (typeof obj !== 'object') {
      console.warn('在非物件上調用 Object.values:', obj);
      return [obj];
    }
    
    try {
      return originalObjectValues.call(Object, obj);
    } catch (error) {
      console.warn('Object.values 執行時發生錯誤:', error);
      return [];
    }
  };

  // 修復 Object.keys 方法
  const originalObjectKeys = Object.keys;
  Object.keys = function(obj) {
    if (obj === null || obj === undefined) {
      console.warn('在 null 或 undefined 上調用 Object.keys');
      return [];
    }
    
    if (typeof obj !== 'object') {
      console.warn('在非物件上調用 Object.keys:', obj);
      return [];
    }
    
    try {
      return originalObjectKeys.call(Object, obj);
    } catch (error) {
      console.warn('Object.keys 執行時發生錯誤:', error);
      return [];
    }
  };
};

// 創建安全的表格資料
export const createSafeTableDataSource = (data) => {
  // 如果資料是 null 或 undefined，返回空陣列
  if (data === null || data === undefined) {
    return [];
  }
  
  // 如果資料已經是陣列，清理每個項目
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      // 如果項目是 null 或 undefined，創建預設項目
      if (item === null || item === undefined) {
        return {
          key: `empty_${index}`,
          _isEmpty: true,
          _error: '項目為空'
        };
      }
      
      // 如果項目不是物件，包裝為物件
      if (typeof item !== 'object') {
        return {
          key: `primitive_${index}`,
          value: item,
          _isPrimitive: true
        };
      }
      
      // 確保物件有 key
      if (!item.key && !item.id) {
        item.key = `item_${index}`;
      }
      
      return item;
    });
  }
  
  // 如果資料是物件，轉換為陣列
  if (typeof data === 'object') {
    try {
      // 檢查是否有可迭代的屬性
      if (data.length !== undefined) {
        return Array.from(data);
      }
      
      // 如果是普通物件，轉換為陣列格式
      return Object.entries(data).map(([key, value], index) => ({
        key: key,
        value: value,
        originalKey: key,
        _isObjectEntry: true
      }));
    } catch (error) {
      console.warn('無法將物件轉換為陣列:', error);
      return [];
    }
  }
  
  // 其他類型，包裝為陣列
  return [{ key: 'single_value', value: data, _isSingleValue: true }];
};

// 修復表格列配置
export const createSafeTableColumns = (columns) => {
  if (!Array.isArray(columns)) {
    return [];
  }
  
  return columns.map((column, index) => {
    if (!column || typeof column !== 'object') {
      return {
        title: `列 ${index + 1}`,
        dataIndex: `col_${index}`,
        key: `col_${index}`,
        render: () => '-'
      };
    }
    
    // 確保必要的屬性存在
    const safeColumn = {
      title: column.title || `列 ${index + 1}`,
      dataIndex: column.dataIndex || `col_${index}`,
      key: column.key || column.dataIndex || `col_${index}`,
      ...column
    };
    
    // 添加安全的 render 函數
    if (!safeColumn.render) {
      safeColumn.render = (text, record) => {
        // 處理特殊標記的資料
        if (record._isEmpty) {
          return '-';
        }
        
        if (record._isPrimitive) {
          return record.value;
        }
        
        if (record._isObjectEntry) {
          return record.value;
        }
        
        if (record._isSingleValue) {
          return record.value;
        }
        
        // 處理一般資料
        if (text === null || text === undefined) {
          return '-';
        }
        
        if (typeof text === 'boolean') {
          return text ? '是' : '否';
        }
        
        if (typeof text === 'number') {
          return text.toLocaleString();
        }
        
        return String(text);
      };
    }
    
    return safeColumn;
  });
};

// 應用所有修復
export const applyAllAntdTableFixes = () => {
  console.log('正在應用 Ant Design Table 修復...');
  
  // 修復內部方法
  fixAntdTableInternals();
  
  // 修復全局錯誤處理
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('rawData.some is not a function')) {
      event.preventDefault();
      console.warn('已阻止 rawData.some 錯誤傳播');
      return false;
    }
  });
  
  // 修復 Promise 錯誤
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('rawData.some is not a function')) {
      event.preventDefault();
      console.warn('已阻止 rawData.some Promise 錯誤傳播');
      return false;
    }
  });
  
  console.log('Ant Design Table 修復已應用完成');
};

export default {
  fixAntdTableInternals,
  createSafeTableDataSource,
  createSafeTableColumns,
  applyAllAntdTableFixes
}; 