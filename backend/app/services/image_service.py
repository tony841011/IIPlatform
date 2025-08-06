import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image as PILImage
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ImageService:
    """圖片上傳和存儲服務"""
    
    def __init__(self, base_path: str = "uploads/images"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # 創建子目錄
        self.categories = {
            'architecture': self.base_path / 'architecture',
            'interface': self.base_path / 'interface',
            'demo': self.base_path / 'demo',
            'other': self.base_path / 'other'
        }
        
        for category_path in self.categories.values():
            category_path.mkdir(exist_ok=True)
    
    def save_image(self, file, category: str = 'other', max_size: Tuple[int, int] = (1920, 1080)) -> dict:
        """
        保存上傳的圖片
        
        Args:
            file: 上傳的文件對象
            category: 圖片分類
            max_size: 最大尺寸 (寬度, 高度)
            
        Returns:
            dict: 包含圖片信息的字典
        """
        try:
            # 生成唯一檔案名
            original_filename = file.filename
            file_extension = Path(original_filename).suffix.lower()
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # 確定保存路徑
            category_path = self.categories.get(category, self.categories['other'])
            file_path = category_path / unique_filename
            
            # 保存原始文件
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # 獲取文件信息
            file_size = file_path.stat().st_size
            
            # 處理圖片（調整大小、獲取尺寸等）
            image_info = self._process_image(file_path, max_size)
            
            return {
                'filename': unique_filename,
                'original_filename': original_filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'file_type': file.content_type,
                'width': image_info['width'],
                'height': image_info['height'],
                'category': category
            }
            
        except Exception as e:
            logger.error(f"保存圖片失敗: {str(e)}")
            raise
    
    def _process_image(self, file_path: Path, max_size: Tuple[int, int]) -> dict:
        """
        處理圖片：調整大小、獲取尺寸等
        
        Args:
            file_path: 圖片文件路徑
            max_size: 最大尺寸
            
        Returns:
            dict: 圖片信息
        """
        try:
            with PILImage.open(file_path) as img:
                # 獲取原始尺寸
                original_width, original_height = img.size
                
                # 檢查是否需要調整大小
                if original_width > max_size[0] or original_height > max_size[1]:
                    # 計算新的尺寸，保持寬高比
                    ratio = min(max_size[0] / original_width, max_size[1] / original_height)
                    new_width = int(original_width * ratio)
                    new_height = int(original_height * ratio)
                    
                    # 調整大小
                    img = img.resize((new_width, new_height), PILImage.Resampling.LANCZOS)
                    
                    # 保存調整後的圖片
                    img.save(file_path, quality=85, optimize=True)
                    
                    return {
                        'width': new_width,
                        'height': new_height
                    }
                else:
                    return {
                        'width': original_width,
                        'height': original_height
                    }
                    
        except Exception as e:
            logger.error(f"處理圖片失敗: {str(e)}")
            # 如果處理失敗，返回默認值
            return {
                'width': 0,
                'height': 0
            }
    
    def delete_image(self, file_path: str) -> bool:
        """
        刪除圖片文件
        
        Args:
            file_path: 圖片文件路徑
            
        Returns:
            bool: 是否刪除成功
        """
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"刪除圖片失敗: {str(e)}")
            return False
    
    def get_image_url(self, filename: str, category: str = 'other') -> str:
        """
        獲取圖片的 URL
        
        Args:
            filename: 文件名
            category: 分類
            
        Returns:
            str: 圖片 URL
        """
        return f"/api/images/{category}/{filename}"
    
    def get_storage_info(self) -> dict:
        """
        獲取存儲信息
        
        Returns:
            dict: 存儲信息
        """
        info = {
            'base_path': str(self.base_path),
            'categories': {},
            'total_size': 0,
            'total_files': 0
        }
        
        for category, category_path in self.categories.items():
            category_size = 0
            category_files = 0
            
            for file_path in category_path.glob('*'):
                if file_path.is_file():
                    category_size += file_path.stat().st_size
                    category_files += 1
            
            info['categories'][category] = {
                'path': str(category_path),
                'size': category_size,
                'files': category_files
            }
            info['total_size'] += category_size
            info['total_files'] += category_files
        
        return info
    
    def cleanup_orphaned_files(self) -> dict:
        """
        清理孤立的文件（資料庫中不存在但文件系統中存在的文件）
        
        Returns:
            dict: 清理結果
        """
        # 這個方法需要與資料庫配合使用
        # 這裡只是示例實現
        result = {
            'deleted_files': 0,
            'deleted_size': 0,
            'errors': []
        }
        
        # 實際實現時需要從資料庫獲取有效的文件列表
        # 然後刪除不在列表中的文件
        
        return result

# 創建全局實例
image_service = ImageService() 