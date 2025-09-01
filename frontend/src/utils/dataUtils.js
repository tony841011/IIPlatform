/**
 * 資料安全檢查工具
 * 防止 rawData.some is not a function 等錯誤
 */

/**
 * 確保資料是陣列格式
 * @param {any} data - 輸入資料
 * @param {any} defaultValue - 預設值
 * @returns {Array} 安全的陣列資料
 */
export const ensureArray = (data, defaultValue = []) => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data === null || data === undefined) {
    return defaultValue;
  }
  
  // 如果是物件，嘗試轉換為陣列
  if (typeof data === 'object') {
    try {
      // 檢查是否有可迭代的屬性
      if (data.length !== undefined) {
        return Array.from(data);
      }
      
      // 如果是物件，轉換為陣列格式
      return Object.entries(data).map(([key, value]) => ({ key, value }));
    } catch (error) {
      console.warn('無法將物件轉換為陣列:', error);
      return defaultValue;
    }
  }
  
  // 其他類型，包裝為陣列
  return [data];
};

/**
 * 安全的陣列操作
 * @param {any} data - 輸入資料
 * @param {Function} operation - 操作函數
 * @param {any} defaultValue - 預設值
 * @returns {any} 操作結果
 */
export const safeArrayOperation = (data, operation, defaultValue = []) => {
  const safeData = ensureArray(data, defaultValue);
  
  try {
    return operation(safeData);
  } catch (error) {
    console.error('陣列操作失敗:', error);
    return defaultValue;
  }
};

/**
 * 安全的過濾操作
 * @param {any} data - 輸入資料
 * @param {Function} filterFn - 過濾函數
 * @returns {Array} 過濾後的陣列
 */
export const safeFilter = (data, filterFn) => {
  return safeArrayOperation(data, (arr) => arr.filter(filterFn), []);
};

/**
 * 安全的映射操作
 * @param {any} data - 輸入資料
 * @param {Function} mapFn - 映射函數
 * @returns {Array} 映射後的陣列
 */
export const safeMap = (data, mapFn) => {
  return safeArrayOperation(data, (arr) => arr.map(mapFn), []);
};

/**
 * 安全的搜尋操作
 * @param {any} data - 輸入資料
 * @param {string} searchTerm - 搜尋詞
 * @param {string[]} fields - 搜尋欄位
 * @returns {Array} 搜尋結果
 */
export const safeSearch = (data, searchTerm, fields = []) => {
  if (!searchTerm) {
    return ensureArray(data);
  }
  
  return safeFilter(data, (item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    
    const searchFields = fields.length > 0 ? fields : Object.keys(item);
    
    return searchFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) {
        return false;
      }
      
      try {
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      } catch (error) {
        return false;
      }
    });
  });
};

/**
 * 安全的排序操作
 * @param {any} data - 輸入資料
 * @param {string} field - 排序欄位
 * @param {string} order - 排序順序 ('asc' | 'desc')
 * @returns {Array} 排序後的陣列
 */
export const safeSort = (data, field, order = 'asc') => {
  return safeArrayOperation(data, (arr) => {
    const sorted = [...arr].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      
      return order === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    
    return sorted;
  }, []);
};

/**
 * 檢查資料是否為有效的表格資料
 * @param {any} data - 輸入資料
 * @returns {boolean} 是否為有效表格資料
 */
export const isValidTableData = (data) => {
  const safeData = ensureArray(data);
  
  if (safeData.length === 0) {
    return false;
  }
  
  // 檢查第一行是否為物件
  const firstRow = safeData[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return false;
  }
  
  // 檢查是否有至少一個屬性
  return Object.keys(firstRow).length > 0;
};

/**
 * 生成安全的表格列配置
 * @param {any} data - 表格資料
 * @returns {Array} 列配置陣列
 */
export const generateSafeColumns = (data) => {
  if (!isValidTableData(data)) {
    return [];
  }
  
  const safeData = ensureArray(data);
  const firstRow = safeData[0];
  
  return Object.keys(firstRow).map(key => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: key,
    key: key,
    sorter: (a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }
      
      return String(aVal).localeCompare(String(bVal));
    },
    render: (text) => {
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
    }
  }));
};

/**
 * 清理和驗證資料
 * @param {any} data - 輸入資料
 * @returns {Array} 清理後的資料
 */
export const sanitizeData = (data) => {
  const safeData = ensureArray(data);
  
  return safeData.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return { id: index, error: '無效資料' };
    }
    
    // 確保每個項目都有 id 或 key
    if (!item.id && !item.key) {
      item.key = index;
    }
    
    return item;
  });
};

export default {
  ensureArray,
  safeArrayOperation,
  safeFilter,
  safeMap,
  safeSearch,
  safeSort,
  isValidTableData,
  generateSafeColumns,
  sanitizeData
}; 