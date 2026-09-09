import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const isAdmin = location.pathname.startsWith('/admin')

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  if (isAdmin) {
    return (
      <div className="phoenix-app admin-app-layout">
        <main className="phoenix-main admin-main-container" style={{ padding: 0 }}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="phoenix-app">
      <Header />
      <main className="phoenix-main">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

