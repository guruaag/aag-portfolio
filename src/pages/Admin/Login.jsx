import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'aag'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '1234'

function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminAuthTime', Date.now().toString())
      navigate('/admin/dashboard')
    } else {
      setError('Invalid credentials')
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

            <button type="submit" className="btn" style={{ width: '100%' }}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin

