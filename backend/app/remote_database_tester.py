#!/usr/bin/env python3
"""
遠端資料庫連線測試工具
"""

import time
import asyncio
from typing import Dict, Any, Optional
from urllib.parse import quote_plus
import logging

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RemoteDatabaseTester:
    """遠端資料庫連線測試器"""
    
    def __init__(self):
        self.test_results = {}
    
    async def test_connection(self, connection_config: Dict[str, Any]) -> Dict[str, Any]:
        """測試資料庫連線"""
        db_type = connection_config.get("db_type")
        start_time = time.time()
        
        try:
            if db_type == "postgresql":
                result = await self._test_postgresql(connection_config)
            elif db_type == "mysql":
                result = await self._test_mysql(connection_config)
            elif db_type == "mongodb":
                result = await self._test_mongodb(connection_config)
            elif db_type == "influxdb":
                result = await self._test_influxdb(connection_config)
            elif db_type == "oracle":
                result = await self._test_oracle(connection_config)
            elif db_type == "sqlserver":
                result = await self._test_sqlserver(connection_config)
            else:
                result = {
                    "success": False,
                    "message": f"不支援的資料庫類型: {db_type}",
                    "error": "Unsupported database type"
                }
            
            # 計算響應時間
            response_time = (time.time() - start_time) * 1000
            result["response_time"] = response_time
            
            return result
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                "success": False,
                "message": "連線測試失敗",
                "error": str(e),
                "response_time": response_time
            }
    
    async def _test_postgresql(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 PostgreSQL 連線"""
        try:
            import psycopg2
            from psycopg2 import OperationalError
            
            # 構建連線字串
            username = quote_plus(config.get("username", ""))
            password = quote_plus(config.get("password", ""))
            host = config.get("host")
            port = config.get("port", 5432)
            database = config.get("database")
            
            connection_string = f"postgresql://{username}:{password}@{host}:{port}/{database}"
            
            # 測試連線
            conn = psycopg2.connect(connection_string, connect_timeout=10)
            conn.close()
            
            return {
                "success": True,
                "message": "PostgreSQL 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "database": database
                }
            }
            
        except OperationalError as e:
            return {
                "success": False,
                "message": "PostgreSQL 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "PostgreSQL 驅動程式未安裝",
                "error": "psycopg2 not installed"
            }
    
    async def _test_mysql(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 MySQL 連線"""
        try:
            import mysql.connector
            from mysql.connector import Error
            
            host = config.get("host")
            port = config.get("port", 3306)
            database = config.get("database")
            username = config.get("username")
            password = config.get("password")
            
            # 測試連線
            conn = mysql.connector.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                database=database,
                connection_timeout=10
            )
            conn.close()
            
            return {
                "success": True,
                "message": "MySQL 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "database": database
                }
            }
            
        except Error as e:
            return {
                "success": False,
                "message": "MySQL 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "MySQL 驅動程式未安裝",
                "error": "mysql-connector-python not installed"
            }
    
    async def _test_mongodb(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 MongoDB 連線"""
        try:
            from pymongo import MongoClient
            from pymongo.errors import ConnectionFailure
            
            host = config.get("host")
            port = config.get("port", 27017)
            database = config.get("database")
            username = config.get("username")
            password = config.get("password")
            
            # 構建連線字串
            auth_part = ""
            if username and password:
                encoded_username = quote_plus(username)
                encoded_password = quote_plus(password)
                auth_part = f"{encoded_username}:{encoded_password}@"
            
            connection_string = f"mongodb://{auth_part}{host}:{port}/{database}"
            
            # 添加 MongoDB 特定參數
            params = {}
            if config.get("auth_source"):
                params["authSource"] = config["auth_source"]
            if config.get("auth_mechanism"):
                params["authMechanism"] = config["auth_mechanism"]
            if config.get("replica_set"):
                params["replicaSet"] = config["replica_set"]
            if config.get("ssl_enabled"):
                params["ssl"] = True
            
            # 測試連線
            client = MongoClient(connection_string, serverSelectionTimeoutMS=10000, **params)
            client.admin.command('ping')
            client.close()
            
            return {
                "success": True,
                "message": "MongoDB 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "database": database,
                    "auth_source": config.get("auth_source"),
                    "replica_set": config.get("replica_set")
                }
            }
            
        except ConnectionFailure as e:
            return {
                "success": False,
                "message": "MongoDB 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "MongoDB 驅動程式未安裝",
                "error": "pymongo not installed"
            }
    
    async def _test_influxdb(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 InfluxDB 連線"""
        try:
            from influxdb_client import InfluxDBClient
            
            host = config.get("host")
            port = config.get("port", 8086)
            token = config.get("token", "")
            org = config.get("org", "IIPlatform")
            bucket = config.get("bucket", "iot_platform")
            
            url = f"http://{host}:{port}"
            
            # 測試連線
            client = InfluxDBClient(url=url, token=token, org=org, timeout=10000)
            health = client.health()
            client.close()
            
            return {
                "success": True,
                "message": "InfluxDB 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "org": org,
                    "bucket": bucket
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": "InfluxDB 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "InfluxDB 驅動程式未安裝",
                "error": "influxdb-client not installed"
            }
    
    async def _test_oracle(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 Oracle 連線"""
        try:
            import cx_Oracle
            
            host = config.get("host")
            port = config.get("port", 1521)
            database = config.get("database")
            username = config.get("username")
            password = config.get("password")
            service_name = config.get("service_name")
            sid = config.get("sid")
            
            # 構建連線字串
            if service_name:
                dsn = f"{host}:{port}/{service_name}"
            elif sid:
                dsn = f"{host}:{port}:{sid}"
            else:
                dsn = f"{host}:{port}/{database}"
            
            # 測試連線
            conn = cx_Oracle.connect(username, password, dsn)
            conn.close()
            
            return {
                "success": True,
                "message": "Oracle 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "database": database,
                    "service_name": service_name,
                    "sid": sid
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": "Oracle 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "Oracle 驅動程式未安裝",
                "error": "cx_Oracle not installed"
            }
    
    async def _test_sqlserver(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """測試 SQL Server 連線"""
        try:
            import pyodbc
            
            host = config.get("host")
            port = config.get("port", 1433)
            database = config.get("database")
            username = config.get("username")
            password = config.get("password")
            driver = config.get("driver", "ODBC Driver 17 for SQL Server")
            
            # 構建連線字串
            connection_string = f"DRIVER={{{driver}}};SERVER={host},{port};DATABASE={database};UID={username};PWD={password}"
            
            # 測試連線
            conn = pyodbc.connect(connection_string, timeout=10)
            conn.close()
            
            return {
                "success": True,
                "message": "SQL Server 連線成功",
                "details": {
                    "host": host,
                    "port": port,
                    "database": database,
                    "driver": driver
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": "SQL Server 連線失敗",
                "error": str(e)
            }
        except ImportError:
            return {
                "success": False,
                "message": "SQL Server 驅動程式未安裝",
                "error": "pyodbc not installed"
            }
    
    def get_connection_info(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """獲取連線資訊摘要"""
        return {
            "db_type": config.get("db_type"),
            "host": config.get("host"),
            "port": config.get("port"),
            "database": config.get("database"),
            "username": config.get("username"),
            "ssl_enabled": config.get("ssl_enabled", False),
            "timeout": config.get("timeout", 30),
            "retry_attempts": config.get("retry_attempts", 3)
        }
    
    def validate_connection_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """驗證連線配置"""
        errors = []
        
        # 基本欄位驗證
        if not config.get("name"):
            errors.append("連線名稱為必填項")
        if not config.get("db_type"):
            errors.append("資料庫類型為必填項")
        if not config.get("host"):
            errors.append("主機地址為必填項")
        if not config.get("database"):
            errors.append("資料庫名稱為必填項")
        
        # 埠號驗證
        port = config.get("port")
        if port and (port < 1 or port > 65535):
            errors.append("埠號必須在 1-65535 範圍內")
        
        # 資料庫類型特定驗證
        db_type = config.get("db_type")
        if db_type == "mongodb":
            if config.get("ssl_enabled") and not config.get("ssl_cert_reqs"):
                errors.append("啟用 SSL 時必須指定憑證要求")
        
        if db_type == "influxdb":
            if not config.get("token"):
                errors.append("InfluxDB 需要 API Token")
            if not config.get("org"):
                errors.append("InfluxDB 需要組織名稱")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

# 使用範例
async def main():
    """測試範例"""
    tester = RemoteDatabaseTester()
    
    # PostgreSQL 測試配置
    postgres_config = {
        "name": "遠端 PostgreSQL",
        "db_type": "postgresql",
        "host": "192.168.1.100",
        "port": 5432,
        "database": "iot_platform",
        "username": "iot_user",
        "password": "iot_password_2024"
    }
    
    # MongoDB 測試配置
    mongo_config = {
        "name": "遠端 MongoDB",
        "db_type": "mongodb",
        "host": "192.168.1.101",
        "port": 27017,
        "database": "iot_platform",
        "username": "iot_user",
        "password": "iot_password_2024",
        "auth_source": "admin",
        "ssl_enabled": False
    }
    
    # InfluxDB 測試配置
    influx_config = {
        "name": "遠端 InfluxDB",
        "db_type": "influxdb",
        "host": "192.168.1.102",
        "port": 8086,
        "token": "your-influxdb-token",
        "org": "IIPlatform",
        "bucket": "iot_platform"
    }
    
    # 測試連線
    configs = [postgres_config, mongo_config, influx_config]
    
    for config in configs:
        print(f"\n測試 {config['name']}...")
        
        # 驗證配置
        validation = tester.validate_connection_config(config)
        if not validation["valid"]:
            print(f"配置驗證失敗: {validation['errors']}")
            continue
        
        # 測試連線
        result = await tester.test_connection(config)
        
        if result["success"]:
            print(f"✅ {result['message']}")
            print(f"   響應時間: {result['response_time']:.2f}ms")
        else:
            print(f"❌ {result['message']}")
            print(f"   錯誤: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main()) 