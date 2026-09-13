header_path = '/Users/sankalpg/Documents/Project/aag/src/components/Header.jsx'
with open(header_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """          {/* Right Side Actions */}
          <div className="phoenix-header-actions">
            {/* Language Switcher Button - Exact HI / EN as public site */}"""

replacement = """          {/* Right Side Actions */}
          <div className="phoenix-header-actions">
            {/* Font Switcher Select (English vs Kruti Dev) */}
            <select
              value={typingFont}
              onChange={(e) => setTypingFont(e.target.value)}
              className="btn-font-switcher"
              title="Global Typing Font Mode"
              style={{
                padding: '5px 10px',
                border: typingFont === 'krutidev' ? '1.5px solid #F66E5E' : '1.5px solid #1E1B18',
                borderRadius: '20px',
                background: typingFont === 'krutidev' ? 'rgba(246, 110, 94, 0.1)' : 'transparent',
                color: typingFont === 'krutidev' ? '#F66E5E' : '#1E1B18',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                marginRight: '6px'
              }}
            >
              <option value="english">Font: English</option>
              <option value="krutidev">Font: कृतिदेव</option>
            </select>

            {/* Language Switcher Button - Exact HI / EN as public site */}"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Header toggle patched successfully!")
else:
    print("Target block not found in Header.jsx")
