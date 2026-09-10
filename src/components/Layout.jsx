import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className={`phoenix-app ${isAdmin ? 'admin-app-layout' : ''}`}>
      {!isAdmin && <Header />}
      <main className={`phoenix-main ${isAdmin ? 'admin-main-container' : ''}`}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default Layout

