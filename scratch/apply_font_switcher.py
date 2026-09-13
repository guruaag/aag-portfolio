import sys

def patch_dashboard():
    dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Check if already imported
    if 'useFontPreference' not in content:
        import_stmt = "import { useFontPreference } from '../../contexts/FontContext'\n"
        content = content.replace("import './AdminDashboard.css'", import_stmt + "import './AdminDashboard.css'")

    # 2. Check if hook is used inside AdminDashboard
    if 'const { typingFont, setTypingFont } = useFontPreference()' not in content:
        content = content.replace(
            "function AdminDashboard({ tab, initialSubTab }) {\n  const navigate = useNavigate()",
            "function AdminDashboard({ tab, initialSubTab }) {\n  const navigate = useNavigate()\n  const { typingFont, setTypingFont } = useFontPreference()"
        )

    # 3. Add UI toggle under Main Site button
    target_block = """  <button
  type="button"
  className="admin-sidebar-action-btn"
  onClick={toggleAdminLang}
  title={tLabel('भाषा बदलें', 'Switch Language')}
  >
  {adminLang === 'hi' ? 'English' : 'हिंदी'}
  </button>
  </div>
  </div>"""

    replacement_block = """  <button
  type="button"
  className="admin-sidebar-action-btn"
  onClick={toggleAdminLang}
  title={tLabel('भाषा बदलें', 'Switch Language')}
  >
  {adminLang === 'hi' ? 'English' : 'हिंदी'}
  </button>
  </div>

  {/* Global Typing Switcher (English vs Kruti Dev Remington) */}
  <div className="admin-sidebar-font-switcher" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
  {tLabel('टाइपिंग फॉन्ट:', 'Font:')}
  </label>
  <select
  value={typingFont}
  onChange={(e) => setTypingFont(e.target.value)}
  style={{
  width: '100%',
  padding: '6px 10px',
  fontSize: '0.8rem',
  fontWeight: 600,
  borderRadius: '6px',
  backgroundColor: '#1E1B18',
  color: typingFont === 'krutidev' ? '#F66E5E' : '#FFFFFF',
  border: typingFont === 'krutidev' ? '1.5px solid #F66E5E' : '1px solid rgba(255, 255, 255, 0.2)',
  outline: 'none',
  cursor: 'pointer'
  }}
  >
  <option value="english">English (Default)</option>
  <option value="krutidev">Kruti Dev (रेमिंगटन)</option>
  </select>
  </div>
  </div>"""

    if target_block in content:
        content = content.replace(target_block, replacement_block, 1)

    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Dashboard.jsx successfully patched!")

def patch_header():
    header_path = '/Users/sankalpg/Documents/Project/aag/src/components/Header.jsx'
    with open(header_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useFontPreference' not in content:
        content = content.replace(
            "import { useTranslation } from 'react-i18next'",
            "import { useTranslation } from 'react-i18next'\nimport { useFontPreference } from '../contexts/FontContext'"
        )

    if 'const { typingFont, setTypingFont } = useFontPreference()' not in content:
        content = content.replace(
            "function Header() {",
            "function Header() {\n  const { typingFont, setTypingFont } = useFontPreference()"
        )

    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Header.jsx successfully patched!")

if __name__ == '__main__':
    patch_dashboard()
    patch_header()
