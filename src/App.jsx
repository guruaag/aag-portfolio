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
import Contact from './pages/Contact'
import Settings from './pages/Settings'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import { initTheme } from './lib/themeSystem'
import './styles/phoenix-design-system.css'
import './styles/app.css'
import './styles/layout.css'
import './styles/mobile-fixes.css'
import './styles/font-standardization.css'
import './styles/premium-theme.css'
import './styles/scroll-reveal.css'

function App() {
  useEffect(() => {
    // Initialize theme system on app load
    initTheme()
  }, [])

  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
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
              {/* Standalone HTML prototype route without outer Layout wrapper */}
              <Route path="/preview" element={<iframe src="/preview.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Prototype Preview" />} />
              <Route path="/preview.html" element={<iframe src="/preview.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Prototype Preview" />} />
              <Route path="/kavi-parichay.html" element={<iframe src="/kavi-parichay.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Kavi Parichay" />} />

              {/* Standard routes inside React Layout wrapper */}
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:categoryId" element={<CategoryDetail />} />
                    <Route path="/poem/:id" element={<PoemPage />} />
                    <Route path="/publication/:id" element={<PublicationPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </I18nextProvider>
    </HelmetProvider>
  )
}

export default App

