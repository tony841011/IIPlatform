import React, { useState, useEffect } from 'react';
import { Select, Card, Row, Col, Statistic, Alert, Progress } from 'antd';
import { RobotOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const AIAnalysis = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      loadAIResult();
    }
  }, [selectedDevice]);

  const loadDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/devices/');
      setDevices(response.data);
    } catch (error) {
      console.error('載入設備失敗:', error);
    }
  };

  const loadAIResult = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/ai/anomaly/?device_id=${selectedDevice}`);
      setAiResult(response.data);
    } catch (error) {
      console.error('載入 AI 分析失敗:', error);
    }
  };

  const getAnomalyLevel = (score) => {
    if (score < 1) return { level: 'normal', color: '#52c41a', text: '正常' };
    if (score < 2) return { level: 'warning', color: '#faad14', text: '輕微異常' };
    if (score < 3) return { level: 'error', color: '#ff4d4f', text: '異常' };
    return { level: 'critical', color: '#cf1322', text: '嚴重異常' };
  };

  return (
    <div>
      <h2>AI 異常偵測</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="選擇設備進行 AI 分析"
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

      {aiResult && (
        <>
          {/* AI 分析結果 */}
          <Card title="AI 分析結果" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="異常分數"
                  value={aiResult.score.toFixed(2)}
                  prefix={<RobotOutlined />}
                  valueStyle={{ 
                    color: getAnomalyLevel(aiResult.score).color,
                    fontSize: '24px'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="最新數值"
                  value={aiResult.latest.toFixed(2)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="平均值"
                  value={aiResult.mean.toFixed(2)}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <Alert
                message={aiResult.advice}
                type={getAnomalyLevel(aiResult.score).level}
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 16 }}
              />

              <div style={{ marginTop: 16 }}>
                <h4>異常程度</h4>
                <Progress
                  percent={Math.min(aiResult.score * 25, 100)}
                  strokeColor={getAnomalyLevel(aiResult.score).color}
                  format={() => getAnomalyLevel(aiResult.score).text}
                />
              </div>
            </div>
          </Card>

          {/* 詳細統計 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="統計資訊">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="標準差"
                      value={aiResult.std.toFixed(2)}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="變異係數"
                      value={((aiResult.std / aiResult.mean) * 100).toFixed(2)}
                      suffix="%"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="AI 建議">
                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 6 }}>
                  <p><strong>分析結果：</strong></p>
                  <ul>
                    <li>異常分數：{aiResult.score.toFixed(2)}</li>
                    <li>建議：{aiResult.advice}</li>
                    <li>當前數值：{aiResult.latest.toFixed(2)}</li>
                    <li>歷史平均：{aiResult.mean.toFixed(2)}</li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AIAnalysis; 