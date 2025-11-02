import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import CategoryDetail from './pages/CategoryDetail'
import PoemPage from './pages/PoemPage'
import PublicationPage from './pages/PublicationPage'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import './styles/app.css'

function App() {
  const [accentColor, setAccentColor] = useState('#964B00')

  useEffect(() => {
    // Set default accent color first (dark orange)
    const defaultColor = '#964B00'
    document.documentElement.style.setProperty('--accent', defaultColor)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', defaultColor)
    }
    
    // Then load persisted accent color if exists (allows user override)
    const saved = localStorage.getItem('siteAccent')
    if (saved) {
      setAccentColor(saved)
      document.documentElement.style.setProperty('--accent', saved)
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', saved)
      }
    } else {
      // If no saved preference, use default
      setAccentColor(defaultColor)
      localStorage.setItem('siteAccent', defaultColor)
    }
  }, [])

  const handleAccentChange = (color) => {
    setAccentColor(color)
    localStorage.setItem('siteAccent', color)
    document.documentElement.style.setProperty('--accent', color)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color)
    }
  }

  return (
    <BrowserRouter>
      <Layout onAccentChange={handleAccentChange} accentColor={accentColor}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryDetail />} />
          <Route path="/poem/:id" element={<PoemPage />} />
          <Route path="/publication/:id" element={<PublicationPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

