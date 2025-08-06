import asyncio
from asyncua import Client
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class OPCUAHandler:
    def __init__(self, server_url="opc.tcp://localhost:4840"):
        self.server_url = server_url
        self.client = None
        
    async def connect(self):
        """連接到 OPC UA 伺服器"""
        try:
            self.client = Client(url=self.server_url)
            await self.client.connect()
            logger.info(f"OPC UA 連線成功: {self.server_url}")
            return True
        except Exception as e:
            logger.error(f"OPC UA 連線失敗: {str(e)}")
            return False
    
    async def disconnect(self):
        """斷開 OPC UA 連線"""
        if self.client:
            await self.client.disconnect()
            logger.info("OPC UA 連線已斷開")
    
    async def read_node(self, node_id):
        """讀取節點值"""
        try:
            if self.client:
                node = self.client.get_node(node_id)
                value = await node.read_value()
                logger.info(f"讀取節點成功: {node_id} = {value}")
                return value
            else:
                logger.error("OPC UA 客戶端未連線")
                return None
        except Exception as e:
            logger.error(f"讀取節點失敗: {str(e)}")
            return None
    
    async def write_node(self, node_id, value):
        """寫入節點值"""
        try:
            if self.client:
                node = self.client.get_node(node_id)
                await node.write_value(value)
                logger.info(f"寫入節點成功: {node_id} = {value}")
                return True
            else:
                logger.error("OPC UA 客戶端未連線")
                return False
        except Exception as e:
            logger.error(f"寫入節點失敗: {str(e)}")
            return False
    
    async def browse_nodes(self, node_id="i=84"):
        """瀏覽節點"""
        try:
            if self.client:
                node = self.client.get_node(node_id)
                children = await node.get_children()
                logger.info(f"瀏覽節點成功: {node_id}")
                return children
            else:
                logger.error("OPC UA 客戶端未連線")
                return []
        except Exception as e:
            logger.error(f"瀏覽節點失敗: {str(e)}")
            return [] 