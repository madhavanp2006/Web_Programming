import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ConfigProvider } from 'antd'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6B21A8',
          borderRadius: 14,
          colorTextBase: '#1E1535',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
