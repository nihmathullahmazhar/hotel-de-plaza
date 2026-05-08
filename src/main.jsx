import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App           from './App'
import MenuPage      from './MenuPage'
import AdminApp      from './AdminApp'
import CareersPage   from './CareersPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<App />} />
        <Route path="/menu"      element={<MenuPage />} />
        <Route path="/careers"   element={<CareersPage />} />

        {/* Staff */}
        {/* Admin */}
        <Route path="/owner"     element={<AdminApp />} />
        <Route path="/owner/*"   element={<AdminApp />} />

        {/* Standalone analytics */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)