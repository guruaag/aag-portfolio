import re

dash_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dash_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Categories delete (line 973)
old_cat_del = "await supabase.from('categories').delete().eq('id', cat.id)"
new_cat_del = "await supabase.from('categories').update({ is_deleted: true, is_active: false }).eq('id', cat.id)"
content = content.replace(old_cat_del, new_cat_del)

# 2. Update Poems delete (line 2209)
old_poem_del = "await supabase.from('poems').delete().eq('id', id)"
new_poem_del = "await supabase.from('poems').update({ is_deleted: true, is_active: false }).eq('id', id)"
content = content.replace(old_poem_del, new_poem_del)

# 3. Update Publications batch delete & single delete (lines 2704, 2736)
old_pub_batch_del = "await supabase.from('publications').delete().in('id', selectedIds)"
new_pub_batch_del = "await supabase.from('publications').update({ is_deleted: true, is_active: false }).in('id', selectedIds)"
content = content.replace(old_pub_batch_del, new_pub_batch_del)

old_pub_single_del = "await supabase.from('publications').delete().eq('id', id)"
new_pub_single_del = "await supabase.from('publications').update({ is_deleted: true, is_active: false }).eq('id', id)"
content = content.replace(old_pub_single_del, new_pub_single_del)

# 4. Update Timeline delete (line 3280)
old_time_del = "await supabase.from('timeline_milestones').delete().eq('id', id)"
new_time_del = "await supabase.from('timeline_milestones').update({ is_deleted: true }).eq('id', id)"
content = content.replace(old_time_del, new_time_del)

# 5. Update Awards delete (line 3458)
old_award_del = "await supabase.from('awards_honors').delete().eq('id', id)"
new_award_del = "await supabase.from('awards_honors').update({ is_deleted: true }).eq('id', id)"
content = content.replace(old_award_del, new_award_del)

with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied soft-delete updates to Dashboard.jsx")
