dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find index of line with onClick={toggleAdminLang}
target_idx = -1
for idx, line in enumerate(lines):
    if 'onClick={toggleAdminLang}' in line:
        target_idx = idx
        break

if target_idx != -1:
    # Find closing </div> of top actions (around target_idx + 5)
    close_div_idx = -1
    for i in range(target_idx, target_idx + 10):
        if '</div>' in lines[i]:
            close_div_idx = i
            break
    
    if close_div_idx != -1:
        new_block = [
            "\n",
            "  {/* Global Application-Wide Typing Switcher (English vs Kruti Dev Remington) */}\n",
            "  <div className=\"admin-sidebar-font-switcher\" style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>\n",
            "  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F66E5E', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>\n",
            "  <span>⌨️</span> {tLabel('टाइपिंग मोड:', 'Typing Mode:')}\n",
            "  </div>\n",
            "  <div style={{ display: 'flex', gap: '6px' }}>\n",
            "  <button\n",
            "  type=\"button\"\n",
            "  className={`admin-sidebar-action-btn ${typingFont === 'english' ? 'active' : ''}`}\n",
            "  onClick={() => setTypingFont('english')}\n",
            "  style={{\n",
            "  flex: 1,\n",
            "  padding: '6px 8px',\n",
            "  fontSize: '0.75rem',\n",
            "  fontWeight: 600,\n",
            "  borderRadius: '6px',\n",
            "  background: typingFont === 'english' ? '#F66E5E' : 'rgba(255, 255, 255, 0.1)',\n",
            "  color: '#FFFFFF',\n",
            "  border: 'none',\n",
            "  cursor: 'pointer',\n",
            "  textAlign: 'center'\n",
            "  }}\n",
            "  >\n",
            "  English\n",
            "  </button>\n",
            "  <button\n",
            "  type=\"button\"\n",
            "  className={`admin-sidebar-action-btn ${typingFont === 'krutidev' ? 'active' : ''}`}\n",
            "  onClick={() => setTypingFont('krutidev')}\n",
            "  style={{\n",
            "  flex: 1,\n",
            "  padding: '6px 8px',\n",
            "  fontSize: '0.75rem',\n",
            "  fontWeight: 600,\n",
            "  borderRadius: '6px',\n",
            "  background: typingFont === 'krutidev' ? '#F66E5E' : 'rgba(255, 255, 255, 0.1)',\n",
            "  color: '#FFFFFF',\n",
            "  border: 'none',\n",
            "  cursor: 'pointer',\n",
            "  textAlign: 'center'\n",
            "  }}\n",
            "  >\n",
            "  कृतिदेव\n",
            "  </button>\n",
            "  </div>\n",
            "  </div>\n"
        ]
        lines = lines[:close_div_idx + 1] + new_block + lines[close_div_idx + 1:]
        
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Dashboard.jsx updated precisely at index", close_div_idx)
    else:
        print("Could not find closing </div> after target_idx")
else:
    print("Could not find target_idx for toggleAdminLang")
