import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1️⃣ Local login for dashboard access
      if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
        setError('Invalid credentials')
        setLoading(false)
        return
      }

      // 2️⃣ Supabase Auth Sign-in (for image upload permissions)
      console.log("🔵 Logging into Supabase Auth with:", ADMIN_EMAIL)

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_SUPABASE_PASSWORD,
      })

      if (authError) {
        console.error("❌ Supabase Auth login failed:", authError.message)
        setError("Supabase Auth login failed. Please check your email and password in Supabase → Authentication → Users.")
        setLoading(false)
        return
      }

      // ✅ Successfully signed in
      console.log("✅ Supabase Auth Success → User:", authData.user?.email || "No email")

      // 3️⃣ Verify active session and UID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session?.user?.id) {
        console.error("❌ No active session:", sessionError)
        setError("No active Supabase session found. Please log in again.")
        setLoading(false)
        return
      }

      console.log("🟢 Active Supabase session UID:", sessionData.session.user.id)

      // 4️⃣ Local dashboard access
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminAuthTime', Date.now().toString())

      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        border: '2px solid var(--accent)',
        padding: '40px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: '24px', textAlign: 'center' }}>
          Admin Login
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: '#d32f2f', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
