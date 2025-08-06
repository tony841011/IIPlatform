import React from 'react';
import { Card, Empty } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, config = {} }) => {
  if (!data || !data.labels || !data.datasets) {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="無數據" />
      </Card>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || '#1890ff',
      borderColor: dataset.borderColor || '#1890ff',
      borderWidth: 1,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: config.showLegend !== false,
        position: 'top',
      },
      title: {
        display: !!config.title,
        text: config.title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: config.showGrid !== false,
        },
      },
      x: {
        grid: {
          display: config.showGrid !== false,
        },
      },
    },
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart; 