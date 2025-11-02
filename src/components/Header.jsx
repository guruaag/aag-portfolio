import { useNavigate } from 'react-router-dom'

function Header({ onMenuClick }) {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <header 
      style={{
        height: 'var(--header-height)',
        borderBottom: '2px solid var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--content-padding)',
        background: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}
    >
      <div
        onClick={handleLogoClick}
        style={{
          width: '48px',
          height: '48px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--accent)',
          background: 'white'
        }}
        aria-label="Logo - Go to home"
      >
        <img 
          src="/logo.png" 
          alt="Gurupratap Sharma AAG Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            // Fallback if logo doesn't exist - show text placeholder
            e.target.style.display = 'none'
            if (!e.target.nextSibling) {
              const placeholder = document.createElement('div')
              placeholder.textContent = 'Logo'
              placeholder.style.cssText = 'font-size: 12px; color: var(--accent);'
              e.target.parentElement.appendChild(placeholder)
            }
          }}
        />
      </div>
      
      <h1 
        style={{
          fontSize: 'clamp(14px, 4vw, 18px)',
          fontWeight: 500,
          color: 'var(--accent)',
          textAlign: 'center',
          flex: 1,
          margin: '0 16px'
        }}
      >
        Gurupratap Sharma | AAG
      </h1>

      <button
        onClick={onMenuClick}
        style={{
          width: '48px',
          height: '48px',
          border: '2px solid var(--accent)',
          background: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--accent)',
          fontFamily: 'var(--font-family-main)'
        }}
        aria-label="Open menu"
      >
        Menu
      </button>
    </header>
  )
}

export default Header

