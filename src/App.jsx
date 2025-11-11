import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import Layout from './components/Layout'
import Home from './pages/Home'
import CategoryDetail from './pages/CategoryDetail'
import PoemPage from './pages/PoemPage'
import PublicationPage from './pages/PublicationPage'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import './styles/phoenix-design-system.css'
import './styles/app.css'
import './styles/layout.css'

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
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <Layout onAccentChange={handleAccentChange} accentColor={accentColor}>
            <Suspense fallback={<div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '100vh',
              fontFamily: 'var(--phoenix-font-serif)',
              fontSize: 'var(--phoenix-text-lg)',
              color: 'var(--phoenix-text-secondary)'
            }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryId" element={<CategoryDetail />} />
                <Route path="/poem/:id" element={<PoemPage />} />
                <Route path="/publication/:id" element={<PublicationPage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </I18nextProvider>
    </HelmetProvider>
  )
}

export default App

