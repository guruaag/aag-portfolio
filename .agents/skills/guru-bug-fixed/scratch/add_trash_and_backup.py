import re

# 1. Update src/pages/Admin/Dashboard.jsx
dash_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dash_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add trash tab in sidebar right after settings tab
old_sidebar_settings = """  {/* Site Settings */}
  <button
  className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
  onClick={() => switchTab('settings', '/admin/settings')}
  >
  {tLabel('सेटिंग्स', 'Settings')}
  </button>"""

new_sidebar_settings = """  {/* Site Settings */}
  <button
  className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
  onClick={() => switchTab('settings', '/admin/settings')}
  >
  {tLabel('सेटिंग्स', 'Settings')}
  </button>
  
  {/* Trash Bin */}
  <button
  className={`admin-tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
  onClick={() => switchTab('trash', '/admin/trash')}
  >
  🗑️ {tLabel('रीसाइक्लिंग बिन (ट्रैश)', 'Trash Bin')}
  </button>"""

if old_sidebar_settings in content:
    content = content.replace(old_sidebar_settings, new_sidebar_settings)

# Add activeTab === 'trash' check in main canvas view header and body
old_canvas_header = "{activeTab === 'settings' && tLabel('वेबसाइट व एसईओ सेटिंग्स', 'Site & SEO Settings')}"
new_canvas_header = "{activeTab === 'settings' && tLabel('वेबसाइट व एसईओ सेटिंग्स', 'Site & SEO Settings')}\n {activeTab === 'trash' && tLabel('रीसाइक्लिंग बिन (सॉफ्ट-डिलीटेड)', 'Trash Bin (Soft-Deleted)')}"

if old_canvas_header in content:
    content = content.replace(old_canvas_header, new_canvas_header)

old_canvas_body = "{activeTab === 'settings' && (\n <SettingsManager settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />\n )}"
new_canvas_body = "{activeTab === 'settings' && (\n <SettingsManager settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />\n )}\n {activeTab === 'trash' && (\n <TrashManager onUpdate={loadData} setIsDirty={setIsDirty} />\n )}"

if old_canvas_body in content:
    content = content.replace(old_canvas_body, new_canvas_body)

# Add Export Database Backup section in SettingsManager
export_btn_code = """
  {/* 4. Full Database Backup Export */}
  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid rgba(226, 215, 197, 0.6)', paddingBottom: '8px' }}>
    {tLabel('4. डेटाबेस बैकअप व सुरक्षा (Database Backup & Protection)', '4. Database Backup & Protection')}
  </h3>
  <div style={{ padding: '16px', background: '#FDFBF7', border: '1px solid #E2D7C5', borderRadius: '8px', marginBottom: '24px' }}>
    <p style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: '#555' }}>
      {tLabel('पूरे डेटाबेस (कविताएं, पुस्तकें, परिचय, सेटिंग्स) की सुरक्षा के लिए बैकअप डाउनलोड करें।', 'Download complete database backup (poems, books, about, settings) as JSON file.')}
    </p>
    <button
      type="button"
      className="admin-btn-secondary"
      onClick={async () => {
        try {
          alert(tLabel('डेटाबेस बैकअप तैयार किया जा रहा है...', 'Generating database backup...'))
          const TABLES = ['categories', 'about_content', 'poems', 'publications', 'timeline_milestones', 'awards_honors', 'settings', 'contact_submissions']
          const backupData = {}
          for (const table of TABLES) {
            const { data } = await supabase.from(table).select('*')
            backupData[table] = data || []
          }
          const jsonStr = JSON.stringify(backupData, null, 2)
          const blob = new Blob([jsonStr], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `aag_db_backup_${new Date().toISOString().slice(0, 10)}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          alert(tLabel('डेटाबेस बैकअप सफलतापूर्वक डाउनलोड हो गया!', 'Database backup downloaded successfully!'))
        } catch (err) {
          alert(tLabel('बैकअप त्रुटि: ' + err.message, 'Backup error: ' + err.message))
        }
      }}
      style={{ background: '#FFF3E0', color: '#B85C38', borderColor: '#E2D7C5', fontWeight: 600, cursor: 'pointer' }}
    >
      📦 {tLabel('संपूर्ण डेटाबेस बैकअप डाउनलोड करें', 'Download Database Backup (JSON)')}
    </button>
  </div>
"""

old_settings_return = "</form>\n </div>\n )"

# Insert Export Backup block before </form> in SettingsManager
settings_form_end = "placeholder=\"G-XXXXXXXXXX\"\n />\n </div>\n </div>\n </form>"
new_settings_form_end = "placeholder=\"G-XXXXXXXXXX\"\n />\n </div>\n </div>\n" + export_btn_code + "\n </form>"

if settings_form_end in content:
    content = content.replace(settings_form_end, new_settings_form_end)
    print("Added Export Backup button to SettingsManager")
else:
    print("Settings form end target not found")

# Add TrashManager component function before export default or at end of file
trash_manager_code = """
function TrashManager({ onUpdate }) {
  const { tLabel } = useAdminLang()
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeletedItems()
  }, [])

  const fetchDeletedItems = async () => {
    try {
      setLoading(true)
      const [cats, poems, pubs, timeline, awards] = await Promise.all([
        supabase.from('categories').select('*').or('is_deleted.eq.true,is_active.eq.false'),
        supabase.from('poems').select('*').or('is_deleted.eq.true,is_active.eq.false'),
        supabase.from('publications').select('*').or('is_deleted.eq.true,is_active.eq.false'),
        supabase.from('timeline_milestones').select('*').eq('is_deleted', true),
        supabase.from('awards_honors').select('*').eq('is_deleted', true)
      ])

      const list = [
        ...(cats.data || []).map(i => ({ ...i, item_type: 'category', label: tLabel('अनुभाग', 'Section'), title: i.title_hi || i.name })),
        ...(poems.data || []).map(i => ({ ...i, item_type: 'poem', label: tLabel('कविता', 'Poem'), title: i.title_hi || i.title })),
        ...(pubs.data || []).map(i => ({ ...i, item_type: 'publication', label: tLabel('पुस्तक', 'Book'), title: i.title_hi || i.title })),
        ...(timeline.data || []).map(i => ({ ...i, item_type: 'timeline', label: tLabel('समयरेखा', 'Timeline'), title: i.title_hi || i.title })),
        ...(awards.data || []).map(i => ({ ...i, item_type: 'award', label: tLabel('पुरस्कार', 'Award'), title: i.title_hi || i.title }))
      ]
      setDeletedItems(list)
    } catch (err) {
      console.error('Error fetching trash items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (item) => {
    try {
      const tableMap = {
        category: 'categories',
        poem: 'poems',
        publication: 'publications',
        timeline: 'timeline_milestones',
        award: 'awards_honors'
      }
      const table = tableMap[item.item_type]
      if (!table) return

      const updateObj = { is_deleted: false }
      if (item.item_type === 'category' || item.item_type === 'poem' || item.item_type === 'publication') {
        updateObj.is_active = true
      }

      const { error } = await supabase.from(table).update(updateObj).eq('id', item.id)
      if (error) throw error

      alert(tLabel('सामग्री सफलतापूर्वक पुनर्स्थापित की गई!', 'Item restored successfully!'))
      fetchDeletedItems()
      if (onUpdate) onUpdate()
    } catch (err) {
      alert(tLabel('पुनर्प्राप्ति त्रुटि: ' + err.message, 'Restore error: ' + err.message))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', margin: 0 }}>
          🗑️ {tLabel('रीसाइक्लिंग बिन (सॉफ्ट-डिलीटेड सामग्री)', 'Trash Bin (Soft-Deleted Items)')}
        </h2>
        <span style={{ fontSize: '0.88rem', color: '#666' }}>
          {tLabel('यहाँ हटाई गई सामग्री सुरक्षित है। आप इसे 1-क्लिक से वापस ला सकते हैं।', 'Items deleted are saved here. You can restore them with 1-click.')}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center' }}>{tLabel('लोड हो रहा है...', 'Loading...')}</div>
      ) : deletedItems.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontStyle: 'italic', background: '#FAF8F5', borderRadius: '8px' }}>
          {tLabel('ट्रैश खाली है! कोई हटाई गई सामग्री नहीं मिली।', 'Trash is empty! No deleted items found.')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deletedItems.map(item => (
            <div key={item.item_type + '-' + item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#FFFFFF', border: '1px solid #E2D7C5', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', font-weight: 700, padding: '2px 8px', borderRadius: '4px', background: '#FFF3E0', color: '#B85C38', marginRight: '10px' }}>
                  {item.label}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{item.title || 'शीर्षक रहित'}</span>
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => handleRestore(item)}
                style={{ background: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7', cursor: 'pointer' }}
              >
                ↩️ {tLabel('पुनर्स्थापित करें', 'Restore')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
"""

content = content + "\n" + trash_manager_code

with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Dashboard.jsx with TrashManager and Backup button")
