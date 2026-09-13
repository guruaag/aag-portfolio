dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename sidebar option 1 from Overview & Hero to Intro
old_sub_nav_item = "1. {tLabel('कवि परिचय व बैनर', 'Overview & Hero')}"
new_sub_nav_item = "1. {tLabel('परिचय विवरण', 'Intro')}"
if old_sub_nav_item in content:
    content = content.replace(old_sub_nav_item, new_sub_nav_item, 1)
    print("Sidebar nav sub-item renamed to Intro!")

# 2. Rename AboutManager card panel title
old_panel_title = '<h2 className="admin-panel-title">{tLabel(\'कवि परिचय व बैनर\', \'Biography & Hero\')}</h2>'
new_panel_title = '<h2 className="admin-panel-title">{tLabel(\'परिचय विवरण\', \'Intro\')}</h2>'
if old_panel_title in content:
    content = content.replace(old_panel_title, new_panel_title, 1)
    print("AboutManager panel title renamed to Intro!")

# 3. Delete Banner Details block
banner_details_start = '<div style={{ background: \'var(--leona-sand-light, #FAF6F0)\', padding: \'16px\', borderRadius: \'8px\', marginBottom: \'20px\', borderLeft: \'4px solid var(--leona-terracotta)\' }}>'
banner_details_end = '</div>\n  </div>'

# Find block starting with Banner Details title
import re
banner_pattern = r"<div style=\{\{ background: 'var\(--leona-sand-light, #FAF6F0\)', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var\(--leona-terracotta\)' \}\}>.*?\{tLabel\('बैनर जानकारी', 'Banner Details'\)\}.*?<\/div>\n  <\/div>"
if re.search(banner_pattern, content, flags=re.DOTALL):
    content = re.sub(banner_pattern, '', content, flags=re.DOTALL)
    print("Banner Details block deleted from AboutManager!")
else:
    print("Banner Details regex search failed, checking alternative replacement...")
    # Alternative line-by-line deletion
    lines = content.split('\n')
    start_idx = -1
    end_idx = -1
    for idx, line in enumerate(lines):
        if "tLabel('बैनर जानकारी', 'Banner Details')" in line:
            # find outer div start (upwards)
            for j in range(idx, max(0, idx - 10), -1):
                if "<div style={{" in lines[j]:
                    start_idx = j
                    break
            # find outer div end (downwards)
            div_count = 0
            for k in range(start_idx, min(len(lines), start_idx + 60)):
                if '<div' in lines[k]:
                    div_count += lines[k].count('<div')
                if '</div>' in lines[k]:
                    div_count -= lines[k].count('</div>')
                if div_count == 0 and k > start_idx:
                    end_idx = k
                    break
            break
    if start_idx != -1 and end_idx != -1:
        lines = lines[:start_idx] + lines[end_idx + 1:]
        content = '\n'.join(lines)
        print(f"Banner Details block deleted from line {start_idx} to {end_idx}!")

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)
