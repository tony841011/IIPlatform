#!/usr/bin/env python3
"""
IIPlatform 啟動腳本
包含預設資料庫連線初始化功能
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_api_health():
    """檢查 API 健康狀態"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def wait_for_api():
    """等待 API 服務啟動"""
    print("等待 API 服務啟動...")
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        if check_api_health():
            print("✓ API 服務已啟動")
            return True
        attempt += 1
        print(f"等待中... ({attempt}/{max_attempts})")
        time.sleep(2)
    
    print("✗ API 服務啟動超時")
    return False

def run_initialization():
    """執行初始化腳本"""
    try:
        print("執行預設資料庫連線初始化...")
        
        # 執行初始化腳本
        init_script = Path(__file__).parent / "init_default_connections.py"
        if init_script.exists():
            result = subprocess.run([sys.executable, str(init_script)], 
                                  capture_output=True, text=True)
            print(result.stdout)
            if result.stderr:
                print("錯誤:", result.stderr)
            return result.returncode == 0
        else:
            print("初始化腳本不存在")
            return False
    except Exception as e:
        print(f"初始化過程發生錯誤: {str(e)}")
        return False

def start_platform():
    """啟動平台"""
    try:
        print("="*60)
        print("IIPlatform 平台啟動")
        print("="*60)
        
        # 檢查是否在正確的目錄
        if not os.path.exists("app"):
            print("錯誤: 請在 backend 目錄下執行此腳本")
            return
        
        # 啟動 FastAPI 服務
        print("啟動 FastAPI 服務...")
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ])
        
        # 等待 API 服務啟動
        if wait_for_api():
            # 執行初始化
            if run_initialization():
                print("\n✓ 平台啟動完成，初始化成功！")
            else:
                print("\n⚠ 平台啟動完成，但初始化過程有問題")
        else:
            print("\n✗ 平台啟動失敗")
            process.terminate()
            return
        
        print("\n平台已啟動，可以訪問:")
        print("- 前端: http://localhost:3000")
        print("- API 文檔: http://localhost:8000/docs")
        print("- 健康檢查: http://localhost:8000/health")
        
        try:
            # 保持服務運行
            process.wait()
        except KeyboardInterrupt:
            print("\n正在關閉平台...")
            process.terminate()
            process.wait()
            print("平台已關閉")
            
    except Exception as e:
        print(f"啟動過程發生錯誤: {str(e)}")

if __name__ == "__main__":
    start_platform() 