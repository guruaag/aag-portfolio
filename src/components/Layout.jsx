import Header from './Header'
import Footer from './Footer'

function Layout({ children, onAccentChange, accentColor }) {
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

