# 平台簡介客製化指南

## 概述

平台簡介頁面現在支援完整的客製化功能，包括文字內容調整和圖片管理。管理員可以根據企業需求自定義平台介紹內容，提升品牌形象和用戶體驗。

## 功能特色

### 🎨 內容客製化
- **標題和副標題**: 自定義平台名稱和描述
- **詳細描述**: 添加平台特色和優勢說明
- **功能特色**: 編輯平台核心功能介紹
- **技術架構**: 更新技術棧和框架信息
- **功能模組**: 自定義功能模組說明
- **快速開始**: 調整使用指南步驟

### 📸 圖片管理
- **圖片上傳**: 支援多種格式（JPG、PNG、GIF）
- **分類管理**: 按架構圖、界面截圖、演示圖等分類
- **自動優化**: 自動調整圖片大小和品質
- **輪播展示**: 圖片輪播展示功能
- **批量管理**: 批量上傳和管理圖片

### 🔧 編輯模式
- **切換模式**: 檢視模式和編輯模式切換
- **即時預覽**: 編輯時即時預覽效果
- **保存功能**: 一鍵保存所有變更
- **版本控制**: 支援內容版本管理

## 使用指南

### 1. 進入編輯模式

1. 訪問平台簡介頁面
2. 點擊右上角的「編輯模式」開關
3. 頁面會顯示編輯按鈕和功能

### 2. 編輯基本內容

#### 修改標題和描述
1. 點擊標題區域的「編輯」按鈕
2. 在彈出的模態框中修改：
   - **平台標題**: 例如 "企業物聯網平台"
   - **副標題**: 簡短描述平台特色
   - **詳細描述**: 完整的平台介紹

#### 修改功能特色
1. 點擊任意功能卡片的「編輯」按鈕
2. 修改功能標題和描述
3. 保存變更

#### 修改功能模組
1. 點擊模組卡片的「編輯」按鈕
2. 修改模組標題
3. 在文本框中輸入功能項目（每行一個）
4. 保存變更

### 3. 管理圖片

#### 上傳新圖片
1. 點擊「管理圖片」按鈕
2. 選擇圖片分類：
   - **架構圖**: 系統架構和組件圖
   - **界面截圖**: 平台界面展示
   - **演示圖**: 功能演示和流程圖
   - **其他**: 其他類型圖片
3. 輸入圖片描述
4. 點擊「選擇圖片」上傳文件
5. 支援格式：JPG、PNG、GIF，最大 5MB

#### 管理現有圖片
- **查看**: 點擊眼睛圖標查看大圖
- **刪除**: 點擊刪除圖標移除圖片
- **分類**: 按分類篩選圖片

### 4. 保存變更

1. 完成所有編輯後，點擊「保存所有變更」
2. 系統會保存所有修改的內容
3. 切換回檢視模式查看最終效果

## 圖片存儲配置

### 存儲路徑結構
```
uploads/
└── images/
    ├── architecture/     # 架構圖
    ├── interface/        # 界面截圖
    ├── demo/            # 演示圖
    └── other/           # 其他圖片
```

### 圖片處理規則
- **自動調整大小**: 超過 1920x1080 的圖片會自動縮放
- **品質優化**: 自動壓縮圖片品質（85%）
- **格式支援**: JPG、PNG、GIF
- **大小限制**: 單個文件最大 5MB

### 安全設定
- **文件類型驗證**: 只允許圖片文件
- **路徑安全**: 防止路徑遍歷攻擊
- **權限控制**: 只有管理員可以上傳和管理

## API 端點

### 平台內容管理
```bash
# 獲取平台內容
GET /api/v1/platform-content/

# 獲取完整內容結構
GET /api/v1/platform-content/full

# 創建內容
POST /api/v1/platform-content/

# 更新內容
PUT /api/v1/platform-content/{content_id}

# 刪除內容
DELETE /api/v1/platform-content/{content_id}
```

### 圖片管理
```bash
# 獲取圖片列表
GET /api/v1/platform-images/

# 上傳圖片
POST /api/v1/platform-images/upload

# 獲取圖片詳情
GET /api/v1/platform-images/{image_id}

# 更新圖片信息
PUT /api/v1/platform-images/{image_id}

# 刪除圖片
DELETE /api/v1/platform-images/{image_id}

# 獲取圖片統計
GET /api/v1/platform-images/stats/categories

# 獲取存儲信息
GET /api/v1/platform-images/storage/info
```

### 圖片訪問
```bash
# 訪問圖片文件
GET /api/images/{category}/{filename}
```

## 資料庫設計

### 平台內容表 (platform_content)
```sql
CREATE TABLE platform_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR NOT NULL,           -- 內容區塊
    content_type VARCHAR NOT NULL,      -- 內容類型
    content_key VARCHAR NOT NULL,       -- 內容鍵值
    content_value TEXT,                 -- 文字內容
    content_json JSONB,                 -- JSON 格式內容
    sort_order INTEGER DEFAULT 0,       -- 排序順序
    is_active BOOLEAN DEFAULT TRUE,     -- 是否啟用
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR                  -- 創建者
);
```

### 平台圖片表 (platform_images)
```sql
CREATE TABLE platform_images (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,              -- 圖片名稱
    filename VARCHAR NOT NULL,          -- 實際文件名
    original_filename VARCHAR NOT NULL, -- 原始文件名
    file_path VARCHAR NOT NULL,         -- 文件路徑
    file_size INTEGER NOT NULL,         -- 文件大小
    file_type VARCHAR NOT NULL,         -- 文件類型
    alt_text VARCHAR,                   -- 替代文字
    description TEXT,                   -- 圖片描述
    category VARCHAR NOT NULL,          -- 圖片分類
    width INTEGER,                      -- 圖片寬度
    height INTEGER,                     -- 圖片高度
    is_active BOOLEAN DEFAULT TRUE,     -- 是否啟用
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR                  -- 創建者
);
```

## 最佳實踐

### 1. 內容管理
- **保持一致性**: 確保所有內容風格統一
- **定期更新**: 定期更新平台特色和功能
- **版本備份**: 重要變更前先備份內容
- **多語言支援**: 考慮多語言內容管理

### 2. 圖片管理
- **圖片品質**: 使用高品質的圖片
- **適當大小**: 避免過大的圖片文件
- **分類整理**: 按功能分類管理圖片
- **備份策略**: 定期備份重要圖片

### 3. 性能優化
- **圖片壓縮**: 自動壓縮大圖片
- **緩存策略**: 實施圖片緩存機制
- **CDN 整合**: 考慮使用 CDN 加速
- **存儲優化**: 定期清理無用圖片

## 故障排除

### 常見問題

#### 1. 圖片上傳失敗
- 檢查文件格式是否支援
- 確認文件大小是否超限
- 檢查存儲目錄權限
- 查看服務器錯誤日誌

#### 2. 內容保存失敗
- 檢查資料庫連線
- 確認用戶權限
- 驗證內容格式
- 查看 API 錯誤信息

#### 3. 圖片顯示異常
- 檢查圖片文件是否存在
- 確認 URL 路徑正確
- 檢查文件權限設定
- 驗證圖片格式支援

### 錯誤代碼
- `400`: 請求參數錯誤
- `401`: 權限不足
- `404`: 資源不存在
- `413`: 文件過大
- `415`: 文件格式不支援
- `500`: 服務器內部錯誤

## 擴展功能

### 計劃功能
- **模板系統**: 預設內容模板
- **多語言支援**: 國際化內容管理
- **版本歷史**: 內容變更歷史記錄
- **批量操作**: 批量編輯和導入
- **SEO 優化**: 搜索引擎優化設定
- **分析統計**: 內容訪問統計

### 技術改進
- **圖片處理**: 更多圖片格式支援
- **存儲優化**: 雲端存儲整合
- **性能提升**: 圖片懶加載和預加載
- **安全增強**: 更嚴格的安全驗證

## 聯繫支援

如果您在使用過程中遇到問題，請：
1. 查看本使用指南
2. 檢查系統日誌
3. 聯繫技術支援團隊
4. 提交問題報告

---

*本指南會持續更新，請關注最新版本。* 