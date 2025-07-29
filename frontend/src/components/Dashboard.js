import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";

function Dashboard() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/devices/").then((res) => {
      setData(res.data);
    });
  }, []);

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
            data: data.map((d) => Math.random() * 100), // 假資料
            type: "bar",
          },
        ],
      };
      chart.setOption(option);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: 600, height: 400 }} />;
}

export default Dashboard; 