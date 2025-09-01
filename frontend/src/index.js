import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 應用緊急表格修復
import { applyEmergencyTableFixes } from './utils/emergencyTableFix';

// 在應用啟動前應用緊急修復
applyEmergencyTableFixes();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 