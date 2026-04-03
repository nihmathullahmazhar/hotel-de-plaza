import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import MenuPage from './MenuPage'
import AdminApp from './AdminApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<App />} />
        <Route path="/menu"    element={<MenuPage />} />
        <Route path="/admin"   element={<AdminApp />} />
        <Route path="/owner/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)


