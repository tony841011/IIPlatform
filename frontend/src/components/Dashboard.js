import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";

function Dashboard() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [popup, setPopup] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [groups, setGroups] = useState([]);
  const [editDevice, setEditDevice] = useState(null);
  const [editTags, setEditTags] = useState("");
  const [editGroup, setEditGroup] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/devices/").then((res) => {
      setData(res.data);
    });
    axios.get("http://localhost:8000/groups/").then((res) => {
      setGroups(res.data);
    });
    // WebSocket 連線
    const ws = new WebSocket("ws://localhost:8000/ws/data");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "alert") {
        setPopup(msg);
        setAlerts((prev) => [msg, ...prev]);
        setTimeout(() => setPopup(null), 5000);
      } else {
        setData((prev) => {
          // 依 device_id 更新對應資料
          const idx = prev.findIndex((d) => d.id === msg.device_id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: msg.value, timestamp: msg.timestamp };
            return updated;
          }
          return prev;
        });
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (selected) {
      axios.get(`http://localhost:8000/history/?device_id=${selected}`).then((res) => {
        setHistory(res.data.reverse());
      });
      axios.get(`http://localhost:8000/ai/anomaly/?device_id=${selected}`).then((res) => {
        setAiResult(res.data);
      });
    }
  }, [selected]);

  useEffect(() => {
    if (data.length > 0) {
      const chart = echarts.init(chartRef.current);
      const option = {
        title: { text: "設備清單" },
        tooltip: {},
        xAxis: { type: "category", data: data.map((d) => d.name) },
        yAxis: { type: "value" },
        series: [
          {
            data: data.map((d) => d.value || Math.random() * 100), // 若有即時值則顯示
            type: "bar",
          },
        ],
      };
      chart.setOption(option);
    }
  }, [data]);

  // 歷史折線圖
  const historyChartRef = useRef(null);
  useEffect(() => {
    if (history.length > 0) {
      const chart = echarts.init(historyChartRef.current);
      const option = {
        title: { text: "歷史數據" },
        tooltip: {},
        xAxis: { type: "category", data: history.map((h) => h.timestamp) },
        yAxis: { type: "value" },
        series: [
          {
            data: history.map((h) => h.value),
            type: "line",
          },
        ],
      };
      chart.setOption(option);
    }
  }, [history]);

  return (
    <>
      {popup && (
        <div style={{position:'fixed',top:20,right:20,background:'#ffcccc',padding:20,zIndex:1000}}>
          <b>告警！</b><br/>
          設備ID: {popup.device_id}<br/>
          數值: {popup.value}<br/>
          時間: {popup.timestamp}<br/>
          訊息: {popup.message}
        </div>
      )}
      <div ref={chartRef} style={{ width: 600, height: 400 }} />
      <div>
        <label>選擇設備：</label>
        <select onChange={e => setSelected(e.target.value)} value={selected || ""}>
          <option value="">請選擇</option>
          {data.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {selected && (
          <button onClick={() => {
            const dev = data.find(d => d.id == selected);
            setEditDevice(dev);
            setEditTags(dev.tags || "");
            setEditGroup(dev.group || "");
          }}>編輯分群/標籤</button>
        )}
      </div>
      {editDevice && (
        <div style={{background:'#f0f0f0',padding:10,margin:'10px 0'}}>
          <b>編輯設備分群/標籤</b><br/>
          <label>分群：</label>
          <select value={editGroup} onChange={e=>setEditGroup(e.target.value)}>
            <option value="">無</option>
            {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select><br/>
          <label>標籤：</label>
          <input value={editTags} onChange={e=>setEditTags(e.target.value)} />
          <button onClick={async()=>{
            await axios.patch(`http://localhost:8000/devices/${editDevice.id}`,{group:editGroup?parseInt(editGroup):null,tags:editTags});
            setEditDevice(null);
            setSelected(editDevice.id);
            axios.get("http://localhost:8000/devices/").then((res) => { setData(res.data); });
          }}>儲存</button>
          <button onClick={()=>setEditDevice(null)}>取消</button>
        </div>
      )}
      <div>
        <b>分群：</b>{data.find(d=>d.id==selected)?.group || "無"} <b>標籤：</b>{data.find(d=>d.id==selected)?.tags || ""}
      </div>
      <div ref={historyChartRef} style={{ width: 600, height: 300, marginTop: 20 }} />
      {aiResult && (
        <div style={{marginTop:10,padding:10,background:'#e0f7fa'}}>
          <b>AI 異常偵測</b><br/>
          異常分數: {aiResult.score.toFixed(2)}<br/>
          建議: {aiResult.advice}<br/>
          平均值: {aiResult.mean.toFixed(2)} 標準差: {aiResult.std.toFixed(2)}<br/>
          最新數值: {aiResult.latest.toFixed(2)}
        </div>
      )}
      <h2>告警紀錄</h2>
      <ul>
        {alerts.map((a, i) => (
          <li key={i} style={{color:'red'}}>
            [{a.timestamp}] 設備ID:{a.device_id} 數值:{a.value} 訊息:{a.message}
          </li>
        ))}
      </ul>
    </>
  );
}

export default Dashboard; 