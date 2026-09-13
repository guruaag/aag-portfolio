import sys

def patch_app_routes():
    app_path = '/Users/sankalpg/Documents/Project/aag/src/App.jsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        if '<Route path="/admin/home/highlights"' in line:
            new_lines.append(' <Route path="/admin/home/banner" element={<AdminDashboard tab="home" initialSubTab="hero" />}\n')
            new_lines.append(' <Route path="/admin/home/about" element={<AdminDashboard tab="home" initialSubTab="about" />}\n')
            new_lines.append(' <Route path="/admin/home/poetry" element={<AdminDashboard tab="home" initialSubTab="featured" />}\n')
            new_lines.append(' <Route path="/admin/home/books" element={<AdminDashboard tab="home" initialSubTab="books" />}\n')
        else:
            new_lines.append(line)

    with open(app_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("App.jsx routes updated successfully!")

def patch_dashboard_sidebar():
    dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find Home sidebar sub-nav start (around line 430)
    sub_nav_start = -1
    for idx, line in enumerate(lines[:500]):
        if 'Nested Sub-categories for Home Page' in line:
            sub_nav_start = idx
            break

    if sub_nav_start != -1:
        # Find closing </div> of admin-sub-nav
        close_idx = -1
        for i in range(sub_nav_start, sub_nav_start + 30):
            if '</div>' in lines[i]:
                close_idx = i
                break

        if close_idx != -1:
            new_sub_nav = [
                ' {/* Nested Sub-categories for Home Page */}\n',
                ' <div className="admin-sub-nav">\n',
                ' <button\n',
                ' className={`admin-sub-tab-btn ${activeTab === \'home\' && (homeSubTab === \'hero\' || homeSubTab === \'banner\') ? \'active\' : \'\'}`}\n',
                ' onClick={() => switchTab(\'home\', \'/admin/home/banner\', \'hero\')}\n',
                ' >\n',
                ' 1. {tLabel(\'बैनर\', \'Banner\')}\n',
                ' </button>\n',
                ' <button\n',
                ' className={`admin-sub-tab-btn ${activeTab === \'home\' && (homeSubTab === \'about\' || homeSubTab === \'intro\') ? \'active\' : \'\'}`}\n',
                ' onClick={() => switchTab(\'home\', \'/admin/home/about\', \'about\')}\n',
                ' >\n',
                ' 2. {tLabel(\'परिचय\', \'About\')}\n',
                ' </button>\n',
                ' <button\n',
                ' className={`admin-sub-tab-btn ${activeTab === \'home\' && (homeSubTab === \'featured\' || homeSubTab === \'poetry\') ? \'active\' : \'\'}`}\n',
                ' onClick={() => switchTab(\'home\', \'/admin/home/poetry\', \'featured\')}\n',
                ' >\n',
                ' 3. {tLabel(\'विशेष कविताएं\', \'Featured Poetry\')}\n',
                ' </button>\n',
                ' <button\n',
                ' className={`admin-sub-tab-btn ${activeTab === \'home\' && homeSubTab === \'books\' ? \'active\' : \'\'}`}\n',
                ' onClick={() => switchTab(\'home\', \'/admin/home/books\', \'books\')}\n',
                ' >\n',
                ' 4. {tLabel(\'विशेष पुस्तकें\', \'Featured Books\')}\n',
                ' </button>\n',
                ' </div>\n'
            ]
            lines = lines[:sub_nav_start] + new_sub_nav + lines[close_idx + 1:]
            with open(dashboard_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Dashboard.jsx sidebar sub-nav updated successfully!")
        else:
            print("Could not find closing </div> for sidebar sub-nav")
    else:
        print("Could not find sidebar sub-nav start")

if __name__ == '__main__':
    patch_app_routes()
    patch_dashboard_sidebar()
