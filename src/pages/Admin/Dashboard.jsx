import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting, getAllSettings } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl, deleteImage } from '../../lib/imageUtils'
import PM5WritingDesk, { paginateTextIntoPages } from '../../components/PM5WritingDesk'
import i18n from '../../i18n/config'
import './AdminDashboard.css'

export const FormStateContext = createContext({
  isDirty: false,
  setIsDirty: () => {},
  markDirty: () => {},
  markClean: () => {}
})

export function useFormState() {
  return useContext(FormStateContext)
}

const AdminLangContext = createContext({
  adminLang: 'hi',
  setAdminLang: () => {},
  toggleAdminLang: () => {},
  tLabel: (hi, en) => hi
})

export function useAdminLang() {
  return useContext(AdminLangContext)
}

// Custom Bilingual Unsaved Changes Confirmation Modal Component
function UnsavedChangesModal({ isOpen, onConfirmDiscard, onKeepEditing, tLabel }) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card">
        <div className="admin-modal-icon">⚠️</div>
        <h3 className="admin-modal-title">
          {tLabel('असुरक्षित बदलाव मौजूद हैं', 'Unsaved Changes Detected')}
        </h3>
        <p className="admin-modal-body">
          {tLabel(
            'आपके द्वारा किए गए परिवर्तन अभी तक सहेजे नहीं गए हैं। यदि आप आगे बढ़ते हैं, तो आपके बदलाव नष्ट हो जाएंगे।',
            'You have unsaved changes on this form. Leaving this page will discard your recent updates.'
          )}
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn-secondary" onClick={onKeepEditing}>
            ✏️ {tLabel('संपादन जारी रखें', 'Keep Editing')}
          </button>
          <button type="button" className="admin-btn-danger" onClick={onConfirmDiscard}>
            🗑️ {tLabel('परिवर्तन छोड़ें', 'Discard Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ tab, initialSubTab }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tab || 'categories')
  const [homeSubTab, setHomeSubTab] = useState(initialSubTab || 'hero')

  useEffect(() => {
    if (initialSubTab) {
      setHomeSubTab(initialSubTab)
    }
  }, [initialSubTab])
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const [adminLang, setAdminLangState] = useState(() => localStorage.getItem('siteLanguage') || (i18n.language === 'en' ? 'en' : 'hi'))

  useEffect(() => {
    const handleLangChange = () => {
      const current = localStorage.getItem('siteLanguage') || (i18n.language === 'en' ? 'en' : 'hi')
      setAdminLangState(current)
    }
    window.addEventListener('languageChange', handleLangChange)
    window.addEventListener('storage', handleLangChange)
    if (i18n && i18n.on) {
      i18n.on('languageChanged', handleLangChange)
    }
    return () => {
      window.removeEventListener('languageChange', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
      if (i18n && i18n.off) {
        i18n.off('languageChanged', handleLangChange)
      }
    }
  }, [])

  const toggleAdminLang = () => {
    const nextLang = adminLang === 'en' ? 'hi' : 'en'
    setAdminLangState(nextLang)
    localStorage.setItem('siteLanguage', nextLang)
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(nextLang)
    }
    window.dispatchEvent(new Event('languageChange'))
  }

  const tLabel = (hiText, enText) => {
    if (adminLang === 'en') return enText || hiText
    return hiText || enText
  }

  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const switchTab = (newTab, routePath, subTab) => {
    if (subTab) setHomeSubTab(subTab)
    if (isDirty) {
      setPendingNavigation({ newTab, routePath })
      setShowUnsavedModal(true)
      return
    }
    executeTabSwitch(newTab, routePath)
  }

  const executeTabSwitch = (newTab, routePath) => {
    setIsDirty(false)
    setActiveTab(newTab)
    setMobileOpen(false)
    if (routePath) {
      navigate(routePath)
    }
  }

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false)
    if (pendingNavigation) {
      executeTabSwitch(pendingNavigation.newTab, pendingNavigation.routePath)
      setPendingNavigation(null)
    }
  }

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false)
    setPendingNavigation(null)
  }
  const [data, setData] = useState({
    categories: [],
    about: null,
    publications: [],
    poems: [],
    settings: []
  })

  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      navigate('/admin')
      return
    }

    // Ensure Supabase auth session is valid for storage uploads
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Try to restore session or show warning
        console.warn('No Supabase auth session found. Image uploads may fail.')
      }
    }
    checkSupabaseAuth()

    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Auto-align category seed data titles to match website sections
      try {
        const { data: catsData } = await supabase.from('categories').select('*')
        if (catsData && catsData.length > 0) {
          for (const cat of catsData) {
            if (cat.name_en === 'About Display' || cat.name_display === 'About Display' || cat.content_type === 'about' || cat.name_en === 'About Gurupratap Sharma') {
              if (cat.name_display !== 'कवि परिचय (About)') {
                await supabase.from('categories').update({ name_en: 'Kavi Parichay (About)', name_display: 'कवि परिचय (About)', sort_order: 1 }).eq('id', cat.id)
              }
            } else if (cat.name_en === 'My Publications' || cat.name_display === 'My Publications' || cat.content_type === 'publications') {
              if (cat.name_display !== 'प्रकाशन (Publications)') {
                await supabase.from('categories').update({ name_en: 'Prakashan (Publications)', name_display: 'प्रकाशन (Publications)', sort_order: 2 }).eq('id', cat.id)
              }
            } else if (cat.name_en === '2My Writings' || cat.name_en === 'My Writings' || cat.content_type === 'writings') {
              if (cat.name_display !== 'काव्य संग्रह (Poetry Collection)') {
                await supabase.from('categories').update({ name_en: 'Kavya Sangrah (Poetry Collection)', name_display: 'काव्य संग्रह (Poetry Collection)', sort_order: 3 }).eq('id', cat.id)
              }
            }
          }
        }
      } catch (e) {
        console.warn('Category seed alignment check:', e)
      }

      const [cats, about, pubs, poems, settingsList] = await Promise.all([
        getCategories().catch(err => { console.error('Error fetching categories:', err); return [] }),
        getAboutContent().catch(err => { console.error('Error fetching about content:', err); return null }),
        getPublications().catch(err => { console.error('Error fetching publications:', err); return [] }),
        getPoems().catch(err => { console.error('Error fetching poems:', err); return [] }),
        getAllSettings().catch(err => { console.error('Error fetching settings:', err); return [] })
      ])
      
      const settingsMap = {}
      if (Array.isArray(settingsList)) {
        settingsList.forEach(s => {
          if (s && s.key) {
            settingsMap[s.key] = s.value
          }
        })
      }
      
      setData({ 
        categories: Array.isArray(cats) ? cats : [], 
        about: about || null, 
        publications: Array.isArray(pubs) ? pubs : [], 
        poems: Array.isArray(poems) ? poems : [],
        settings: settingsMap
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isDirty) {
      setPendingNavigation({ newTab: 'logout', routePath: '/admin' })
      setShowUnsavedModal(true)
      return
    }
    executeLogout()
  }

  const executeLogout = async () => {
    // Sign out from Supabase Auth
    await supabase.auth.signOut()
    // Clear local admin auth
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminAuthTime')
    navigate('/admin')
  }

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', padding: '60px', color: 'var(--leona-terracotta)', fontSize: '1.2rem', fontWeight: 600 }}>लोड हो रहा है... (Loading Admin...)</div>
  }

  const formStateValue = {
    isDirty,
    setIsDirty,
    markDirty: () => setIsDirty(true),
    markClean: () => setIsDirty(false)
  }

  return (
    <FormStateContext.Provider value={formStateValue}>
      <AdminLangContext.Provider value={{ adminLang, setAdminLang: setAdminLangState, toggleAdminLang, tLabel }}>
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirmDiscard={handleConfirmDiscard}
        onKeepEditing={handleCancelNavigation}
        tLabel={tLabel}
      />
      <div className="admin-layout">
        
        {/* Mobile Top Navigation Bar (<768px) */}
        <div className="admin-mobile-topbar">
          <button className="admin-hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰ {tLabel('नेविगेशन', 'Menu')}
          </button>
          <span className="admin-mobile-title">
            📜 {tLabel("एडमिन पैनल", "Admin Panel")}
          </span>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div className="admin-drawer-overlay" onClick={() => setMobileOpen(false)} />
        )}

        {/* Phase 1 Persistent Sidebar */}
        <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
          {/* Static / Fixed Top Header Block */}
          <div className="admin-sidebar-header-fixed">
            <div className="admin-sidebar-brand">
              <span>👑</span>
              <span>{tLabel("एडमिन पैनल", "Admin Panel")}</span>
            </div>
            
            <div className="admin-sidebar-top-actions">
              <button
                type="button"
                className="admin-sidebar-action-btn"
                onClick={() => switchTab(null, '/')}
                title={tLabel('मुख्य साइट पर जाएं', 'Back to Main Site')}
              >
                🌐 {tLabel('मुख्य साइट', 'Main Site')}
              </button>
              <button
                type="button"
                className="admin-sidebar-action-btn"
                onClick={toggleAdminLang}
                title={tLabel('भाषा बदलें', 'Switch Language')}
              >
                🌐 {adminLang === 'hi' ? 'English' : 'हिंदी'}
              </button>
            </div>
          </div>

          {/* Independently Scrollable Navigation Container */}
          <div className="admin-sidebar-nav-scroll">
            <div className="admin-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              {/* Home Page Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => switchTab('home', '/admin/home/hero', 'hero')}
              >
                🏠 {tLabel('मुख्य पृष्ठ', 'Home Page')}
              </button>

              {/* Nested Sub-categories for Home Page */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'hero' ? 'active' : ''}`}
                  onClick={() => switchTab('home', '/admin/home/hero', 'hero')}
                >
                  ▫️ 1. {tLabel('हीरो बैनर', 'Hero Banner')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'home' && (homeSubTab === 'about' || homeSubTab === 'intro') ? 'active' : ''}`}
                  onClick={() => switchTab('home', '/admin/home/intro', 'about')}
                >
                  ▫️ 2. {tLabel('परिचय सारांश', 'Bio Excerpt')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'featured' ? 'active' : ''}`}
                  onClick={() => switchTab('home', '/admin/home/featured', 'featured')}
                >
                  ▫️ 3. {tLabel('प्रमुख रचनाएं व पुस्तकें', 'Featured Works')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'highlights' ? 'active' : ''}`}
                  onClick={() => switchTab('home', '/admin/home/highlights', 'highlights')}
                >
                  ▫️ 4. {tLabel('मुख्य उपलब्धियां', 'Highlights & Awards')}
                </button>
              </div>

              {/* About Bio Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards' ? 'active' : ''}`}
                onClick={() => switchTab('about', '/admin/parichay')}
              >
                📖 {tLabel('कवि परिचय', 'About Bio')}
              </button>
              
              {/* Nested Sub-categories for About Bio */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => switchTab('about', '/admin/parichay')}
                >
                  ▫️ 1. {tLabel('कवि परिचय व बैनर', 'Overview & Hero')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => switchTab('timeline', '/admin/timeline')}
                >
                  ▫️ 2. {tLabel('जीवन यात्रा (टाइमलाइन)', 'Timeline')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
                  onClick={() => switchTab('awards', '/admin/awards')}
                >
                  ▫️ 3. {tLabel('पुरस्कार व सम्मान', 'Awards & Honors')}
                </button>
              </div>

              {/* Poetry Archive Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'poems' || activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
              >
                ✍️ {tLabel('काव्य संग्रह', 'Poetry Archive')}
              </button>

              {/* Nested Sub-categories for Poetry Archive */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'poems' ? 'active' : ''}`}
                  onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
                >
                  ▫️ 1. {tLabel('काव्य सूची', 'Poetry List')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => switchTab('categories', '/admin/categories')}
                >
                  ▫️ 2. {tLabel('काव्य श्रेणियां', 'Poetry Categories')}
                </button>
              </div>

              {/* Publications Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
                onClick={() => switchTab('publications', '/admin/prakashan')}
              >
                📚 {tLabel('प्रकाशन', 'Publications')}
              </button>

              {/* Contact & Inbox Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'contact' || activeTab === 'inbox' ? 'active' : ''}`}
                onClick={() => switchTab('contact', '/admin/sampark')}
              >
                📞 {tLabel('संपर्क व इनबॉक्स', 'Contact & Inbox')}
              </button>

              {/* Nested Sub-categories for Contact */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => switchTab('contact', '/admin/sampark')}
                >
                  ▫️ 1. {tLabel('संपर्क विवरण', 'Contact Info')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => switchTab('inbox', '/admin/inbox')}
                >
                  ▫️ 2. {tLabel('प्राप्त संदेश', 'Received Inbox')}
                </button>
              </div>

              {/* Site Settings */}
              <button
                className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => switchTab('settings', '/admin/settings')}
              >
                ⚙️ {tLabel('सेटिंग्स', 'Site Settings')}
              </button>
            </div>
          </div>

          {/* Static / Fixed Bottom Footer Block */}
          <div className="admin-sidebar-footer-fixed">
            <button className="admin-btn-logout" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
              🚪 {tLabel('लॉगआउट', 'Logout')}
            </button>
          </div>
        </aside>

        {/* Flexible Main Canvas Area */}
        <main className="admin-main-canvas">
          
          {/* Persistent Sticky Top Action Header */}
          <header className="admin-sticky-header">
            <div className="admin-sticky-header-left">
              <span className="admin-breadcrumb-title">
                {activeTab === 'home' && `🏠 ${tLabel('मुख्य पृष्ठ', 'Home Page')}`}
                {activeTab === 'about' && `📖 ${tLabel('कवि परिचय व बैनर', 'Poet Bio & Hero Banner')}`}
                {activeTab === 'timeline' && `⏳ ${tLabel('जीवन यात्रा (टाइमलाइन)', 'Timeline Milestones')}`}
                {activeTab === 'awards' && `🏆 ${tLabel('पुरस्कार व सम्मान', 'Awards & Honors')}`}
                {activeTab === 'poems' && `✍️ ${tLabel('काव्य रचनाएं', 'Poetry List')}`}
                {activeTab === 'categories' && `🌐 ${tLabel('काव्य श्रेणियां', 'Poetry Categories')}`}
                {activeTab === 'publications' && `📚 ${tLabel('प्रकाशन संग्रह', 'Publications List')}`}
                {activeTab === 'contact' && `📍 ${tLabel('संपर्क विवरण', 'Contact Info')}`}
                {activeTab === 'inbox' && `📬 ${tLabel('प्राप्त संदेश (इनबॉक्स)', 'Inbox Messages')}`}
                {activeTab === 'settings' && `⚙️ ${tLabel('वेबसाइट सेटिंग्स', 'Site Settings')}`}
              </span>
            </div>

            <div className="admin-sticky-header-right">
              {isDirty && (
                <span className="admin-dirty-badge">
                  ⚠️ {tLabel('असुरक्षित बदलाव', 'Unsaved Changes')}
                </span>
              )}
              <button
                type="submit"
                form="admin-active-form"
                className="admin-btn-primary admin-header-save-btn"
                style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: 700 }}
              >
                💾 {tLabel('सहेजें / अपडेट', 'Save / Update')}
              </button>
            </div>
          </header>

          <div className="admin-dashboard-container" style={{ padding: '24px' }}>
            {activeTab === 'home' && (
              <HomeManager initialSubTab={homeSubTab} poems={data.poems} publications={data.publications} about={data.about} settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
            {(activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards') && (
              <AboutManager
                about={data.about}
                initialSubTab={activeTab === 'timeline' ? 'timeline' : (activeTab === 'awards' ? 'awards' : 'bio')}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {(activeTab === 'poems' || activeTab === 'categories') && (
              <PoemsArchiveManager
                poems={data.poems}
                categories={data.categories}
                initialSubTab={activeTab === 'categories' ? 'categories' : 'poems'}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {activeTab === 'publications' && (
              <PublicationsManager publications={data.publications} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
            {(activeTab === 'contact' || activeTab === 'inbox') && (
              <ContactSectionManager
                settings={data.settings}
                initialSubTab={activeTab === 'inbox' ? 'inbox' : 'info'}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsManager settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
          </div>
        </main>

      </div>
    </AdminLangContext.Provider>
    </FormStateContext.Provider>
  )
}


// Phase 2.5 Contextual Top Action Toolbar Component
function ListContextualToolbar({
  selectedIds,
  totalItems,
  onClearSelection,
  onEdit,
  onMoveTop,
  onMoveUp,
  onMoveDown,
  onMoveBottom,
  onBatchDelete,
  tLabel
}) {
  const count = selectedIds.length
  if (count === 0) return null

  const isSingle = count === 1

  return (
    <div className="admin-contextual-toolbar">
      <div className="admin-toolbar-info">
        <span className="admin-toolbar-count">
          ☑️ {count} {tLabel('चयनित', 'Selected')}
        </span>
        <button type="button" className="admin-btn-link" onClick={onClearSelection}>
          ✖ {tLabel('चयन रद्द करें', 'Clear')}
        </button>
      </div>

      <div className="admin-toolbar-actions">
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={!isSingle}
          onClick={onEdit}
        >
          ✏️ {tLabel('संपादित करें', 'Edit')}
        </button>
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={!isSingle}
          onClick={onMoveTop}
        >
          🔝 {tLabel('शीर्ष पर (Top)', 'Top')}
        </button>
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={!isSingle}
          onClick={onMoveUp}
        >
          ⬆️ {tLabel('ऊपर', 'Up')}
        </button>
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={!isSingle}
          onClick={onMoveDown}
        >
          ⬇️ {tLabel('नीचे', 'Down')}
        </button>
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={!isSingle}
          onClick={onMoveBottom}
        >
          🔚 {tLabel('सबसे नीचे (Bottom)', 'Bottom')}
        </button>
        <button
          type="button"
          className="admin-btn-danger"
          onClick={onBatchDelete}
        >
          🗑️ {tLabel('हटाएं', 'Delete')} ({count})
        </button>
      </div>
    </div>
  )
}

// Categories Manager Component
function CategoriesManager({ categories, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name_en: '', name_display: '', content_type: 'about', sort_order: 1, is_active: true })
  const [itemsList, setItemsList] = useState(Array.isArray(categories) ? categories : [])
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    if (Array.isArray(categories)) {
      setItemsList(categories)
    }
  }, [categories])

  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }))
    if (setIsDirty) setIsDirty(true)
  }

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const displayList = itemsList.length > 0 ? itemsList : (Array.isArray(categories) ? categories : [])
  const singleSelectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const singleIndex = singleSelectedId ? displayList.findIndex(i => i.id === singleSelectedId) : -1

  const handleCreate = () => {
    setEditing(null)
    setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 1, is_active: true })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 1, is_active: true })
    if (setIsDirty) setIsDirty(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Rule 2: New records get sort_order = 1 (top priority)
      const dataToSave = {
        name_en: formData.name_en || '',
        name_display: formData.name_display || '',
        content_type: formData.content_type || 'about',
        sort_order: editing ? (parseInt(formData.sort_order) || 1) : 1
      }
      
      const { error } = editing
        ? await supabase.from('categories').update(dataToSave).eq('id', editing)
        : await supabase.from('categories').insert(dataToSave)

      if (error) {
        console.error('Error saving category:', error)
        alert('Error saving category: ' + error.message)
        return
      }

      if (setIsDirty) setIsDirty(false)
      onUpdate()
      setEditing(null)
      setShowForm(false)
      clearSelection()
      alert('✓ Category saved successfully!')
    } catch (err) {
      console.error('Error saving category:', err)
      alert('Error saving category: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEditSelected = () => {
    if (!singleSelectedId) return
    const cat = displayList.find(i => i.id === singleSelectedId)
    if (!cat) return
    setEditing(cat.id)
    setShowForm(true)
    setFormData({
      ...cat,
      is_active: cat.is_active !== undefined ? cat.is_active : true
    })
  }

  const persistReorder = async (updated) => {
    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItemsList(updated)
    try {
      for (const item of updated) {
        await supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {
      console.warn('Category resequence error:', e)
    }
    onUpdate()
  }

  const handleMoveTop = () => {
    if (singleIndex <= 0) return
    const item = displayList[singleIndex]
    const updated = [item, ...displayList.filter((_, i) => i !== singleIndex)]
    persistReorder(updated)
    clearSelection()
  }

  const handleMoveUp = () => {
    if (singleIndex <= 0) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex - 1]
    updated[singleIndex - 1] = temp
    persistReorder(updated)
  }

  const handleMoveDown = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex + 1]
    updated[singleIndex + 1] = temp
    persistReorder(updated)
  }

  const handleMoveBottom = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const item = displayList[singleIndex]
    const updated = [...displayList.filter((_, i) => i !== singleIndex), item]
    persistReorder(updated)
    clearSelection()
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(tLabel(`क्या आप चयनित ${selectedIds.length} अनुभाग हटाना चाहते हैं?`, `Delete ${selectedIds.length} selected sections?`))) return

    const updated = displayList.filter(i => !selectedIds.includes(i.id))
    setItemsList(updated)
    clearSelection()

    try {
      await supabase.from('categories').delete().in('id', selectedIds)
    } catch (e) {
      console.warn('Batch delete categories error:', e)
    }
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">{tLabel('वेबसाइट अनुभाग', 'Website Sections & Categories')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नया अनुभाग जोड़ें', 'Add Section')}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('अनुभाग नाम (Slug) *', 'Section Key (Slug) *')}</label>
              <input
                className="admin-input"
                value={formData.name_en}
                onChange={(e) => updateForm({ name_en: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('प्रदर्शित नाम', 'Display Name')}</label>
              <input
                className="admin-input"
                value={formData.name_display}
                onChange={(e) => updateForm({ name_display: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('सामग्री प्रकार *', 'Content Type *')}</label>
              <select
                className="admin-select"
                value={formData.content_type}
                onChange={(e) => updateForm({ content_type: e.target.value })}
                required
              >
                <option value="about">{tLabel('कवि परिचय', 'About')}</option>
                <option value="publications">{tLabel('प्रकाशन', 'Publications')}</option>
                <option value="writings">{tLabel('काव्य संग्रह', 'Poems')}</option>
                <option value="hero">Hero Banner</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => updateForm({ is_active: e.target.checked })}
                />
                {tLabel('वेबसाइट पर सक्रिय रखें', 'Active on Website')}
              </label>
            </div>
          </div>
        </form>
      )}

      <div>
        <ListContextualToolbar
          selectedIds={selectedIds}
          totalItems={displayList.length}
          onClearSelection={clearSelection}
          onEdit={handleEditSelected}
          onMoveTop={handleMoveTop}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveBottom={handleMoveBottom}
          onBatchDelete={handleBatchDelete}
          tLabel={tLabel}
        />

        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          {tLabel('सक्रिय अनुभाग सूची', 'Active Sections List')} ({displayList.length})
        </h3>
        {displayList.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई अनुभाग नहीं मिला। नया अनुभाग जोड़ने के लिए बटन दबाएं।', 'No sections found. Click button to add new section.')}</p>
        ) : (
          <ul className="admin-item-list">
            {displayList.map((cat) => {
              const isSelected = selectedIds.includes(cat.id)
              return (
                <li key={cat.id} className={`admin-item-card ${isSelected ? 'selected' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <input
                      type="checkbox"
                      className="admin-item-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(cat.id)}
                    />
                    <div>
                      <div className="admin-item-title">{cat.name_display || cat.name_en}</div>
                      <div className="admin-item-sub">Key: {cat.name_en} • {tLabel('प्रकार:', 'Type:')} {cat.content_type} • {tLabel('क्रम:', 'Order:')} {cat.sort_order || 1}</div>
                    </div>
                  </div>
                  <div className="admin-actions-group">
                    {cat.is_active === false ? (
                      <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>{tLabel('निष्क्रिय', 'Inactive')}</span>
                    ) : (
                      <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>{tLabel('सक्रिय', 'Active')}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// 1. Home Manager Component (4-Module Hybrid Dashboard for Home Page Re-Architecture)
function HomeManager({ initialSubTab = 'hero', poems = [], publications = [], about, settings = {}, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [activeTab, setActiveTab] = useState(initialSubTab || 'hero')

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab)
    }
  }, [initialSubTab]) // 'hero' | 'about' | 'featured' | 'highlights'

  // Additional data for timeline and awards
  const [timelineItems, setTimelineItems] = useState([])
  const [awardsItems, setAwardsItems] = useState([])

  useEffect(() => {
    fetchAuxiliaryData()
  }, [])

  const fetchAuxiliaryData = async () => {
    try {
      const [{ data: tmData }, { data: awData }] = await Promise.all([
        supabase.from('timeline').select('*').order('sort_order', { ascending: true }),
        supabase.from('awards').select('*').order('sort_order', { ascending: true })
      ])
      if (tmData) setTimelineItems(tmData)
      if (awData) setAwardsItems(awData)
    } catch (e) {
      console.warn('Error fetching timeline/awards for HomeManager:', e)
    }
  }

  // Module 1: Hero State
  const [heroForm, setHeroForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    cta_primary_label: 'रचनाएं पढ़ें',
    cta_primary_url: '/kavya-sangrah',
    cta_secondary_label: 'परिचय',
    cta_secondary_url: '/parichay'
  })
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false)
  const [heroImgPreview, setHeroImgPreview] = useState(null)

  // Module 2: Kavi Parichay Excerpt State
  const [aboutConfig, setAboutConfig] = useState({
    use_custom_excerpt: false,
    custom_excerpt: ''
  })

  // Module 3: Featured Works State (Selected ID Arrays in 1st, 2nd, 3rd sequence)
  const [featuredPoems, setFeaturedPoems] = useState([])
  const [featuredPubs, setFeaturedPubs] = useState([])
  const [poemsLimit, setPoemsLimit] = useState(3)
  const [pubsLimit, setPubsLimit] = useState(3)


  // Module 4: Highlights State (Selected ID Arrays in sequence)
  const [featuredTimeline, setFeaturedTimeline] = useState([])
  const [featuredAwards, setFeaturedAwards] = useState([])

  // Search filter states for dropdown pickers
  const [poemSearch, setPoemSearch] = useState('')
  const [pubSearch, setPubSearch] = useState('')
  const [timelineSearch, setTimelineSearch] = useState('')
  const [awardSearch, setAwardSearch] = useState('')

  // Load existing configuration from settings
  useEffect(() => {
    if (settings) {
      setHeroForm({
        hero_title: settings.home_hero_title || 'अग्नि कलश',
        hero_subtitle: settings.home_hero_subtitle || '"हिंदी काव्य और ओजस्वी चेतना की अमर गाथा"',
        hero_image_url: settings.home_hero_image_url || '',
        cta_primary_label: settings.home_cta_primary_label || 'रचनाएं पढ़ें',
        cta_primary_url: settings.home_cta_primary_url || '/kavya-sangrah',
        cta_secondary_label: settings.home_cta_secondary_label || 'परिचय',
        cta_secondary_url: settings.home_cta_secondary_url || '/parichay'
      })
      if (settings.home_hero_image_url) {
        setHeroImgPreview(getImageUrl(settings.home_hero_image_url))
      }

      setAboutConfig({
        use_custom_excerpt: settings.home_use_custom_excerpt === 'true',
        custom_excerpt: settings.home_custom_excerpt || ''
      })

      try {
        if (settings.home_featured_poems) {
          setFeaturedPoems(JSON.parse(settings.home_featured_poems))
        } else if (Array.isArray(poems)) {
          setFeaturedPoems(poems.slice(0, 4).map(p => p.id))
        }
      } catch (e) {
        setFeaturedPoems(Array.isArray(poems) ? poems.slice(0, 4).map(p => p.id) : [])
      }

      try {
        if (settings.home_featured_publications) {
          setFeaturedPubs(JSON.parse(settings.home_featured_publications))
        } else if (Array.isArray(publications)) {
          setFeaturedPubs(publications.slice(0, 4).map(p => p.id))
        }
      } catch (e) {
        setFeaturedPubs(Array.isArray(publications) ? publications.slice(0, 4).map(p => p.id) : [])
      }

      if (settings.home_featured_poems_limit) {
        setPoemsLimit(parseInt(settings.home_featured_poems_limit, 10) || 3)
      }
      if (settings.home_featured_publications_limit) {
        setPubsLimit(parseInt(settings.home_featured_publications_limit, 10) || 3)
      }

      try {
        if (settings.home_featured_timeline) {
          setFeaturedTimeline(JSON.parse(settings.home_featured_timeline))
        }
      } catch (e) {}

      try {
        if (settings.home_featured_awards) {
          setFeaturedAwards(JSON.parse(settings.home_featured_awards))
        }
      } catch (e) {}
    }
  }, [settings, poems.length, publications.length])

  // Hero Image Upload Handler
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert(tLabel('कृपया फोटो फाइल चुनें।', 'Please select an image file'))
      return
    }
    try {
      setUploadingHeroImg(true)
      const fileName = `home-hero-${Date.now()}.${file.name.split('.').pop()}`
      const path = await uploadImage(file, 'logos', fileName)
      setHeroForm(prev => ({ ...prev, hero_image_url: path }))
      setHeroImgPreview(URL.createObjectURL(file))
      if (setIsDirty) setIsDirty(true)
    } catch (err) {
      alert('Upload error: ' + err.message)
    } finally {
      setUploadingHeroImg(false)
    }
  }

  // Resequence Handlers (Move Up / Move Down) for Selected Featured Items
  const moveItemInArray = (arr, index, direction) => {
    const nextArr = [...arr]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= nextArr.length) return nextArr
    const temp = nextArr[index]
    nextArr[index] = nextArr[targetIdx]
    nextArr[targetIdx] = temp
    return nextArr
  }

  // Submit Handler for entire Home Manager view (Bound to form="admin-active-form")
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updates = [
        { key: 'home_hero_title', value: heroForm.hero_title, display_label: 'Hero Title' },
        { key: 'home_hero_subtitle', value: heroForm.hero_subtitle, display_label: 'Hero Subtitle' },
        { key: 'home_hero_image_url', value: heroForm.hero_image_url, display_label: 'Hero Image' },
        { key: 'home_cta_primary_label', value: heroForm.cta_primary_label, display_label: 'CTA Primary Label' },
        { key: 'home_cta_primary_url', value: heroForm.cta_primary_url, display_label: 'CTA Primary URL' },
        { key: 'home_cta_secondary_label', value: heroForm.cta_secondary_label, display_label: 'CTA Secondary Label' },
        { key: 'home_cta_secondary_url', value: heroForm.cta_secondary_url, display_label: 'CTA Secondary URL' },
        { key: 'home_use_custom_excerpt', value: String(aboutConfig.use_custom_excerpt), display_label: 'Use Custom Excerpt' },
        { key: 'home_custom_excerpt', value: aboutConfig.custom_excerpt, display_label: 'Custom Excerpt' },
        { key: 'home_featured_poems', value: JSON.stringify(featuredPoems), display_label: 'Featured Poems' },
        { key: 'home_featured_publications', value: JSON.stringify(featuredPubs), display_label: 'Featured Publications' },
        { key: 'home_featured_poems_limit', value: String(poemsLimit), display_label: 'Featured Poems Limit' },
        { key: 'home_featured_publications_limit', value: String(pubsLimit), display_label: 'Featured Publications Limit' },
        { key: 'home_featured_timeline', value: JSON.stringify(featuredTimeline), display_label: 'Featured Timeline' },
        { key: 'home_featured_awards', value: JSON.stringify(featuredAwards), display_label: 'Featured Awards' }
      ]


      const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' })
      if (error) {
        console.error("Save failed:", error.message)
      }

      // Background attempt to update table columns if present
      try {
        if (featuredPoems.length > 0) {
          await supabase.from('poems').update({ is_featured_home: false }).neq('id', '0')
          await supabase.from('poems').update({ is_featured_home: true }).in('id', featuredPoems)
        }
        if (featuredPubs.length > 0) {
          await supabase.from('publications').update({ is_featured_home: false }).neq('id', '0')
          await supabase.from('publications').update({ is_featured_home: true }).in('id', featuredPubs)
        }
      } catch (e) {
        console.warn('Table flag sync warning (non-fatal):', e)
      }

      if (hasError) {
        alert(tLabel('चेतावनी: मुख्य पृष्ठ की कुछ सेटिंग्स सहेजी नहीं जा सकीं।', 'Warning: Some Home page settings could not be saved.'))
      } else {
        alert(tLabel('✓ मुख्य पृष्ठ की समस्त सेटिंग्स सफलतापूर्वक सहेजी गईं!', '✓ Home page configurations saved successfully!'))
      }

      if (setIsDirty) setIsDirty(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving home page configurations:', err)
      alert(tLabel('त्रुटि: ', 'Error saving settings: ') + (err.message || 'Unknown error'))
    }
  }

  // Safe arrays
  const safePoems = Array.isArray(poems) ? poems : []
  const safePubs = Array.isArray(publications) ? publications : []
  const safeTimeline = Array.isArray(timelineItems) ? timelineItems : []
  const safeAwards = Array.isArray(awardsItems) ? awardsItems : []

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">🏠 {tLabel('मुख्य पृष्ठ प्रबंधन', 'Home Page Management Dashboard')}</h2>
      </div>

      {/* Single Form Container (Bound to sticky top header Save) */}

      <form
        id="admin-active-form"
        onSubmit={handleSubmit}
        onChange={() => setIsDirty && setIsDirty(true)}
        onInput={() => setIsDirty && setIsDirty(true)}
        className="admin-form-container"
      >
        {/* MODULE 1: HERO & BANNER */}
        {activeTab === 'hero' && (
          <div>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
              🖼️ {tLabel('हीरो बैनर एवं मुख्य शीर्षक सेटिंग्स', 'Hero Banner & Title Configurations')}
            </h3>

            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label>{tLabel('मुख्य पुस्तक / बैनर शीर्षक (Devanagari Heading)', 'Primary Hero Heading')}</label>
                <input
                  className="admin-input"
                  value={heroForm.hero_title}
                  onChange={e => setHeroForm({ ...heroForm, hero_title: e.target.value })}
                  placeholder="अग्नि कलश"
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label>{tLabel('उप-शीर्षक / टैगलाइन (Tagline Description)', 'Hero Subtitle / Tagline')}</label>
                <input
                  className="admin-input"
                  value={heroForm.hero_subtitle}
                  onChange={e => setHeroForm({ ...heroForm, hero_subtitle: e.target.value })}
                  placeholder='"हिंदी काव्य और ओजस्वी चेतना की अमर गाथा"'
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label>{tLabel('हीरो बैनर / पुस्तक कवर फोटो (Banner Image)', 'Hero Banner Image')}</label>
                {heroImgPreview && (
                  <div style={{ marginBottom: '12px' }}>
                    <img
                      src={heroImgPreview}
                      alt="Hero Preview"
                      style={{ maxHeight: '110px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.8)', background: '#FFF' }}
                    />
                  </div>
                )}
                <input
                  className="admin-input"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHeroImg}
                />
                {uploadingHeroImg && <div style={{ color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>{tLabel('अपलोड हो रहा है...', 'Uploading image...')}</div>}
              </div>

              <div className="admin-form-group">
                <label>{tLabel('प्राथमिक बटन टेक्स्ट (Primary CTA Label)', 'Primary Button Label')}</label>
                <input
                  className="admin-input"
                  value={heroForm.cta_primary_label}
                  onChange={e => setHeroForm({ ...heroForm, cta_primary_label: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>{tLabel('प्राथमिक बटन यूआरएल (Primary CTA URL)', 'Primary Button URL')}</label>
                <input
                  className="admin-input"
                  value={heroForm.cta_primary_url}
                  onChange={e => setHeroForm({ ...heroForm, cta_primary_url: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>{tLabel('द्वितीयक बटन टेक्स्ट (Secondary CTA Label)', 'Secondary Button Label')}</label>
                <input
                  className="admin-input"
                  value={heroForm.cta_secondary_label}
                  onChange={e => setHeroForm({ ...heroForm, cta_secondary_label: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>{tLabel('द्वितीयक बटन यूआरएल (Secondary CTA URL)', 'Secondary Button URL')}</label>
                <input
                  className="admin-input"
                  value={heroForm.cta_secondary_url}
                  onChange={e => setHeroForm({ ...heroForm, cta_secondary_url: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: KAVI PARICHAY PREVIEW */}
        {activeTab === 'about' && (
          <div>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
              👤 {tLabel('मुख्य पृष्ठ परिचय सारांश (Kavi Parichay Preview)', 'Poet Biography Excerpt')}
            </h3>

            <div style={{ background: '#FFF', padding: '16px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '20px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '1.02rem', color: 'var(--leona-charcoal)' }}>
                <input
                  type="checkbox"
                  className="admin-item-checkbox"
                  checked={aboutConfig.use_custom_excerpt}
                  onChange={e => setAboutConfig({ ...aboutConfig, use_custom_excerpt: e.target.checked })}
                />
                {tLabel('मुख्य पृष्ठ हेतु विशेष सारांश दर्ज करें (Use Custom Short Intro)', 'Use Custom Short Intro for Home Page')}
              </label>
              <p style={{ margin: '6px 0 0 30px', fontSize: '0.88rem', color: '#666' }}>
                {tLabel(
                  'यदि यह चेक किया गया है, तो मुख्य पृष्ठ पर मुख्य बायोग्राफी के स्थान पर नीचे दिया गया विशेष संक्षेप प्रदर्शित होगा।',
                  'When checked, the home page displays the custom excerpt below instead of the auto-preview from the main biography page.'
                )}
              </p>
            </div>

            {aboutConfig.use_custom_excerpt ? (
              <div className="admin-form-group full-width">
                <label>{tLabel('विशेष मुख्य पृष्ठ परिचय पाठ (Custom Excerpt Text)', 'Custom Home Page Excerpt Text')}</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={aboutConfig.custom_excerpt}
                  onChange={e => setAboutConfig({ ...aboutConfig, custom_excerpt: e.target.value })}
                  placeholder="कवि गुरुप्रताप शर्मा 'आग' का संक्षिप्त परिचय यहाँ लिखें..."
                />
              </div>
            ) : (
              <div style={{ background: '#FDFBF7', padding: '16px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.6)' }}>
                <div style={{ fontWeight: 600, color: 'var(--leona-terracotta)', marginBottom: '6px' }}>
                  ℹ️ {tLabel('स्वचालित परिचय पूर्वावलोकन (Auto Biography Preview)', 'Auto Biography Preview from /parichay')}
                </div>
                <p style={{ fontSize: '0.94rem', color: 'var(--leona-text-main)', lineHeight: '1.6', margin: 0 }}>
                  "{about?.truncated_preview || (about?.body_text ? about.body_text.substring(0, 180) + '...' : tLabel('कोई परिचय उपलब्ध नहीं है।', 'No biography available.'))}"
                </p>
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '12px', background: '#EAF8F5', borderRadius: '8px', border: '1px solid #B5E8E2', fontSize: '0.88rem', color: '#2C988F' }}>
              ✓ {tLabel('मुख्य पृष्ठ पर हमेशा "पूरा परिचय पढ़ें →" लिंक बटन प्रदर्शित रहेगा जो पाठक को विस्तृत बायोग्राफी (/parichay) पर ले जाएगा।', 'The "Read Full Bio →" button will always render on the home page linking to /parichay.')}
            </div>
          </div>
        )}

        {/* MODULE 3: FEATURED WORKS SHOWCASE */}
        {activeTab === 'featured' && (
          <div>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
              📚 {tLabel('प्रमुख रचनाएं एवं पुस्तकें (Featured Works Showcase)', 'Featured Poems & Books Showcase')}
            </h3>

            {/* Single Row Limits Configuration */}
            <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                ⚙️ {tLabel('होम पेज प्रदर्शित कार्ड सीमा (Single-Row Card Limits)', 'Home Page Single-Row Display Limits')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
                    {tLabel('काव्य संग्रह कार्ड सीमा (Max Poems on Home Page)', 'Max Poems on Home Page')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="admin-input"
                    value={poemsLimit}
                    onChange={(e) => {
                      setPoemsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
                      if (setIsDirty) setIsDirty(true)
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
                    {tLabel('प्रकाशन कार्ड सीमा (Max Books on Home Page)', 'Max Publications on Home Page')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="admin-input"
                    value={pubsLimit}
                    onChange={(e) => {
                      setPubsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
                      if (setIsDirty) setIsDirty(true)
                    }}
                  />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                💡 {tLabel('होम पेज पर केवल एक पंक्ति (single row) में दिखने वाले कार्ड्स की अधिकतम संख्या set करें।', 'Set the maximum number of cards displayed in a single row on the public home page.')}
              </p>
            </div>

            {/* Featured Poems Sub-Section */}
            <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                  ✍️ {tLabel('1. मुख्य पृष्ठ काव्य रचनाएं (Featured Poems)', '1. Featured Poems')}
                </h4>
                <span className="admin-toolbar-count">
                  📌 {featuredPoems.length}/6 {tLabel('रचनाएं चयनित', 'Poems Selected')}
                </span>
              </div>

              {/* Search Picker for Adding Poems */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <select
                  className="admin-input"
                  style={{ flex: 1 }}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (id && !featuredPoems.includes(id)) {
                      if (featuredPoems.length >= 6) {
                        alert(tLabel('अधिकतम 6 रचनाएं ही चुनी जा सकती हैं।', 'Maximum 6 poems allowed.'))
                        return
                      }
                      setFeaturedPoems([...featuredPoems, id])
                      if (setIsDirty) setIsDirty(true)
                    }
                  }}
                >
                  <option value="">-- {tLabel('काव्य संग्रह से रचना चुनें व जोड़ें...', 'Select poem to add to featured list...')} --</option>
                  {safePoems
                    .filter(p => !featuredPoems.includes(p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.heading_hi || p.heading_en || p.heading || 'Untitled'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Featured Poems Ordered List */}
              {featuredPoems.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई रचना चयनित नहीं है।', 'No featured poems selected.')}</p>
              ) : (
                <ul className="admin-item-list">
                  {featuredPoems.map((id, index) => {
                    const poemObj = safePoems.find(p => p.id === id)
                    return (
                      <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
                            {poemObj ? (poemObj.heading_hi || poemObj.heading_en || poemObj.heading) : `Poem ID: ${id}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'up'))} disabled={index === 0}>
                            ⬆️
                          </button>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'down'))} disabled={index === featuredPoems.length - 1}>
                            ⬇️
                          </button>
                          <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPoems(featuredPoems.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
                            ✕
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Featured Publications Sub-Section */}
            <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                  📚 {tLabel('2. मुख्य पृष्ठ पुस्तकें (Featured Books)', '2. Featured Publications')}
                </h4>
                <span className="admin-toolbar-count">
                  📚 {featuredPubs.length}/6 {tLabel('पुस्तकें चयनित', 'Books Selected')}
                </span>
              </div>

              {/* Search Picker for Adding Publications */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <select
                  className="admin-input"
                  style={{ flex: 1 }}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (id && !featuredPubs.includes(id)) {
                      if (featuredPubs.length >= 6) {
                        alert(tLabel('अधिकतम 6 पुस्तकें ही चुनी जा सकती हैं।', 'Maximum 6 publications allowed.'))
                        return
                      }
                      setFeaturedPubs([...featuredPubs, id])
                      if (setIsDirty) setIsDirty(true)
                    }
                  }}
                >
                  <option value="">-- {tLabel('प्रकाशन सूची से पुस्तक चुनें व जोड़ें...', 'Select publication to add to featured list...')} --</option>
                  {safePubs
                    .filter(p => !featuredPubs.includes(p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title_hi || p.title_en || p.title || 'Untitled'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Featured Publications Ordered List */}
              {featuredPubs.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई पुस्तक चयनित नहीं है।', 'No featured publications selected.')}</p>
              ) : (
                <ul className="admin-item-list">
                  {featuredPubs.map((id, index) => {
                    const pubObj = safePubs.find(p => p.id === id)
                    return (
                      <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
                            {pubObj ? (pubObj.title_hi || pubObj.title_en || pubObj.title) : `Publication ID: ${id}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'up'))} disabled={index === 0}>
                            ⬆️
                          </button>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'down'))} disabled={index === featuredPubs.length - 1}>
                            ⬇️
                          </button>
                          <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPubs(featuredPubs.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
                            ✕
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* MODULE 4: HIGHLIGHTS & AWARDS */}
        {activeTab === 'highlights' && (
          <div>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
              🏆 {tLabel('मुख्य उपलब्धियां — टाइमलाइन व पुरस्कार', 'Highlights — Timeline & Awards Preview')}
            </h3>

            {/* Featured Timeline Sub-Section */}
            <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                  ⏳ {tLabel('1. जीवन यात्रा मील का पत्थर (Featured Timeline)', '1. Featured Timeline Milestones')}
                </h4>
                <span className="admin-toolbar-count">
                  ⏳ {featuredTimeline.length}/4 {tLabel('मील के पत्थर चयनित', 'Milestones Selected')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <select
                  className="admin-input"
                  style={{ flex: 1 }}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (id && !featuredTimeline.includes(id)) {
                      if (featuredTimeline.length >= 4) {
                        alert(tLabel('अधिकतम 4 मील के पत्थर ही चुने जा सकते हैं।', 'Maximum 4 timeline items allowed.'))
                        return
                      }
                      setFeaturedTimeline([...featuredTimeline, id])
                      if (setIsDirty) setIsDirty(true)
                    }
                  }}
                >
                  <option value="">-- {tLabel('टाइमलाइन से घटना चुनें व जोड़ें...', 'Select timeline milestone to add...')} --</option>
                  {safeTimeline
                    .filter(t => !featuredTimeline.includes(t.id))
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.year_display ? `[${t.year_display}] ` : ''}{t.title}
                      </option>
                    ))}
                </select>
              </div>

              {featuredTimeline.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई मील का पत्थर चयनित नहीं है।', 'No timeline milestones selected.')}</p>
              ) : (
                <ul className="admin-item-list">
                  {featuredTimeline.map((id, index) => {
                    const tmObj = safeTimeline.find(t => t.id === id)
                    return (
                      <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
                            {tmObj ? `${tmObj.year_display ? `[${tmObj.year_display}] ` : ''}${tmObj.title}` : `Timeline ID: ${id}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedTimeline(moveItemInArray(featuredTimeline, index, 'up'))} disabled={index === 0}>
                            ⬆️
                          </button>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedTimeline(moveItemInArray(featuredTimeline, index, 'down'))} disabled={index === featuredTimeline.length - 1}>
                            ⬇️
                          </button>
                          <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedTimeline(featuredTimeline.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
                            ✕
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Featured Awards Sub-Section */}
            <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                  🏆 {tLabel('2. मुख्य पुरस्कार व सम्मान (Featured Awards)', '2. Featured Awards & Honors')}
                </h4>
                <span className="admin-toolbar-count">
                  🏆 {featuredAwards.length}/4 {tLabel('पुरस्कार चयनित', 'Awards Selected')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <select
                  className="admin-input"
                  style={{ flex: 1 }}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (id && !featuredAwards.includes(id)) {
                      if (featuredAwards.length >= 4) {
                        alert(tLabel('अधिकतम 4 पुरस्कार ही चुने जा सकते हैं।', 'Maximum 4 awards allowed.'))
                        return
                      }
                      setFeaturedAwards([...featuredAwards, id])
                      if (setIsDirty) setIsDirty(true)
                    }
                  }}
                >
                  <option value="">-- {tLabel('पुरस्कार सूची से सम्मान चुनें व जोड़ें...', 'Select award to add...')} --</option>
                  {safeAwards
                    .filter(a => !featuredAwards.includes(a.id))
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.year_display ? `[${a.year_display}] ` : ''}{a.title}
                      </option>
                    ))}
                </select>
              </div>

              {featuredAwards.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई सम्मान चयनित नहीं है।', 'No featured awards selected.')}</p>
              ) : (
                <ul className="admin-item-list">
                  {featuredAwards.map((id, index) => {
                    const awObj = safeAwards.find(a => a.id === id)
                    return (
                      <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
                            {awObj ? `${awObj.year_display ? `[${awObj.year_display}] ` : ''}${awObj.title}` : `Award ID: ${id}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedAwards(moveItemInArray(featuredAwards, index, 'up'))} disabled={index === 0}>
                            ⬆️
                          </button>
                          <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedAwards(moveItemInArray(featuredAwards, index, 'down'))} disabled={index === featuredAwards.length - 1}>
                            ⬇️
                          </button>
                          <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedAwards(featuredAwards.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
                            ✕
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

// 2. Contact Section Manager Component (Contact Details + Inbox)
function ContactSectionManager({ settings, initialSubTab, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'info') // 'info' | 'inbox'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  return (
    <div>
      {subTab === 'info' && <ContactInfoForm settings={settings} onUpdate={onUpdate} setIsDirty={setIsDirty} />}
      {subTab === 'inbox' && <InboxManager onUpdate={onUpdate} />}
    </div>
  )
}

function ContactInfoForm({ settings, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [formData, setFormData] = useState({
    phone: '',
    phone_text: '',
    whatsapp: '',
    whatsapp_text: '',
    email: '',
    email_text: '',
    address: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        phone: settings.phone || '+91 76768 85989',
        phone_text: settings.phone_text || 'कॉल करें',
        whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
        whatsapp_text: settings.whatsapp_text || 'व्हाट्सएप करें',
        email: settings.email || 'contact@gurupratapsharma.com',
        email_text: settings.email_text || 'ईमेल भेजें',
        address: settings.address || 'साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        twitter: settings.twitter || '',
        linkedin: settings.linkedin || '',
        youtube: settings.youtube || ''
      })
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value !== undefined && value !== null ? String(value) : '',
        display_label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

      let hasError = false
      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' })
        if (error) {
          console.error('Error saving contact key ' + update.key + ':', error)
          hasError = true
        }
      }

      if (hasError) {
        alert(tLabel('चेतावनी: कुछ संपर्क विवरण सहेजे नहीं जा सके।', 'Warning: Some contact details could not be saved.'))
      } else {
        alert(tLabel('✓ संपर्क विवरण सफलतापूर्वक सहेजे गए!', '✓ Contact details saved successfully!'))
      }

      if (setIsDirty) setIsDirty(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving contact details:', err)
      alert(tLabel('त्रुटि: ' + (err.message || 'अज्ञात त्रुटि'), 'Error saving contact details: ' + (err.message || 'Unknown error')))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">📍 {tLabel('सार्वजनिक संपर्क जानकारी', 'Public Contact Details')}</h2>
      </div>

      <form
        id="admin-active-form"
        onSubmit={handleSubmit}
        onChange={() => setIsDirty && setIsDirty(true)}
        onInput={() => setIsDirty && setIsDirty(true)}
        className="admin-form-container"
      >
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>{tLabel('फोन नंबर', 'Phone Number')}</label>
            <input
              className="admin-input"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 76768 85989"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('फोन बटन टेक्स्ट', 'Phone Button Text')}</label>
            <input
              className="admin-input"
              value={formData.phone_text}
              onChange={e => setFormData({ ...formData, phone_text: e.target.value })}
              placeholder="Call me"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('व्हाट्सएप लिंक', 'WhatsApp Link')}</label>
            <input
              className="admin-input"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="https://wa.me/917676885989"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('व्हाट्सएप बटन टेक्स्ट', 'WhatsApp Button Text')}</label>
            <input
              className="admin-input"
              value={formData.whatsapp_text}
              onChange={e => setFormData({ ...formData, whatsapp_text: e.target.value })}
              placeholder="Whatsapp me"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('ईमेल पता', 'Email Address')}</label>
            <input
              className="admin-input"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@gurupratapsharma.com"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('ईमेल बटन टेक्स्ट', 'Email Button Text')}</label>
            <input
              className="admin-input"
              value={formData.email_text}
              onChange={e => setFormData({ ...formData, email_text: e.target.value })}
              placeholder="Email me"
            />
          </div>
          <div className="admin-form-group full-width">
            <label>{tLabel('संपर्क पता (स्थान)', 'Location Address')}</label>
            <input
              className="admin-input"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('फेसबुक प्रोफाइल लिंक', 'Facebook Profile Link')}</label>
            <input
              className="admin-input"
              value={formData.facebook}
              onChange={e => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="https://facebook.com/gurupratap"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('इंस्टाग्राम प्रोफाइल लिंक', 'Instagram Profile Link')}</label>
            <input
              className="admin-input"
              value={formData.instagram}
              onChange={e => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="https://instagram.com/gurupratap"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('ट्विटर / एक्स प्रोफाइल लिंक', 'Twitter/X Profile Link')}</label>
            <input
              className="admin-input"
              value={formData.twitter}
              onChange={e => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/gurupratap"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('लिंक्डइन प्रोफाइल लिंक', 'LinkedIn Profile Link')}</label>
            <input
              className="admin-input"
              value={formData.linkedin}
              onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/gurupratap"
            />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('यूट्यूब चैनल लिंक', 'YouTube Channel Link')}</label>
            <input
              className="admin-input"
              value={formData.youtube}
              onChange={e => setFormData({ ...formData, youtube: e.target.value })}
              placeholder="https://youtube.com/@gurupratap"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function AboutManager({ about, initialSubTab, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'bio') // 'bio' | 'timeline' | 'awards'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  const [formData, setFormData] = useState({
    author_name: "कवि गुरुप्रताप शर्मा 'आग'",
    hero_tag: "साहित्यिक जीवन परिचय",
    hero_subtitle: "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक",
    badge_text: "वरिष्ठ हिंदी साहित्यकार",
    quote_attribution: "गुरुप्रताप शर्मा 'आग'",
    title: 'जीवनी व साहित्यिक यात्रा',
    body_text: '',
    truncated_preview: '',
    photo_path: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (about) {
      setFormData({
        author_name: about.author_name || "कवि गुरुप्रताप शर्मा 'आग'",
        hero_tag: about.hero_tag || "साहित्यिक जीवन परिचय",
        hero_subtitle: about.hero_subtitle || about.subtitle || "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक",
        badge_text: about.badge_text || "वरिष्ठ हिंदी साहित्यकार",
        quote_attribution: about.quote_attribution || "गुरुप्रताप शर्मा 'आग'",
        title: about.title || 'जीवनी व साहित्यिक यात्रा',
        body_text: about.body_text || '',
        truncated_preview: about.truncated_preview || '',
        photo_path: about.photo_path || ''
      })
      if (about.photo_path) {
        setPhotoPreview(getImageUrl(about.photo_path))
      }
    }
  }, [about])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    try {
      setUploadingPhoto(true)
      const fileName = `about-photo-${Date.now()}.${file.name.split('.').pop()}`
      const path = await uploadImage(file, 'authors', fileName)
      setFormData(prev => ({ ...prev, photo_path: path }))
      setPhotoPreview(URL.createObjectURL(file))
      alert('Photo uploaded successfully!')
    } catch (err) {
      alert('Error uploading photo: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const extraSettings = [
        { key: 'author_name', value: formData.author_name || "कवि गुरुप्रताप शर्मा 'आग'", display_label: 'Author Name' },
        { key: 'hero_tag', value: formData.hero_tag || "साहित्यिक जीवन परिचय", display_label: 'Hero Tag' },
        { key: 'hero_subtitle', value: formData.hero_subtitle || "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक", display_label: 'Hero Subtitle' },
        { key: 'badge_text', value: formData.badge_text || "वरिष्ठ हिंदी साहित्यकार", display_label: 'Badge Text' },
        { key: 'quote_attribution', value: formData.quote_attribution || "गुरुप्रताप शर्मा 'आग'", display_label: 'Quote Attribution' },
        { key: 'about_bio_overview', value: formData.truncated_preview || '', display_label: 'About Bio Overview' }
      ]

      const { error: settingsError } = await supabase.from('settings').upsert(extraSettings, { onConflict: 'key' })
      if (settingsError) {
        console.error("Save failed:", settingsError.message)
      }

      const aboutDataToSave = {
        title: formData.title || 'जीवनी व साहित्यिक यात्रा',
        body_text: formData.body_text || '',
        truncated_preview: formData.truncated_preview || '',
        photo_path: formData.photo_path || ''
      }

      const { error } = (about && about.id)
        ? await supabase.from('about_content').update(aboutDataToSave).eq('id', about.id)
        : await supabase.from('about_content').insert(aboutDataToSave)

      if (error) {
        console.error('Save failed:', error.message)
        alert('Error saving about content: ' + error.message)
        return
      }

      if (setIsDirty) setIsDirty(false)
      alert('✓ कवि परिचय एवं बैनर सफलतापूर्वक सहेजा गया! (Bio & Hero Saved)')
      onUpdate()
    } catch (err) {
      console.error('Save failed:', err.message || err)
      alert('Error saving about content: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div>
      {subTab === 'timeline' && <TimelineManager onUpdate={onUpdate} />}
      {subTab === 'awards' && <AwardsManager onUpdate={onUpdate} setIsDirty={setIsDirty} />}

      {subTab === 'bio' && (
        <div className="admin-card-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">📖 {tLabel('कवि परिचय व बैनर सम्पादन', 'Poet Biography & Hero Banner')}</h2>
          </div>

          <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container">
            <div style={{ background: 'var(--leona-sand-light, #FAF6F0)', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--leona-terracotta)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                🎯 {tLabel('हीरो बैनर व मुख्य शीर्षक पाठ', 'Hero Banner & Header Text')}
              </h4>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>{tLabel('बैनर टैग', 'Hero Tag Pill')}</label>
                  <input
                    className="admin-input"
                    value={formData.hero_tag}
                    onChange={(e) => setFormData({ ...formData, hero_tag: e.target.value })}
                    placeholder="साहित्यिक जीवन परिचय"
                  />
                </div>
                <div className="admin-form-group">
                  <label>{tLabel('कवि का नाम *', 'Poet Full Name *')}</label>
                  <input
                    className="admin-input"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label>{tLabel('मुख्य उप-शीर्षक / टैगलाइन *', 'Hero Subtitle / Tagline *')}</label>
                  <input
                    className="admin-input"
                    value={formData.hero_subtitle}
                    onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>{tLabel('बैज पाठ', 'Badge Tag')}</label>
                  <input
                    className="admin-input"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>{tLabel('उद्धरण श्रेय (Quote Attribution)', 'Quote Attribution')}</label>
                  <input
                    className="admin-input"
                    value={formData.quote_attribution}
                    onChange={(e) => setFormData({ ...formData, quote_attribution: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                🖼️ {tLabel('कवि की तस्वीर', 'Poet Photograph')}
              </h4>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Author Preview"
                    style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--leona-gold)' }}
                  />
                ) : (
                  <div style={{ width: '100px', height: '120px', background: '#F4EFE6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.8rem' }}>
                    {tLabel('कोई फोटो नहीं', 'No Photo')}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    style={{ marginBottom: '8px', display: 'block' }}
                  />
                  <small style={{ color: '#666', display: 'block' }}>
                    {uploadingPhoto ? tLabel('अपलोड हो रहा है...', 'Uploading photo...') : tLabel('कवि परिचय के लिए उपयुक्त पोर्ट्रेट चित्र चुनें (JPG/PNG)', 'Select author portrait photo')}
                  </small>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                📝 {tLabel('विस्तृत जीवन परिचय (बायोग्राफी गद्य)', 'Biography Text & Prose')}
              </h4>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>{tLabel('बायोग्राफी शीर्षक *', 'Biography Title *')}</label>
                  <input
                    className="admin-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label>{tLabel('मुख्य पृष्ठ संक्षेप (Truncated Preview Text)', 'Homepage Short Summary')}</label>
                  <textarea
                    className="admin-textarea"
                    value={formData.truncated_preview}
                    onChange={(e) => setFormData({ ...formData, truncated_preview: e.target.value })}
                    rows={3}
                    placeholder="मुख्य पृष्ठ पर प्रदर्शित होने वाला संक्षेप..."
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label>{tLabel('पूर्ण बायोग्राफी पाठ (Full Prose Text) *', 'Full Biography Prose Text *')}</label>
                  <textarea
                    className="admin-textarea"
                    value={formData.body_text}
                    onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                    style={{ minHeight: '220px', lineHeight: '1.7' }}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function PoemsArchiveManager({ poems, categories, initialSubTab, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'poems') // 'poems' | 'categories'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  return (
    <div>
      {subTab === 'poems' && <PoemsManager poems={poems} onUpdate={onUpdate} setIsDirty={setIsDirty} />}
      {subTab === 'categories' && <CategoriesManager categories={categories} onUpdate={onUpdate} setIsDirty={setIsDirty} />}
    </div>
  )
}


function PublicationsManager({ publications, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_path: '',
    image_alt: '',
    description: '',
    sort_order: 1
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [itemsList, setItemsList] = useState(Array.isArray(publications) ? publications : [])
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    if (Array.isArray(publications)) {
      setItemsList(publications)
    }
  }, [publications])

  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }))
    if (setIsDirty) setIsDirty(true)
  }

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const displayList = itemsList.length > 0 ? itemsList : (Array.isArray(publications) ? publications : [])
  const singleSelectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const singleIndex = singleSelectedId ? displayList.findIndex(i => i.id === singleSelectedId) : -1

  const handleCreate = () => {
    setEditing(null)
    setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 1, is_active: true })
    setImagePreview(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setImagePreview(null)
    if (setIsDirty) setIsDirty(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    try {
      setUploadingImage(true)
      const pubId = editing || `temp-${Date.now()}`
      const fileName = `cover.${file.name.split('.').pop()}`
      const path = await uploadImage(file, `publications/${pubId}`, fileName)
      setFormData({ ...formData, image_path: path })
      setImagePreview(URL.createObjectURL(file))
      alert('Image uploaded!')
    } catch (err) {
      alert('Error uploading image: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Rule 2: New records get sort_order = 1 (top priority index)
      const dataToSave = {
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        image_path: formData.image_path || '',
        image_alt: formData.image_alt || '',
        description: formData.description || '',
        sort_order: editing ? (parseInt(formData.sort_order) || 1) : 1
      }
      
      if (editing) {
        const { error } = await supabase.from('publications').update(dataToSave).eq('id', editing)
        if (error) {
          alert('Error saving publication: ' + error.message)
          return
        }
      } else {
        const { data: newPub, error } = await supabase.from('publications').insert(dataToSave).select().single()
        if (error) {
          alert('Error saving publication: ' + error.message)
          return
        }
        if (formData.image_path && formData.image_path.includes('temp-') && newPub) {
          const oldPath = formData.image_path
          const newPath = oldPath.replace(/temp-\d+/, newPub.id)
          try {
            const { error: copyError } = await supabase.storage.from('public-assets').copy(oldPath, newPath)
            if (!copyError) {
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
              await supabase.storage.from('public-assets').remove([oldPath])
            } else {
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
            }
          } catch (moveError) {
            await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
          }
        }
      }

      if (setIsDirty) setIsDirty(false)
      onUpdate()
      setEditing(null)
      setShowForm(false)
      clearSelection()
      setImagePreview(null)
      alert('✓ Publication saved successfully!')
    } catch (err) {
      alert('Error saving publication: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEditSelected = () => {
    if (!singleSelectedId) return
    const pub = displayList.find(i => i.id === singleSelectedId)
    if (!pub) return
    setEditing(pub.id)
    setShowForm(true)
    setFormData({
      ...pub,
      is_active: pub.is_active !== undefined ? pub.is_active : true
    })
    if (pub.image_path) {
      setImagePreview(getImageUrl(pub.image_path))
    }
  }

  const persistReorder = async (updated) => {
    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItemsList(updated)
    try {
      for (const item of updated) {
        await supabase.from('publications').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {
      console.warn('Publication resequence error:', e)
    }
    onUpdate()
  }

  const handleMoveTop = () => {
    if (singleIndex <= 0) return
    const item = displayList[singleIndex]
    const updated = [item, ...displayList.filter((_, i) => i !== singleIndex)]
    persistReorder(updated)
    clearSelection()
  }

  const handleMoveUp = () => {
    if (singleIndex <= 0) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex - 1]
    updated[singleIndex - 1] = temp
    persistReorder(updated)
  }

  const handleMoveDown = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex + 1]
    updated[singleIndex + 1] = temp
    persistReorder(updated)
  }

  const handleMoveBottom = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const item = displayList[singleIndex]
    const updated = [...displayList.filter((_, i) => i !== singleIndex), item]
    persistReorder(updated)
    clearSelection()
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(tLabel(`क्या आप चयनित ${selectedIds.length} पुस्तकें हटाना चाहते हैं?`, `Delete ${selectedIds.length} selected books?`))) return

    const updated = displayList.filter(i => !selectedIds.includes(i.id))
    setItemsList(updated)
    clearSelection()

    try {
      await supabase.from('publications').delete().in('id', selectedIds)
    } catch (e) {
      console.warn('Batch delete publications error:', e)
    }
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">📚 {tLabel('प्रकाशन एवं पुस्तकें', 'Publications & Books')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नई पुस्तक जोड़ें', 'Add Book')}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('पुस्तक का नाम *', 'Book Title *')}</label>
              <input
                className="admin-input"
                value={formData.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('उप-शीर्षक', 'Subtitle')}</label>
              <input
                className="admin-input"
                value={formData.subtitle}
                onChange={(e) => updateForm({ subtitle: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('कवर चित्र', 'Book Cover Image')}</label>
              {imagePreview && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={imagePreview} 
                    alt="Cover Preview" 
                    style={{ 
                      width: '120px', 
                      height: '170px', 
                      objectFit: 'cover', 
                      border: '2px solid var(--leona-gold)',
                      borderRadius: '8px'
                    }} 
                  />
                </div>
              )}
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>कवर फोटो अपलोड हो रही है...</div>}
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('पुस्तक विवरण', 'Book Description')}</label>
              <textarea
                className="admin-textarea"
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => updateForm({ is_active: e.target.checked })}
                />
                {tLabel('वेबसाइट पर प्रकाशित रखें', 'Active on Website')}
              </label>
            </div>
          </div>
        </form>
      )}

      <div>
        <ListContextualToolbar
          selectedIds={selectedIds}
          totalItems={displayList.length}
          onClearSelection={clearSelection}
          onEdit={handleEditSelected}
          onMoveTop={handleMoveTop}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveBottom={handleMoveBottom}
          onBatchDelete={handleBatchDelete}
          tLabel={tLabel}
        />

        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          {tLabel('प्रकाशित पुस्तकों की सूची', 'Published Books List')} ({displayList.length})
        </h3>
        {displayList.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई पुस्तक नहीं मिली। नई पुस्तक जोड़ने के लिए बटन दबाएं।', 'No books found. Click button to add new book.')}</p>
        ) : (
          <ul className="admin-item-list">
            {displayList.map((pub) => {
              const isSelected = selectedIds.includes(pub.id)
              return (
                <li key={pub.id} className={`admin-item-card ${isSelected ? 'selected' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <input
                      type="checkbox"
                      className="admin-item-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(pub.id)}
                    />
                    <div>
                      <div className="admin-item-title">{pub.title}</div>
                      <div className="admin-item-sub">{pub.subtitle || pub.description ? (pub.subtitle || pub.description).substring(0, 80) + '...' : ''} • {tLabel('क्रम:', 'Order:')} {pub.sort_order || 1}</div>
                    </div>
                  </div>
                  <div className="admin-actions-group">
                    {pub.is_active === false ? (
                      <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>{tLabel('अप्रकाशित', 'Draft')}</span>
                    ) : (
                      <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>{tLabel('प्रकाशित', 'Live')}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}


// Poems Manager Component

function PoemsManager({ poems, onUpdate, setIsDirty }) {
  const { adminLang, tLabel } = useAdminLang()
  const { id: paramId } = useParams()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showCanvasModal, setShowCanvasModal] = useState(false)
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    body_text: '',
    sort_order: 1
  })
  const [itemsList, setItemsList] = useState(Array.isArray(poems) ? poems : [])
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    if (Array.isArray(poems)) {
      setItemsList(poems)
    }
  }, [poems])

  // Sync route param (standalone editor route: /admin/kavya-sangrah/:id or /admin/poems/:id)
  useEffect(() => {
    if (!paramId) {
      setShowForm(false)
      setEditing(null)
      return
    }

    if (paramId === 'new') {
      setEditing(null)
      setFormData({ heading: '', description: '', body_text: '', sort_order: 1 })
      setShowForm(true)
    } else {
      const poem = (itemsList.length > 0 ? itemsList : poems)?.find(i => String(i.id) === String(paramId))
      if (poem) {
        setEditing(poem.id)
        setShowForm(true)
        setFormData({
          heading: poem.heading || poem.heading_hi || poem.heading_en || '',
          description: poem.description || '',
          body_text: poem.full_text || poem.body_text_hi || poem.body_text_en || '',
          sort_order: poem.sort_order || 1
        })
      } else if (paramId) {
        // Direct URL paste fallback
        supabase.from('poems').select('*').eq('id', paramId).single().then(({ data }) => {
          if (data) {
            setEditing(data.id)
            setShowForm(true)
            setFormData({
              heading: data.heading || data.heading_hi || data.heading_en || '',
              description: data.description || '',
              body_text: data.full_text || data.body_text_hi || data.body_text_en || '',
              sort_order: data.sort_order || 1
            })
          }
        })
      }
    }
  }, [paramId, poems, itemsList])

  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }))
    if (setIsDirty) setIsDirty(true)
  }

  const displayList = itemsList.length > 0 ? itemsList : (Array.isArray(poems) ? poems : [])

  const handleCreate = () => {
    navigate('/admin/kavya-sangrah/new')
  }

  const handleBackToList = () => {
    // Prompt if user has unsaved changes
    if (setIsDirty) {
      const confirmLeave = window.confirm(
        tLabel(
          'आपके पास सहेजे न गए बदलाव हैं! क्या आप वाकई बिना सहेजे काव्य संग्रह सूची पर वापस जाना चाहते हैं?',
          'You have unsaved changes! Are you sure you want to return to the poems list without saving?'
        )
      )
      if (!confirmLeave) return
      setIsDirty(false)
    }
    navigate('/admin/kavya-sangrah')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = {
        heading: formData.heading || '',
        description: formData.description || '',
        full_text: formData.body_text || '',
        language: 'mixed',
        sort_order: editing ? (parseInt(formData.sort_order) || 1) : 1
      }
      
      let res = editing
        ? await supabase.from('poems').update(dataToSave).eq('id', editing)
        : await supabase.from('poems').insert(dataToSave)

      if (res.error) {
        console.warn('Standard poem save failed, trying legacy schema:', res.error)
        const legacyPayload = {
          heading_hi: formData.heading || '',
          heading_en: formData.heading || '',
          body_text_hi: formData.body_text || '',
          body_text_en: formData.body_text || '',
          description: formData.description || '',
          sort_order: editing ? (parseInt(formData.sort_order) || 1) : 1
        }
        res = editing
          ? await supabase.from('poems').update(legacyPayload).eq('id', editing)
          : await supabase.from('poems').insert(legacyPayload)
      }

      if (res.error) {
        alert((adminLang === 'en' ? 'Error saving poem: ' : 'कविता सहेजने में त्रुटि: ') + res.error.message)
        return
      }

      if (setIsDirty) setIsDirty(false)
      onUpdate()
      alert(adminLang === 'en' ? '✓ Poem published & saved successfully!' : '✓ रचना सफलतापूर्वक प्रकाशित की गई!')
      navigate('/admin/kavya-sangrah')
    } catch (err) {
      alert((adminLang === 'en' ? 'Error saving poem: ' : 'कविता सहेजने में त्रुटि: ') + (err.message || 'Unknown error'))
    }
  }

  const persistReorder = async (updated) => {
    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItemsList(updated)
    try {
      for (const item of updated) {
        await supabase.from('poems').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {
      console.warn('Poem resequence error:', e)
    }
    onUpdate()
  }

  const handleCardMoveUp = (id) => {
    const idx = displayList.findIndex(i => i.id === id)
    if (idx <= 0) return
    const updated = [...displayList]
    const temp = updated[idx]
    updated[idx] = updated[idx - 1]
    updated[idx - 1] = temp
    persistReorder(updated)
  }

  const handleCardMoveDown = (id) => {
    const idx = displayList.findIndex(i => i.id === id)
    if (idx < 0 || idx >= displayList.length - 1) return
    const updated = [...displayList]
    const temp = updated[idx]
    updated[idx] = updated[idx + 1]
    updated[idx + 1] = temp
    persistReorder(updated)
  }

  const handleCardDelete = async (id) => {
    if (!confirm(tLabel('क्या आप इस कविता को हटाना चाहते हैं?', 'Are you sure you want to delete this poem?'))) return
    const updated = displayList.filter(i => i.id !== id)
    setItemsList(updated)
    try {
      await supabase.from('poems').delete().eq('id', id)
    } catch (e) {
      console.warn('Delete poem error:', e)
    }
    onUpdate()
  }

  const handleDescriptionChange = (e) => {
    let val = e.target.value
    let lines = val.split('\n')
    if (lines.length > 2) lines = lines.slice(0, 2)
    lines = lines.map(line => line.substring(0, 80))
    let finalVal = lines.join('\n').substring(0, 160)
    updateForm({ description: finalVal })
  }

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      const lines = (formData.description || '').split('\n')
      if (lines.length >= 2) e.preventDefault()
    }
  }

  const isStandalonePage = Boolean(paramId)

  return (
    <div className="admin-card-panel">
      {/* Top Breadcrumb Header for Standalone Edit Route */}
      {isStandalonePage ? (
        <div className="admin-breadcrumb-bar">
          <button
            type="button"
            className="admin-back-btn"
            onClick={handleBackToList}
          >
            ← {tLabel('काव्य संग्रह सूची पर वापस जाएं', 'Back to Poems List')}
          </button>
          <div className="admin-breadcrumb-path">
            <span>✍️ {tLabel('काव्य संग्रह', 'Kavya Sangrah')}</span>
            <span className="admin-breadcrumb-sep">&gt;</span>
            <span className="admin-breadcrumb-active">
              {paramId === 'new'
                ? tLabel('नई रचना जोड़ें', 'Add New Poem')
                : (formData.heading || tLabel('कविता संपादन', 'Edit Poem'))}
            </span>
          </div>
        </div>
      ) : (
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">✍️ {tLabel('काव्य रचनाएं एवं पद', 'Poems & Verse Collection')}</h2>
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नई रचना जोड़ें', 'Add New Poem')}
          </button>
        </div>
      )}

      {/* Main Standalone Form */}
      {(showForm || editing || isStandalonePage) && (
        <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label>{tLabel('कविता / रचना का शीर्षक *', 'Poem Title *')}</label>
              <input
                className="admin-input"
                value={formData.heading || ''}
                onChange={(e) => updateForm({ heading: e.target.value })}
                placeholder={tLabel('जैसे: सुबह की किरण', 'e.g. Subah Ki Kiran')}
                required
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('रचना संदर्भ / संक्षिप्त विवरण (अधिकतम २ पंक्तियाँ, १६० अक्षर)', 'Context / Brief Description (Max 2 lines, 160 chars)')}</label>
              <textarea
                className="admin-textarea"
                rows={2}
                maxLength={160}
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder={tLabel('संक्षिप्त २ पंक्तियों में संदर्भ (अधिकतम ८० अक्षर प्रति पंक्ति)...', 'Brief 2-line context (max 80 chars per line)...')}
                style={{ minHeight: '52px', maxHeight: '72px', resize: 'none' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#888', display: 'block', marginTop: '4px' }}>
                {(formData.description || '').split('\n').length} / 2 {tLabel('पंक्तियां', 'lines')} | {(formData.description || '').length} / 160 {tLabel('अक्षर', 'chars')}
              </span>
            </div>

            {/* PageMaker Canvas Fullscreen Trigger Button */}
            <div className="admin-form-group full-width" style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '1.02rem', color: 'var(--leona-terracotta)', marginBottom: '8px', display: 'block' }}>
                🖋️ {tLabel('पेजमेकर कैनवस (PM5)', 'PageMaker Canvas (PM5)')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn-primary pm5-trigger-btn"
                  onClick={() => setShowCanvasModal(true)}
                  style={{
                    background: '#8B4513',
                    borderColor: '#8B4513',
                    padding: '10px 20px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  🎨 {tLabel('Edit Page Maker Canvas', 'Edit Page Maker Canvas')}
                </button>
                <span style={{ fontSize: '0.85rem', color: '#6E665E' }}>
                  💡 {tLabel('फुलस्क्रीन डिस्ट्रैक्शन-फ्री कैनवस एडिटर खोलने के लिए दबाएं', 'Click to open distraction-free canvas editor')}
                </span>
              </div>
            </div>

            {/* Fullscreen PM5 Canvas Portal Overlay */}
            {showCanvasModal && (
              <PM5WritingDesk
                initialPages={paginateTextIntoPages(formData.body_text || '')}
                initialTitle={formData.heading || ''}
                lang={adminLang}
                initialFullscreen={true}
                onClose={() => setShowCanvasModal(false)}
                onSave={(pagesArray, pageTitle) => {
                  const joinedText = pagesArray.join('\n\n');
                  if (setIsDirty) setIsDirty(true);
                  setFormData(prev => ({
                    ...prev,
                    body_text: joinedText,
                    heading: pageTitle || prev.heading
                  }));
                }}
              />
            )}

            <div className="admin-form-group full-width">
              <label>{tLabel('सम्पूर्ण कविता पंक्तियाँ *', 'Full Stanzas / Verse Text *')}</label>
              <textarea
                className="admin-textarea"
                value={formData.body_text || ''}
                onChange={(e) => updateForm({ body_text: e.target.value })}
                required
                style={{ minHeight: '220px', fontFamily: 'Tiro Devanagari Hindi, Lora, serif', fontSize: '1.05rem', lineHeight: '1.7' }}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </form>
      )}

      {/* Poem List Grid - Hidden when in standalone edit page */}
      {!isStandalonePage && (
        <div>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
            {tLabel('कुल काव्य रचनाएं', 'Total Poems Collection')} ({displayList.length})
          </h3>
          {displayList.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई कविता नहीं मिली। नई रचना जोड़ने के लिए बटन दबाएं।', 'No poems found. Click button to add new poem.')}</p>
          ) : (
            <ul className="admin-item-list">
              {displayList.map((poem) => {
                const isHovered = hoveredId === poem.id
                return (
                  <li
                    key={poem.id}
                    className={`admin-item-card poem-hover-card ${isHovered ? 'is-hovered' : ''}`}
                    onMouseEnter={() => setHoveredId(poem.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <div>
                        <div className="admin-item-title">{poem.heading || poem.heading_hi || poem.heading_en || 'Untitled'}</div>
                        <div className="admin-item-sub">{tLabel('क्रम:', 'Order:')} {poem.sort_order || 1}</div>
                      </div>
                    </div>

                    {/* Hover Action Bar with Text-Only Badges */}
                    <div className={`poem-card-hover-actions ${isHovered ? 'visible' : ''}`}>
                      <button
                        type="button"
                        className="poem-hover-badge badge-edit"
                        onClick={() => navigate(`/admin/kavya-sangrah/${poem.id}`)}
                        title={tLabel('संपादित करें', 'Edit Poem')}
                      >
                        {tLabel('संपादित करें', 'Edit')}
                      </button>
                      <button
                        type="button"
                        className="poem-hover-badge badge-move"
                        onClick={() => handleCardMoveUp(poem.id)}
                        disabled={displayList.findIndex(i => i.id === poem.id) === 0}
                        title={tLabel('ऊपर ले जाएं', 'Move Up')}
                      >
                        {tLabel('ऊपर ले जाएं', 'Move Up')}
                      </button>
                      <button
                        type="button"
                        className="poem-hover-badge badge-move"
                        onClick={() => handleCardMoveDown(poem.id)}
                        disabled={displayList.findIndex(i => i.id === poem.id) === displayList.length - 1}
                        title={tLabel('नीचे ले जाएं', 'Move Down')}
                      >
                        {tLabel('नीचे ले जाएं', 'Move Down')}
                      </button>
                      <button
                        type="button"
                        className="poem-hover-badge badge-delete"
                        onClick={() => handleCardDelete(poem.id)}
                        title={tLabel('हटाएं', 'Delete Poem')}
                      >
                        {tLabel('हटाएं', 'Delete')}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}


// Settings Manager Component

function SettingsManager({ settings, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [formData, setFormData] = useState({
    site_title: '',
    meta_description: '',
    meta_keywords: '',
    social_share_image: '',
    logo_path: '',
    default_accent: '#964B00',
    copyright_text: '',
    thank_you_title: '',
    thank_you_message: '',
    thank_you_heading: '',
    thank_you_description: '',
    thank_you_button_text: '',
    hero_tagline_hi: '',
    hero_tagline_en: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [shareImagePreview, setShareImagePreview] = useState(null)

  useEffect(() => {
    if (settings) {
      setFormData({
        site_title: settings.site_title || 'कवि गुरुप्रताप शर्मा "आग" | आधिकारिक वेबसाइट',
        meta_description: settings.meta_description || 'कवि गुरुप्रताप शर्मा "आग" की हिंदी काव्य संग्रह, कविताएं एवं साहित्यिक कृतियों का आधिकारिक डिजिटल संग्रह।',
        meta_keywords: settings.meta_keywords || 'कवि, गुरुप्रताप शर्मा, आग, हिंदी काव्य, हिंदी साहित्य, ओजस्वी कविताएं, कविताएं, राजस्थान',
        social_share_image: settings.social_share_image || settings.logo_path || '',
        logo_path: settings.logo_path || '',
        default_accent: settings.default_accent || '#964B00',
        copyright_text: settings.copyright_text || '© सर्वाधिकार सुरक्षित - कवि गुरुप्रताप शर्मा "आग"',
        thank_you_title: settings.thank_you_title || 'धन्यवाद!',
        thank_you_message: settings.thank_you_message || 'आपके संदेश के लिए धन्यवाद!',
        thank_you_heading: settings.thank_you_heading || '',
        thank_you_description: settings.thank_you_description || '',
        thank_you_button_text: settings.thank_you_button_text || 'ठीक है',
        hero_tagline_hi: settings.hero_tagline_hi || 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध',
        hero_tagline_en: settings.hero_tagline_en || 'Renowned for his fiery literary works'
      })
      if (settings.social_share_image || settings.logo_path) {
        setShareImagePreview(getImageUrl(settings.social_share_image || settings.logo_path))
      }
    }
  }, [settings])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(tLabel('कृपया एक फोटो फाइल चुनें।', 'Please select an image file'))
      return
    }

    try {
      setUploadingImage(true)
      const fileName = `share-preview-${Date.now()}.${file.name.split('.').pop()}`
      const path = await uploadImage(file, 'logos', fileName)
      setFormData(prev => ({ ...prev, social_share_image: path, logo_path: path }))
      setShareImagePreview(URL.createObjectURL(file))
      if (setIsDirty) setIsDirty(true)
      alert(tLabel('सोशल शेयर फोटो अपलोड हो गई!', 'Share preview image uploaded!'))
    } catch (err) {
      alert(tLabel('अपलोड त्रुटि: ', 'Upload error: ') + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value !== undefined && value !== null ? String(value) : '',
        display_label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

      let hasError = false
      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' })
        if (error) {
          console.error('Error saving setting key ' + update.key + ':', error)
          hasError = true
        }
      }

      if (hasError) {
        alert(tLabel('चेतावनी: कुछ सेटिंग्स सहेजी नहीं जा सकीं।', 'Warning: Some settings could not be saved.'))
      } else {
        alert(tLabel('✓ वेबसाइट व एसईओ सेटिंग्स सफलतापूर्वक सहेजी गईं!', '✓ Website & SEO settings saved successfully!'))
      }

      if (setIsDirty) setIsDirty(false)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving settings:', err)
      alert(tLabel('त्रुटि: ', 'Error saving settings: ') + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">⚙️ {tLabel('वेबसाइट सेटिंग्स व एसईओ (SEO)', 'Site Settings & SEO Manager')}</h2>
      </div>

      <form
        id="admin-active-form"
        onSubmit={handleSubmit}
        onChange={() => setIsDirty && setIsDirty(true)}
        onInput={() => setIsDirty && setIsDirty(true)}
        className="admin-form-container"
      >
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px', borderBottom: '1px solid rgba(226, 215, 197, 0.6)', paddingBottom: '8px' }}>
          🔍 {tLabel('1. खोज इंजन अनुकूलन (SEO & Metadata)', '1. Search Engine Optimization (SEO & Meta)')}
        </h3>

        <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
          <div className="admin-form-group full-width">
            <label>{tLabel('वेबसाइट मुख्य शीर्षक (SEO Title)', 'Site Title (SEO Title)')}</label>
            <input
              className="admin-input"
              value={formData.site_title}
              onChange={e => setFormData({ ...formData, site_title: e.target.value })}
              placeholder='कवि गुरुप्रताप शर्मा "आग" | आधिकारिक वेबसाइट'
            />
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('एसईओ विवरण (Meta Description)', 'Meta Description')}</label>
            <textarea
              className="admin-input"
              rows={3}
              value={formData.meta_description}
              onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="कवि गुरुप्रताप शर्मा की काव्य रचनाओं का आधिकारिक संकलन..."
            />
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('खोज कीवर्ड्स (Meta Keywords)', 'Meta Keywords (Comma separated)')}</label>
            <input
              className="admin-input"
              value={formData.meta_keywords}
              onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="कवि, गुरुप्रताप शर्मा, आग, हिंदी काव्य, कविताएं"
            />
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('सोशल मीडिया शेयर फोटो (OpenGraph Image)', 'Social Share Preview Image (OG Image)')}</label>
            {shareImagePreview && (
              <div style={{ marginBottom: '12px' }}>
                <img
                  src={shareImagePreview}
                  alt="Social Share Preview"
                  style={{
                    maxHeight: '120px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid rgba(226, 215, 197, 0.8)',
                    background: '#FFFFFF',
                    padding: '4px'
                  }}
                />
              </div>
            )}
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            {uploadingImage && (
              <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>
                {tLabel('फोटो अपलोड हो रही है...', 'Uploading preview image...')}
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px', borderBottom: '1px solid rgba(226, 215, 197, 0.6)', paddingBottom: '8px' }}>
          🎨 {tLabel('2. थीम एवं सर्वाधिकार (Appearance & Copyright)', '2. Appearance & Copyright')}
        </h3>

        <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
          <div className="admin-form-group">
            <label>{tLabel('डिफ़ॉल्ट थीम रंग (Default Accent)', 'Default Accent Color')}</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                value={formData.default_accent}
                onChange={e => setFormData({ ...formData, default_accent: e.target.value })}
                style={{ width: '48px', height: '40px', padding: '2px', borderRadius: '6px', cursor: 'pointer' }}
              />
              <input
                className="admin-input"
                value={formData.default_accent}
                onChange={e => setFormData({ ...formData, default_accent: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('सर्वाधिकार संदेश (Copyright Notice)', 'Copyright Notice')}</label>
            <input
              className="admin-input"
              value={formData.copyright_text}
              onChange={e => setFormData({ ...formData, copyright_text: e.target.value })}
              placeholder='© सर्वाधिकार सुरक्षित - कवि गुरुप्रताप शर्मा "आग"'
            />
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('मुख्य पृष्ठ टैगलाइन (हिंदी)', 'Homepage Tagline (Hindi)')}</label>
            <input
              className="admin-input"
              value={formData.hero_tagline_hi}
              onChange={e => setFormData({ ...formData, hero_tagline_hi: e.target.value })}
              placeholder="साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध"
            />
          </div>
        </div>

        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px', borderBottom: '1px solid rgba(226, 215, 197, 0.6)', paddingBottom: '8px' }}>
          💬 {tLabel('3. पॉप-अप व संदेश (Thank You Popup Configuration)', '3. Thank You Popup Configuration')}
        </h3>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>{tLabel('धन्यवाद पॉप-अप शीर्षक', 'Thank You Title')}</label>
            <input
              className="admin-input"
              value={formData.thank_you_title}
              onChange={e => setFormData({ ...formData, thank_you_title: e.target.value })}
              placeholder="धन्यवाद!"
            />
          </div>

          <div className="admin-form-group full-width">
            <label>{tLabel('धन्यवाद संदेश', 'Thank You Message')}</label>
            <input
              className="admin-input"
              value={formData.thank_you_message}
              onChange={e => setFormData({ ...formData, thank_you_message: e.target.value })}
              placeholder="आपका संदेश सफलतापूर्वक प्राप्त हो गया है।"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

// Helper to extract numeric year from string (supports Hindi Devanagari १९४५ -> 1945)

function parseYearNumber(yearStr) {
  if (!yearStr) return 0
  const devanagariMap = { '०':0,'१':1,'२':2,'३':3,'४':4,'५':5,'६':6,'७':7,'८':8,'९':9 }
  const asciiStr = String(yearStr).replace(/[०-९]/g, match => devanagariMap[match])
  const match = asciiStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

// Timeline Manager Component

function TimelineManager({ onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ year_display: '', title: '', description: '', sort_order: 1 })
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetchTimeline()
  }, [])

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const displayList = items
  const singleSelectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const singleIndex = singleSelectedId ? displayList.findIndex(i => i.id === singleSelectedId) : -1

  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }))
    if (setIsDirty) setIsDirty(true)
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('timeline_milestones').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        setItems(data)
        localStorage.setItem('app_timeline_milestones', JSON.stringify(data))
      } else {
        const cached = localStorage.getItem('app_timeline_milestones')
        if (cached) {
          setItems(JSON.parse(cached))
        } else {
          const defaultItems = [
            { id: '1', year_display: '१९४५', title: 'जन्म एवं प्रारम्भिक शिक्षा', description: 'साहित्यिक वातावरण में बाल्यकाल व्यतीत हुआ। संस्कृत एवं हिंदी साहित्य में उच्च शिक्षा पूर्ण की।', sort_order: 1 },
            { id: '2', year_display: '१९६८', title: 'काव्य यात्रा का शुभारम्भ', description: 'प्रमुख राष्ट्रीय पत्र-पत्रिकाओं में कविताओं का प्रकाशन एवं कवि सम्मेलनों में ओजस्वी प्रस्तुति।', sort_order: 2 },
            { id: '3', year_display: '१९८५', title: "'अग्नि कलश' का प्रकाशन", description: "प्रसिद्ध काव्य कृति 'अग्नि कलश' का प्रथम संस्करण प्रकाशित, जिसे साहित्य जगत में अपार ख्याति मिली।", sort_order: 3 },
            { id: '4', year_display: '२०२६', title: '५० वर्ष का साहित्यिक अवदान', description: 'हिंदी काव्य सेवा के ५० वर्ष पूर्ण होने पर राष्ट्रीय स्तर पर नागरिक अभिनंदन।', sort_order: 4 }
          ]
          setItems(defaultItems)
          localStorage.setItem('app_timeline_milestones', JSON.stringify(defaultItems))
        }
      }
    } catch (e) {
      console.warn('Timeline fetch notice:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSortByYear = async () => {
    const sorted = [...items].sort((a, b) => parseYearNumber(a.year_display) - parseYearNumber(b.year_display))
    sorted.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(sorted)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(sorted))
    try {
      for (const item of sorted) {
        await supabase.from('timeline_milestones').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {}
    alert(tLabel('वर्षानुसार क्रमित कर दिया गया है!', 'Sorted chronologically by year!'))
    onUpdate()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let updatedList = []
    const newSortOrder = editingId ? (parseInt(formData.sort_order) || 1) : 1

    if (editingId && editingId !== 'new') {
      updatedList = items.map(i => i.id === editingId ? { ...i, ...formData } : i)
    } else {
      const newItem = { id: String(Date.now()), ...formData, sort_order: newSortOrder }
      updatedList = [newItem, ...items]
    }

    updatedList.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(updatedList)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updatedList))

    const cleanData = {
      year_display: formData.year_display || '',
      title: formData.title || '',
      description: formData.description || '',
      sort_order: newSortOrder
    }

    try {
      if (editingId && editingId !== 'new') {
        await supabase.from('timeline_milestones').update(cleanData).eq('id', editingId)
      } else {
        await supabase.from('timeline_milestones').insert(cleanData)
      }
    } catch (err) {
      console.warn('Timeline DB save fallback:', err)
    }

    if (setIsDirty) setIsDirty(false)
    alert('✓ ' + tLabel('जीवन यात्रा सहेजी गई!', 'Timeline item saved!'))
    setShowForm(false)
    clearSelection()
    onUpdate()
  }

  const handleEditSelected = () => {
    if (!singleSelectedId) return
    const item = displayList.find(i => i.id === singleSelectedId)
    if (!item) return
    setEditingId(item.id)
    setFormData(item)
    setShowForm(true)
  }

  const persistReorder = async (updated) => {
    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(updated)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updated))
    try {
      for (const item of updated) {
        await supabase.from('timeline_milestones').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {}
    onUpdate()
  }

  const handleMoveTop = () => {
    if (singleIndex <= 0) return
    const item = displayList[singleIndex]
    const updated = [item, ...displayList.filter((_, i) => i !== singleIndex)]
    persistReorder(updated)
    clearSelection()
  }

  const handleMoveUp = () => {
    if (singleIndex <= 0) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex - 1]
    updated[singleIndex - 1] = temp
    persistReorder(updated)
  }

  const handleMoveDown = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex + 1]
    updated[singleIndex + 1] = temp
    persistReorder(updated)
  }

  const handleMoveBottom = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const item = displayList[singleIndex]
    const updated = [...displayList.filter((_, i) => i !== singleIndex), item]
    persistReorder(updated)
    clearSelection()
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(tLabel(`क्या आप चयनित ${selectedIds.length} जीवन यात्रा आइटम हटाना चाहते हैं?`, `Delete ${selectedIds.length} selected timeline items?`))) return

    const updatedList = items.filter(i => !selectedIds.includes(i.id))
    setItems(updatedList)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updatedList))
    clearSelection()

    try {
      await supabase.from('timeline_milestones').delete().in('id', selectedIds)
    } catch (e) {}
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">⏳ {tLabel('जीवन यात्रा टाइमलाइन', 'Timeline Milestones')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="admin-btn-secondary" onClick={handleSortByYear}>
            🔄 {tLabel('वर्षानुसार स्वचालित क्रमबद्ध करें', 'Auto-Sort by Year')}
          </button>
          {!showForm && (
            <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', description: '', sort_order: 1 }); setShowForm(true); }}>
              + {tLabel('नया मील का पत्थर जोड़ें', 'Add Timeline Year')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('वर्ष (e.g. १९४५ / 1945)', 'Year (e.g. 1945)')}</label>
              <input className="admin-input" value={formData.year_display} onChange={e => updateForm({ year_display: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('शीर्षक', 'Title')}</label>
              <input className="admin-input" value={formData.title} onChange={e => updateForm({ title: e.target.value })} required />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('विवरण', 'Description')}</label>
              <textarea className="admin-textarea" value={formData.description} onChange={e => updateForm({ description: e.target.value })} rows={3} required />
            </div>
          </div>
        </form>
      )}

      <ListContextualToolbar
        selectedIds={selectedIds}
        totalItems={displayList.length}
        onClearSelection={clearSelection}
        onEdit={handleEditSelected}
        onMoveTop={handleMoveTop}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onMoveBottom={handleMoveBottom}
        onBatchDelete={handleBatchDelete}
        tLabel={tLabel}
      />

      <ul className="admin-item-list">
        {displayList.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          return (
            <li key={item.id} className={`admin-item-card ${isSelected ? 'selected' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <input
                  type="checkbox"
                  className="admin-item-checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(item.id)}
                />
                <div>
                  <div className="admin-item-title">
                    <span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}
                  </div>
                  <div className="admin-item-sub">{item.description}</div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}


// Awards Manager Component
function AwardsManager({ onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ year_display: '', title: '', organization: '', sort_order: 1 })
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetchAwards()
  }, [])

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const displayList = items
  const singleSelectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const singleIndex = singleSelectedId ? displayList.findIndex(i => i.id === singleSelectedId) : -1

  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }))
    if (setIsDirty) setIsDirty(true)
  }

  const fetchAwards = async () => {
    try {
      const { data, error } = await supabase.from('awards_honors').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        setItems(data)
        localStorage.setItem('app_awards_honors', JSON.stringify(data))
      } else {
        const cached = localStorage.getItem('app_awards_honors')
        if (cached) {
          setItems(JSON.parse(cached))
        } else {
          const defaultItems = [
            { id: '1', year_display: '१९९५', title: 'राजस्थान साहित्य अकादमी सम्मान', organization: 'राजस्थान सरकार', sort_order: 1 },
            { id: '2', year_display: '२०१०', title: 'राष्ट्रकवि मैथिलीशरण गुप्त पुरस्कार', organization: 'हिंदी साहित्य सम्मेलन', sort_order: 2 },
            { id: '3', year_display: '२०२२', title: 'साहित्य जीवन साधना सम्मान', organization: 'भारतीय भाषा परिषद', sort_order: 3 }
          ]
          setItems(defaultItems)
          localStorage.setItem('app_awards_honors', JSON.stringify(defaultItems))
        }
      }
    } catch (e) {
      console.warn('Awards fetch notice:', e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let updatedList = []
    const newSortOrder = editingId ? (parseInt(formData.sort_order) || 1) : 1

    if (editingId && editingId !== 'new') {
      updatedList = items.map(i => i.id === editingId ? { ...i, ...formData } : i)
    } else {
      const newItem = { id: String(Date.now()), ...formData, sort_order: newSortOrder }
      updatedList = [newItem, ...items]
    }

    updatedList.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(updatedList)
    localStorage.setItem('app_awards_honors', JSON.stringify(updatedList))

    const cleanData = {
      year_display: formData.year_display || '',
      title: formData.title || '',
      organization: formData.organization || '',
      sort_order: newSortOrder
    }

    try {
      const { error: dbErr } = (editingId && editingId !== 'new')
        ? await supabase.from('awards_honors').update(cleanData).eq('id', editingId)
        : await supabase.from('awards_honors').insert(cleanData)

      if (dbErr) {
        console.error("Save failed:", dbErr.message)
      }

      const { error: settingsErr } = await supabase.from('settings').upsert({
        key: 'awards_list',
        value: JSON.stringify(updatedList),
        display_label: 'Awards List'
      }, { onConflict: 'key' })

      if (settingsErr) {
        console.error("Save failed:", settingsErr.message)
      }
    } catch (err) {
      console.error('Save failed:', err.message || err)
    }

    if (setIsDirty) setIsDirty(false)
    alert('✓ ' + tLabel('पुरस्कार सहेजा गया!', 'Award saved!'))
    setShowForm(false)
    clearSelection()
    onUpdate()
  }

  const handleEditSelected = () => {
    if (!singleSelectedId) return
    const item = displayList.find(i => i.id === singleSelectedId)
    if (!item) return
    setEditingId(item.id)
    setFormData(item)
    setShowForm(true)
  }

  const persistReorder = async (updated) => {
    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(updated)
    localStorage.setItem('app_awards_honors', JSON.stringify(updated))
    try {
      for (const item of updated) {
        await supabase.from('awards_honors').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {}
    onUpdate()
  }

  const handleMoveTop = () => {
    if (singleIndex <= 0) return
    const item = displayList[singleIndex]
    const updated = [item, ...displayList.filter((_, i) => i !== singleIndex)]
    persistReorder(updated)
    clearSelection()
  }

  const handleMoveUp = () => {
    if (singleIndex <= 0) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex - 1]
    updated[singleIndex - 1] = temp
    persistReorder(updated)
  }

  const handleMoveDown = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const updated = [...displayList]
    const temp = updated[singleIndex]
    updated[singleIndex] = updated[singleIndex + 1]
    updated[singleIndex + 1] = temp
    persistReorder(updated)
  }

  const handleMoveBottom = () => {
    if (singleIndex < 0 || singleIndex >= displayList.length - 1) return
    const item = displayList[singleIndex]
    const updated = [...displayList.filter((_, i) => i !== singleIndex), item]
    persistReorder(updated)
    clearSelection()
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(tLabel(`क्या आप चयनित ${selectedIds.length} पुरस्कार हटाना चाहते हैं?`, `Delete ${selectedIds.length} selected awards?`))) return

    const updatedList = items.filter(i => !selectedIds.includes(i.id))
    setItems(updatedList)
    localStorage.setItem('app_awards_honors', JSON.stringify(updatedList))
    clearSelection()

    try {
      await supabase.from('awards_honors').delete().in('id', selectedIds)
    } catch (e) {}
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">🏆 {tLabel('पुरस्कार एवं सम्मान', 'Awards & Honors')}</h2>
        {!showForm && (
          <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', organization: '', sort_order: 1 }); setShowForm(true); }}>
            + {tLabel('नया सम्मान जोड़ें', 'Add Award')}
          </button>
        )}
      </div>

      <form id="admin-active-form" onSubmit={handleSubmit} onChange={() => setIsDirty && setIsDirty(true)} onInput={() => setIsDirty && setIsDirty(true)} className="admin-form-container" style={{ display: showForm ? 'block' : 'none' }}>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>{tLabel('वर्ष (e.g. १९९५ / 1995)', 'Year (e.g. 1995)')}</label>
            <input className="admin-input" value={formData.year_display} onChange={e => updateForm({ year_display: e.target.value })} required={showForm} />
          </div>
          <div className="admin-form-group">
            <label>{tLabel('सम्मान का नाम', 'Award Title')}</label>
            <input className="admin-input" value={formData.title} onChange={e => updateForm({ title: e.target.value })} required={showForm} />
          </div>
          <div className="admin-form-group full-width">
            <label>{tLabel('संस्था / आयोजक', 'Organization')}</label>
            <input className="admin-input" value={formData.organization} onChange={e => updateForm({ organization: e.target.value })} required={showForm} />
          </div>
        </div>
      </form>

      <ListContextualToolbar
        selectedIds={selectedIds}
        totalItems={displayList.length}
        onClearSelection={clearSelection}
        onEdit={handleEditSelected}
        onMoveTop={handleMoveTop}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onMoveBottom={handleMoveBottom}
        onBatchDelete={handleBatchDelete}
        tLabel={tLabel}
      />

      <ul className="admin-item-list">
        {displayList.map(item => {
          const isSelected = selectedIds.includes(item.id)
          return (
            <li key={item.id} className={`admin-item-card ${isSelected ? 'selected' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <input
                  type="checkbox"
                  className="admin-item-checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(item.id)}
                />
                <div>
                  <div className="admin-item-title"><span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}</div>
                  <div className="admin-item-sub">{tLabel('संस्था:', 'Org:')} {item.organization}</div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}


function InboxManager({ onUpdate }) {
  const { tLabel } = useAdminLang()
  const [messages, setMessages] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInbox()
  }, [])

  const fetchInbox = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setMessages(data)
      } else {
        // Fallback seed demo data
        setMessages([
          {
            id: 'demo-1',
            name: 'राजेश कुमार',
            email: 'rajesh@example.com',
            subject: 'काव्य सम्मेलन आमंत्रण',
            message: 'आदरणीय कवि जी, हम आपको जयपुर साहित्य उत्सव में काव्य पाठ हेतु आमंत्रित करना चाहते हैं। कृपया अपनी स्वीकृति प्रदान करें।',
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            name: 'डॉ. अनीता शर्मा',
            email: 'anita@literature.org',
            subject: 'पुस्तकों का संकलन',
            message: 'नमस्ते गुरुप्रताप जी, आपकी हालिया प्रकाशित पुस्तक "अंगारे" का समीक्षा पत्र तैयार है।',
            is_read: true,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ])
      }
    } catch (e) {
      console.warn('Inbox fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const selectAll = () => {
    const safeMsgs = Array.isArray(messages) ? messages : []
    if (selectedIds.length === safeMsgs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(safeMsgs.map(m => m.id))
    }
  }

  const handleBatchMarkRead = async (targetReadStatus) => {
    if (selectedIds.length === 0) return
    try {
      // Background Supabase update
      await supabase
        .from('contact_submissions')
        .update({ is_read: targetReadStatus })
        .in('id', selectedIds)
    } catch (e) {
      console.warn('Supabase mark read error:', e)
    }

    // Optimistic UI update
    setMessages(prev =>
      prev.map(m => (selectedIds.includes(m.id) ? { ...m, is_read: targetReadStatus } : m))
    )
    setSelectedIds([])
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(tLabel(`क्या आप चयनित ${selectedIds.length} संदेश हटाना चाहते हैं?`, `Delete selected ${selectedIds.length} message(s)?`))) {
      return
    }

    try {
      // Background Supabase batch deletion
      await supabase
        .from('contact_submissions')
        .delete()
        .in('id', selectedIds)
    } catch (e) {
      console.warn('Supabase batch delete error:', e)
    }

    // Optimistic UI update
    setMessages(prev => prev.filter(m => !selectedIds.includes(m.id)))
    setSelectedIds([])
  }

  const safeMsgs = Array.isArray(messages) ? messages : []
  const hasUnreadSelected = safeMsgs.some(m => selectedIds.includes(m.id) && !m.is_read)
  const hasReadSelected = safeMsgs.some(m => selectedIds.includes(m.id) && m.is_read)

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">📬 {tLabel('प्राप्त संदेश इनबॉक्स', 'Messages Inbox')}</h2>
        {safeMsgs.length > 0 && (
          <button type="button" className="admin-btn-secondary" onClick={selectAll}>
            {selectedIds.length === safeMsgs.length
              ? tLabel('चयन हटाएं', 'Deselect All')
              : tLabel('सभी चुनें', 'Select All')}
          </button>
        )}
      </div>

      {/* Phase 2.5 Contextual Top Action Bar for Inbox */}
      {selectedIds.length > 0 && (
        <div className="admin-contextual-toolbar">
          <div className="admin-toolbar-info">
            <span className="admin-toolbar-count">
              {selectedIds.length} {tLabel('संदेश चयनित', 'messages selected')}
            </span>
            <button type="button" className="admin-btn-link" onClick={clearSelection}>
              {tLabel('रद्द करें', 'Clear selection')}
            </button>
          </div>
          <div className="admin-toolbar-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              disabled={!hasUnreadSelected}
              onClick={() => handleBatchMarkRead(true)}
            >
              ✉️ {tLabel('पठित चिन्हित करें', 'Mark as Read')}
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              disabled={!hasReadSelected}
              onClick={() => handleBatchMarkRead(false)}
            >
              📩 {tLabel('अपठित चिन्हित करें', 'Mark as Unread')}
            </button>
            <button
              type="button"
              className="admin-btn-danger"
              onClick={handleBatchDelete}
            >
              🗑️ {tLabel(`हटाएं (${selectedIds.length})`, `Delete Selected (${selectedIds.length})`)}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>{tLabel('संदेश लोड हो रहे हैं...', 'Loading messages...')}</p>
      ) : safeMsgs.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', padding: '20px' }}>{tLabel('कोई संदेश नहीं मिला।', 'No messages found.')}</p>
      ) : (
        <ul className="admin-item-list">
          {safeMsgs.map(msg => {
            const isSelected = selectedIds.includes(msg.id)
            const isExpanded = expandedId === msg.id
            const isRead = msg.is_read === true || msg.status === 'read'

            return (
              <li
                key={msg.id}
                className={`admin-item-card ${isSelected ? 'selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}
              >
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      className="admin-item-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(msg.id)}
                    />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
                        {msg.name}
                      </span>
                      {msg.email && (
                        <span style={{ fontSize: '0.88rem', color: '#666', marginLeft: '8px' }}>
                          ({msg.email})
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={isRead ? 'admin-badge-read' : 'admin-badge-unread'}>
                      {isRead ? `✅ ${tLabel('पठित', 'Read')}` : `📩 ${tLabel('अपठित', 'Unread')}`}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {new Date(msg.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ fontWeight: 600, color: 'var(--leona-terracotta)', width: '100%' }}>
                  {tLabel('विषय:', 'Subject:')} {msg.subject || tLabel('(कोई विषय नहीं)', '(No Subject)')}
                </div>

                <div
                  style={{
                    background: '#FDFBF7',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(226, 215, 197, 0.7)',
                    width: '100%',
                    fontSize: '0.95rem',
                    color: 'var(--leona-text-main)',
                    lineHeight: '1.6',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                >
                  {isExpanded
                    ? msg.message
                    : msg.message && msg.message.length > 120
                    ? `${msg.message.substring(0, 120)}...`
                    : msg.message}
                  {msg.message && msg.message.length > 120 && (
                    <span style={{ color: 'var(--leona-terracotta)', fontWeight: 600, marginLeft: '8px', fontSize: '0.85rem' }}>
                      {isExpanded ? tLabel('[कम दिखाएं]', '[Show Less]') : tLabel('[पूरा पढ़ें]', '[Read More]')}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard
