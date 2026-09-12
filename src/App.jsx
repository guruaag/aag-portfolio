import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function DynamicIframeRoute() {
  const pathname = window.location.pathname
  const search = window.location.search
  return (
    <iframe
      src={`${pathname}${search}`}
      style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
      title="Page View"
    />
  )
}

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught UI error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const isEn = localStorage.getItem('siteLanguage') === 'en' || localStorage.getItem('i18nextLng') === 'en'
      return (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#FAF7F2',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '32px 40px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            maxWidth: '480px',
            border: '1px solid #E2D7C5'
          }}>
            <h2 style={{ color: '#D95343', marginBottom: '12px', fontSize: '1.4rem' }}>
              {isEn ? '⚠️ Page Error' : '⚠️ पृष्ठ त्रुटि'}
            </h2>
            <p style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {this.state.error?.message || (isEn ? 'An issue occurred while loading this section.' : 'सामग्री प्रदर्शित करने में समस्या आई है।')}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              style={{
                background: '#F66E5E',
                color: '#FFF',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {isEn ? '🔄 Reload Page' : '🔄 पुनः प्रयास करें'}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  useEffect(() => {
    // Initialize theme system on app load
    initTheme()
  }, [])

  return (
    <ErrorBoundary>
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
              {/* Leona Theme Primary Homepage & Standalone HTML Prototype routes */}
              
              <Route path="/preview" element={<iframe src="/preview.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Prototype Preview" />} />
              <Route path="/preview.html" element={<iframe src="/preview.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Prototype Preview" />} />
              <Route path="/kavi-parichay.html" element={<iframe src="/kavi-parichay.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Kavi Parichay" />} />
              <Route path="/kavya-sangrah.html" element={<iframe src="/kavya-sangrah.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Kavya Sangrah" />} />
              <Route path="/kavya-sangrah/*" element={<DynamicIframeRoute />} />
              <Route path="/prakashan.html" element={<iframe src="/prakashan.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Prakashan" />} />
              <Route path="/prakashan/*" element={<DynamicIframeRoute />} />
              <Route path="/pustak/*" element={<DynamicIframeRoute />} />
              <Route path="/sampark.html" element={<iframe src="/sampark.html" style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Sampark" />} />
              <Route path="/book-detail.html" element={<iframe src={`/book-detail.html${window.location.search}`} style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Book Detail" />} />
              <Route path="/book.html" element={<iframe src={`/book.html${window.location.search}`} style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Book View" />} />
              <Route path="/poem-reader.html" element={<iframe src={`/poem-reader.html${window.location.search}`} style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Poem Reader" />} />
              <Route path="/poem.html" element={<iframe src={`/poem.html${window.location.search}`} style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }} title="Poem View" />} />

              {/* Standard routes inside React Layout wrapper */}
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:categoryId" element={<CategoryDetail />} />
                    <Route path="/kavya-sangrah" element={<Navigate to="/category/poems" replace />} />
                    <Route path="/poetry" element={<Navigate to="/category/poems" replace />} />
                    <Route path="/prakashan" element={<Navigate to="/category/publications" replace />} />
                    <Route path="/books" element={<Navigate to="/category/publications" replace />} />
                    <Route path="/about" element={<Navigate to="/category/about" replace />} />
                    <Route path="/parichay" element={<Navigate to="/category/about" replace />} />
                    <Route path="/poem/:id" element={<PoemPage />} />
                    <Route path="/publication/:id" element={<PublicationPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard tab="about" />} />
                    <Route path="/admin/home" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
                    <Route path="/admin/home/hero" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
                    <Route path="/admin/home/intro" element={<AdminDashboard tab="home" initialSubTab="about" />} />
                    <Route path="/admin/home/featured" element={<AdminDashboard tab="home" initialSubTab="featured" />} />
                    <Route path="/admin/home/highlights" element={<AdminDashboard tab="home" initialSubTab="highlights" />} />
                    <Route path="/admin/parichay" element={<AdminDashboard tab="about" />} />
                    <Route path="/admin/about" element={<AdminDashboard tab="about" />} />
                    <Route path="/admin/timeline" element={<AdminDashboard tab="timeline" />} />
                    <Route path="/admin/awards" element={<AdminDashboard tab="awards" />} />
                    <Route path="/admin/kavya-sangrah" element={<AdminDashboard tab="poems" />} />
                    <Route path="/admin/kavya-sangrah/:id" element={<AdminDashboard tab="poems" />} />
                    <Route path="/admin/poems" element={<AdminDashboard tab="poems" />} />
                    <Route path="/admin/poems/:id" element={<AdminDashboard tab="poems" />} />
                    <Route path="/admin/categories" element={<Navigate to="/admin/kavya-sangrah" replace />} />
                    <Route path="/admin/prakashan" element={<AdminDashboard tab="publications" />} />
                    <Route path="/admin/prakashan/:id" element={<AdminDashboard tab="publications" />} />
                    <Route path="/admin/publications" element={<AdminDashboard tab="publications" />} />
                    <Route path="/admin/publications/:id" element={<AdminDashboard tab="publications" />} />
                    <Route path="/admin/sampark" element={<AdminDashboard tab="contact" />} />
                    <Route path="/admin/inbox" element={<AdminDashboard tab="inbox" />} />
                    <Route path="/admin/settings" element={<AdminDashboard tab="settings" />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </I18nextProvider>
    </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App

