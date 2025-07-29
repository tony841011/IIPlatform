import paho.mqtt.client as mqtt
import time
import random
import requests

BROKER = "localhost"
PORT = 1883
TOPIC = "factory/device/data"

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    print(f"Received: {msg.topic} {msg.payload}")
    # 可將資料轉發到 FastAPI
    # requests.post("http://localhost:8000/data/", json=...)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)

# 模擬設備資料上傳
while True:
    value = random.uniform(20, 100)
    payload = f'{{"device_id": 1, "value": {value}}}'
    client.publish(TOPIC, payload)
    print(f"Sent: {payload}")
    time.sleep(5) 