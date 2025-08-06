#!/usr/bin/env python3
"""
預設資料庫連線初始化腳本
用於在平台啟動時自動創建預設的資料庫連線
"""

import sys
import os
import asyncio
import requests
from typing import Dict, List

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database_config import get_default_connections, get_auto_initialize_databases

def create_default_connections():
    """創建預設的資料庫連線"""
    try:
        # 獲取預設資料庫連線配置
        default_connections = get_default_connections()
        
        print("正在創建預設資料庫連線...")
        
        # API 基礎 URL
        base_url = "http://localhost:8000/api/v1"
        
        created_connections = []
        failed_connections = []
        
        for db_type, connection_config in default_connections.items():
            try:
                print(f"正在創建 {db_type} 連線...")
                
                # 準備連線數據
                connection_data = {
                    "name": connection_config["name"],
                    "db_type": connection_config["db_type"],
                    "host": connection_config["host"],
                    "port": connection_config["port"],
                    "database": connection_config["database"],
                    "username": connection_config["username"],
                    "password": connection_config["password"],
                    "description": connection_config["description"],
                    "is_active": True
                }
                
                # 發送創建請求
                response = requests.post(
                    f"{base_url}/database-connections/",
                    json=connection_data,
                    timeout=10
                )
                
                if response.status_code == 200 or response.status_code == 201:
                    result = response.json()
                    created_connections.append({
                        "db_type": db_type,
                        "connection_id": result.get("id"),
                        "name": connection_config["name"]
                    })
                    print(f"✓ {db_type} 連線創建成功")
                else:
                    failed_connections.append({
                        "db_type": db_type,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    })
                    print(f"✗ {db_type} 連線創建失敗: {response.text}")
                    
            except requests.exceptions.RequestException as e:
                failed_connections.append({
                    "db_type": db_type,
                    "error": f"網路錯誤: {str(e)}"
                })
                print(f"✗ {db_type} 連線創建失敗: {str(e)}")
            except Exception as e:
                failed_connections.append({
                    "db_type": db_type,
                    "error": f"未知錯誤: {str(e)}"
                })
                print(f"✗ {db_type} 連線創建失敗: {str(e)}")
        
        # 顯示結果摘要
        print("\n" + "="*50)
        print("預設資料庫連線創建結果:")
        print("="*50)
        
        if created_connections:
            print(f"\n✓ 成功創建 {len(created_connections)} 個連線:")
            for conn in created_connections:
                print(f"  - {conn['name']} (ID: {conn['connection_id']})")
        
        if failed_connections:
            print(f"\n✗ 失敗 {len(failed_connections)} 個連線:")
            for conn in failed_connections:
                print(f"  - {conn['db_type']}: {conn['error']}")
        
        return created_connections, failed_connections
        
    except Exception as e:
        print(f"初始化過程發生錯誤: {str(e)}")
        return [], []

def test_default_connections():
    """測試預設的資料庫連線"""
    try:
        print("\n正在測試預設資料庫連線...")
        
        # API 基礎 URL
        base_url = "http://localhost:8000/api/v1"
        
        # 獲取所有資料庫連線
        response = requests.get(f"{base_url}/database-connections/", timeout=10)
        
        if response.status_code != 200:
            print(f"無法獲取資料庫連線列表: {response.text}")
            return
        
        connections = response.json()
        
        if not connections:
            print("沒有找到任何資料庫連線")
            return
        
        print(f"找到 {len(connections)} 個資料庫連線，正在測試...")
        
        test_results = []
        
        for connection in connections:
            try:
                connection_id = connection["id"]
                db_type = connection["db_type"]
                name = connection["name"]
                
                print(f"正在測試 {name} ({db_type})...")
                
                # 測試連線
                test_response = requests.post(
                    f"{base_url}/database-connections/{connection_id}/test",
                    timeout=10
                )
                
                if test_response.status_code == 200:
                    result = test_response.json()
                    if result.get("success"):
                        test_results.append({
                            "name": name,
                            "db_type": db_type,
                            "status": "success",
                            "message": result.get("message", "連線正常")
                        })
                        print(f"✓ {name} 測試成功")
                    else:
                        test_results.append({
                            "name": name,
                            "db_type": db_type,
                            "status": "error",
                            "message": result.get("message", "連線失敗")
                        })
                        print(f"✗ {name} 測試失敗: {result.get('message')}")
                else:
                    test_results.append({
                        "name": name,
                        "db_type": db_type,
                        "status": "error",
                        "message": f"測試請求失敗: HTTP {test_response.status_code}"
                    })
                    print(f"✗ {name} 測試失敗: HTTP {test_response.status_code}")
                    
            except Exception as e:
                test_results.append({
                    "name": connection.get("name", "未知"),
                    "db_type": connection.get("db_type", "未知"),
                    "status": "error",
                    "message": f"測試異常: {str(e)}"
                })
                print(f"✗ {connection.get('name', '未知')} 測試異常: {str(e)}")
        
        # 顯示測試結果摘要
        print("\n" + "="*50)
        print("資料庫連線測試結果:")
        print("="*50)
        
        success_count = len([r for r in test_results if r["status"] == "success"])
        error_count = len([r for r in test_results if r["status"] == "error"])
        
        print(f"\n✓ 成功: {success_count} 個")
        print(f"✗ 失敗: {error_count} 個")
        
        if test_results:
            print("\n詳細結果:")
            for result in test_results:
                status_icon = "✓" if result["status"] == "success" else "✗"
                print(f"  {status_icon} {result['name']} ({result['db_type']}): {result['message']}")
        
        return test_results
        
    except Exception as e:
        print(f"測試過程發生錯誤: {str(e)}")
        return []

def initialize_databases():
    """初始化資料庫"""
    try:
        print("\n正在初始化資料庫...")
        
        # 獲取需要自動初始化的資料庫類型
        auto_init_dbs = get_auto_initialize_databases()
        
        if not auto_init_dbs:
            print("沒有需要自動初始化的資料庫")
            return
        
        # 準備初始化數據
        init_data = {}
        for db_type in auto_init_dbs:
            init_data[db_type] = True
        
        # API 基礎 URL
        base_url = "http://localhost:8000/api/v1"
        
        # 發送初始化請求
        response = requests.post(
            f"{base_url}/database-connections/initialize",
            json=init_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✓ 資料庫初始化成功")
                data = result.get("data", {})
                for db_type, db_result in data.items():
                    if db_result.get("success"):
                        print(f"  ✓ {db_type}: {db_result.get('message')}")
                    else:
                        print(f"  ✗ {db_type}: {db_result.get('message')}")
            else:
                print(f"✗ 資料庫初始化失敗: {result.get('message')}")
        else:
            print(f"✗ 初始化請求失敗: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"初始化過程發生錯誤: {str(e)}")

def main():
    """主函數"""
    print("="*60)
    print("IIPlatform 預設資料庫連線初始化工具")
    print("="*60)
    
    try:
        # 檢查 API 服務是否運行
        print("檢查 API 服務狀態...")
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✓ API 服務運行正常")
            else:
                print("✗ API 服務響應異常")
                return
        except requests.exceptions.RequestException:
            print("✗ 無法連接到 API 服務，請確保後端服務正在運行")
            return
        
        # 創建預設連線
        created, failed = create_default_connections()
        
        # 測試連線
        test_results = test_default_connections()
        
        # 初始化資料庫
        initialize_databases()
        
        print("\n" + "="*60)
        print("初始化完成！")
        print("="*60)
        
        if created:
            print(f"成功創建 {len(created)} 個預設資料庫連線")
        if failed:
            print(f"失敗 {len(failed)} 個連線創建")
        
        print("\n現在可以使用以下憑證登入平台:")
        print("用戶名: admin")
        print("密碼: admin123")
        
    except KeyboardInterrupt:
        print("\n\n初始化過程被用戶中斷")
    except Exception as e:
        print(f"\n初始化過程發生錯誤: {str(e)}")

if __name__ == "__main__":
    main() 