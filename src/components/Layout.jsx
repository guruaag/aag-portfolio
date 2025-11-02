import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import MenuOverlay from './MenuOverlay'

function Layout({ children, onAccentChange, accentColor }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-container">
      <Header onMenuClick={() => setMenuOpen(true)} />
      <div className="content-area">
        {children}
      </div>
      <Footer />
      {menuOpen && (
        <MenuOverlay
          onClose={() => setMenuOpen(false)}
          onAccentChange={onAccentChange}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}

export default Layout

