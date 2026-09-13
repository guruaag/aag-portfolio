dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure import is present
if 'useFontPreference' not in content:
    content = content.replace(
        "import './AdminDashboard.css'",
        "import { useFontPreference } from '../../contexts/FontContext'\nimport './AdminDashboard.css'"
    )

# 2. Ensure hook is destructured inside AdminDashboard
if 'const { typingFont, setTypingFont } = useFontPreference()' not in content:
    content = content.replace(
        "function AdminDashboard({ tab, initialSubTab }) {",
        "function AdminDashboard({ tab, initialSubTab }) {\n  const { typingFont, setTypingFont } = useFontPreference()"
    )

# 3. Add UI toggle in sidebar right beneath Main Site / Language button
marker = "{adminLang === 'hi' ? 'English' : 'हिंदी'}\n  </button>\n  </div>"
if marker not in content:
    # Try alternative matching
    marker = "{adminLang === 'hi' ? 'English' : 'हिंदी'}\n  </button>"

replacement = marker + """

  {/* Global Application-Wide Typing Switcher */}
  <div className="admin-sidebar-font-switcher" style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F66E5E', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>⌨️</span> {tLabel('टाइपिंग मोड:', 'Typing Mode:')}
    </div>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        type="button"
        className={`admin-sidebar-action-btn ${typingFont === 'english' ? 'active' : ''}`}
        onClick={() => setTypingFont('english')}
        style={{
          flex: 1,
          padding: '6px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: '6px',
          background: typingFont === 'english' ? '#F66E5E' : 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center'
        }}
      >
        English
      </button>
      <button
        type="button"
        className={`admin-sidebar-action-btn ${typingFont === 'krutidev' ? 'active' : ''}`}
        onClick={() => setTypingFont('krutidev')}
        style={{
          flex: 1,
          padding: '6px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: '6px',
          background: typingFont === 'krutidev' ? '#F66E5E' : 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center'
        }}
      >
        कृतिदेव
      </button>
    </div>
  </div>"""

if marker in content and 'admin-sidebar-font-switcher' not in content:
    content = content.replace(marker, replacement, 1)
    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Dashboard.jsx sidebar toggle successfully inserted!")
else:
    print("Marker check:", marker in content, "Font switcher already present:", 'admin-sidebar-font-switcher' in content)
