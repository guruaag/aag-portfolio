import json

json_path = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/ui_translation_matrix.json"
md_path = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/ui_translation_matrix.md"

with open(json_path, "r", encoding="utf-8") as f:
    entries = json.load(f)

md_content = f"""# 🌐 Complete Comprehensive UI Translation Matrix ({len(entries)} Extracted Entries)

Below is the 100% complete, deep-scanned extraction of **all {len(entries)} UI text elements** across the entire application—including section & sub-section headers, form field labels, pill/badge tags, input placeholders, helper tooltips, and sub-tab category names.

---

## 📋 Comprehensive String Matrix ({len(entries)} Total Entries)

| Key / String ID | Category | Element Type | Current Hindi Text (सरल हिंदी) | Current English Text | Component Location |
| --- | --- | --- | --- | --- | --- |
"""

for item in entries:
    elem = item.get('element_type', 'Label / Text')
    md_content += f"| `{item['key']}` | {item['category']} | {elem} | {item['current_text_hi']} | {item['current_text_en']} | `{item['location']}` |\n"

with open(md_path, "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"Successfully generated full markdown matrix ({len(entries)} items) at {md_path}")
