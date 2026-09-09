import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import i18n from '../../i18n/config'
import './AdminDashboard.css'

// Local dashboard login credentials (username/password typed into form)
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'aag'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '1234'

// Supabase Auth credentials (for image uploads / RLS)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || `${ADMIN_USER}@admin.local`
const ADMIN_SUPABASE_PASSWORD = import.meta.env.VITE_ADMIN_SUPABASE_PASSWORD || ADMIN_PASSWORD

function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminLang, setAdminLang] = useState(() => localStorage.getItem('siteLanguage') || (i18n.language === 'en' ? 'en' : 'hi'))

  const toggleLanguage = () => {
    const nextLang = adminLang === 'en' ? 'hi' : 'en'
    setAdminLang(nextLang)
    localStorage.setItem('siteLanguage', nextLang)
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(nextLang)
    }
  }

  const tLabel = (hi, en) => (adminLang === 'en' ? en : hi)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
        setError(tLabel('अमान्य उपयोगकर्ता या पासवर्ड', 'Invalid username or password'))
        setLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_SUPABASE_PASSWORD,
      })

      if (authError) {
        setError(tLabel('प्रमाणीकरण विफल। कृपया सेटिंग्स जांचें।', 'Authentication failed. Please check setup.'))
        setLoading(false)
        return
      }

      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminAuthTime', Date.now().toString())

      navigate('/admin/dashboard')
    } catch (err) {
      setError(tLabel('लॉगिन विफल। कृपया पुनः प्रयास करें।', 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div className="admin-card-panel" style={{ width: '100%', maxWidth: '440px', border: '1.5px solid var(--leona-gold, #D4AF37)', boxShadow: '0 12px 40px rgba(30, 27, 24, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/logo.png" alt="AAG Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', border: '2px solid var(--leona-gold)', marginBottom: '12px' }} />
            <h1 className="admin-panel-title" style={{ fontSize: '1.6rem' }}>
              {tLabel('प्रशासन प्रवेश', 'Admin Portal Sign-In')}
            </h1>
            <p style={{ color: '#6E665E', fontSize: '0.9rem', marginTop: '6px' }}>
              {tLabel('सामग्री प्रबंधन हेतु लॉगिन करें', 'Log in to manage site content & archive')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-form-group">
                <label>{tLabel('उपयोगकर्ता नाम (Username)', 'Username')}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tLabel('उपयोगकर्ता नाम दर्ज करें', 'Enter username')}
                  required
                  autoFocus
                />
              </div>

              <div className="admin-form-group">
                <label>{tLabel('पासवर्ड (Password)', 'Password')}</label>
                <input
                  type="password"
                  className="admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tLabel('पासवर्ड दर्ज करें', 'Enter password')}
                  required
                />
              </div>

              {error && (
                <div style={{ background: '#FFF0ED', color: '#D95343', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FFC4BD', fontSize: '0.88rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1.02rem', marginTop: '8px' }} disabled={loading}>
                {loading ? tLabel('सत्यापित किया जा रहा है...', 'Authenticating...') : tLabel('प्रवेश करें (Login)', 'Sign In')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
