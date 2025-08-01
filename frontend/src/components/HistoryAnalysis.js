import React, { useState, useEffect, useRef } from 'react';
import { Select, Card, Row, Col, Statistic } from 'antd';
import { LineChartOutlined, RiseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import axios from 'axios';

const HistoryAnalysis = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    avgValue: 0,
    maxValue: 0,
    minValue: 0,
    dataPoints: 0
  });
  const chartRef = useRef(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      loadHistory();
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (history.length > 0 && chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const option = {
        title: { text: '歷史數據趨勢', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['數值'], top: 30 },
        xAxis: { 
          type: 'category', 
          data: history.map(h => new Date(h.timestamp).toLocaleString()),
          axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        series: [{
          name: '數值',
          data: history.map(h => h.value),
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          }
        }]
      };
      chart.setOption(option);
    }
  }, [history]);

  const loadDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      console.error('載入設備失敗:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/history/?device_id=${selectedDevice}`);
      const data = response.data.reverse();
      setHistory(data);
      
      if (data.length > 0) {
        const values = data.map(h => h.value);
        setStats({
          avgValue: values.reduce((a, b) => a + b, 0) / values.length,
          maxValue: Math.max(...values),
          minValue: Math.min(...values),
          dataPoints: data.length
        });
      }
    } catch (error) {
      console.error('載入歷史資料失敗:', error);
    }
  };

  return (
    <div>
      <h2>歷史分析</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="選擇設備"
          style={{ width: 300 }}
          onChange={setSelectedDevice}
          value={selectedDevice}
        >
          {devices.map(device => (
            <Select.Option key={device.id} value={device.id}>
              {device.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {selectedDevice && (
        <>
          {/* 統計卡片 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均數值"
                  value={stats.avgValue.toFixed(2)}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="最大值"
                  value={stats.maxValue.toFixed(2)}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="最小值"
                  value={stats.minValue.toFixed(2)}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="資料點數"
                  value={stats.dataPoints}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 歷史圖表 */}
          <Card title="歷史趨勢圖" className="chart-container">
            <div ref={chartRef} style={{ height: 400 }} />
          </Card>
        </>
      )}
    </div>
  );
};

export default HistoryAnalysis; 