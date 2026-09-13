import os
import re
import json

src_dir = "/Users/sankalpg/Documents/Project/aag/src"

extracted_entries = []
seen_keys = set()

def register(key, text_hi, text_en, location, category, element_type):
    if key in seen_keys:
        return
    seen_keys.add(key)
    extracted_entries.append({
        "key": key,
        "current_text_hi": text_hi,
        "current_text_en": text_en,
        "location": location,
        "category": category,
        "element_type": element_type
    })

def scan_dashboard():
    dashboard_path = os.path.join(src_dir, "pages/Admin/Dashboard.jsx")
    with open(dashboard_path, "r", encoding="utf-8") as f:
        code = f.read()

    # Find all tLabel(hi, en) calls
    matches = re.findall(r"tLabel\(\s*(['\"])(.*?)\1\s*,\s*(['\"])(.*?)\3\s*\)", code)
    for quote1, hi, quote2, en in matches:
        hi_clean = hi.replace("\\'", "'").replace('\\"', '"')
        en_clean = en.replace("\\'", "'").replace('\\"', '"')
        
        # Categorize based on keywords in string
        cat = "Admin Panel General"
        elem = "Text / Label"
        
        if any(w in hi for w in ["बैनर", "हीरो", "मुख्य पृष्ठ", "प्रदर्शित"]):
            cat = "Admin Home Manager (/admin/home)"
        elif any(w in hi for w in ["परिचय", "कवि", "जीवनी", "बिल्ला", "टैग"]):
            cat = "Admin About & Hero (/admin/about)"
        elif any(w in hi for w in ["समयरेखा", "टाइमलाइन", "वर्ष", "मीलो"]):
            cat = "Admin Timeline (/admin/timeline)"
        elif any(w in hi for w in ["पुरस्कार", "सम्मान", "प्रदाता"]):
            cat = "Admin Awards (/admin/awards)"
        elif any(w in hi for w in ["काव्य", "कविता", "पद", "छंद"]):
            cat = "Admin Poetry Manager (/admin/kavya-sangrah)"
        elif any(w in hi for w in ["प्रकाशन", "पुस्तक", "कवर", "आईएसबीएन", "अंश"]):
            cat = "Admin Publications Manager (/admin/prakashan)"
        elif any(w in hi for w in ["संदेश", "इनबॉक्स", "संपर्क"]):
            cat = "Admin Contact & Inbox (/admin/contact)"
        elif any(w in hi for w in ["सेटिंग्स", "लोगो", "वेबसाइट"]):
            cat = "Admin Settings (/admin/settings)"

        if any(w in hi for w in ["शीर्षक", "नाम", "विवरण", "पंक्तियाँ", "चित्र", "कवर", "संख्या", "लिंक"]):
            elem = "Form Field Label"
        elif any(w in hi for w in ["जैसे:", "लिखें", "दर्ज करें", "अपलोड"]):
            elem = "Input Placeholder / Helper"
        elif any(w in hi for w in ["सहेजें", "जोड़ें", "अपडेट", "बदलें", "हटाएं", "कैनवस", "लॉगआउट"]):
            elem = "Action Button"
        elif any(w in hi for w in ["असुरक्षित", "सहेजा"]):
            elem = "Status Badge"

        # Formulate key
        slug = re.sub(r'[^a-zA-Z0-9_]', '', en_clean.lower().replace(' ', '_'))[:30]
        key = f"dashboard.{slug}" if slug else f"dashboard.{len(seen_keys)}"
        
        register(key, hi_clean, en_clean, "Dashboard.jsx", cat, elem)

scan_dashboard()

# Direct Scanning of AboutManager, HomeManager, PM5WritingDesk, etc.
def scan_file_labels(filepath, rel_location, default_cat):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Search for JSX labels like <label>...</label>
    labels = re.findall(r'<label[^>]*>(.*?)</label>', content, re.DOTALL)
    for l in labels:
        clean = re.sub(r'<[^>]+>', '', l).strip()
        if clean and len(clean) < 100:
            key = f"label.{re.sub(r'[^a-zA-Z0-9]', '_', clean.lower())[:30]}"
            register(key, clean, clean, rel_location, default_cat, "Form Field Label")

    # Search for headings <h2>...</h2>, <h3>...</h3>
    headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', content, re.DOTALL)
    for h in headings:
        clean = re.sub(r'<[^>]+>', '', h).strip()
        if clean and len(clean) < 100:
            key = f"heading.{re.sub(r'[^a-zA-Z0-9]', '_', clean.lower())[:30]}"
            register(key, clean, clean, rel_location, default_cat, "Section Header")

scan_file_labels(os.path.join(src_dir, "components/PM5WritingDesk.jsx"), "PM5WritingDesk.jsx", "PageMaker Canvas (PM5)")
scan_file_labels(os.path.join(src_dir, "pages/Contact.jsx"), "Contact.jsx", "Public Contact Page")
scan_file_labels(os.path.join(src_dir, "components/ContactModal.jsx"), "ContactModal.jsx", "Public Contact Modal")
scan_file_labels(os.path.join(src_dir, "components/Header.jsx"), "Header.jsx", "Public Header")
scan_file_labels(os.path.join(src_dir, "components/Footer.jsx"), "Footer.jsx", "Public Footer")

# Detailed explicit additions from user's specific request
register("about_hero.section_header", "📖 कवि परिचय व बैनर (Poet Biography & Hero Banner)", "📖 Poet Biography & Hero Banner", "Dashboard.jsx", "Admin About & Hero", "Section Header")
register("about_hero.subsection_header", "🎯 हीरो बैनर व हेडर टेक्स्ट (Hero Banner & Header Text)", "🎯 Hero Banner & Header Text", "Dashboard.jsx", "Admin About & Hero", "Sub-Section Header")
register("about_hero.hero_tag_pill", "हीरो टैग पिल (Hero Tag Pill)", "Hero Tag Pill", "Dashboard.jsx", "Admin About & Hero", "Pill / Tag Label")
register("about_hero.poet_full_name", "कवि का पूरा नाम * (Poet Full Name *)", "Poet Full Name *", "Dashboard.jsx", "Admin About & Hero", "Form Field Label")
register("about_hero.hero_subtitle", "हीरो उप-शीर्षक / टैगलाइन * (Hero Subtitle / Tagline *)", "Hero Subtitle / Tagline *", "Dashboard.jsx", "Admin About & Hero", "Form Field Label")
register("about_hero.badge_tag", "बैज टैग (Badge Tag)", "Badge Tag", "Dashboard.jsx", "Admin About & Hero", "Pill / Tag Label")
register("about_hero.quote_attribution", "उद्धरण श्रेय (Quote Attribution)", "Quote Attribution", "Dashboard.jsx", "Admin About & Hero", "Form Field Label")

# Save outputs
json_path = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/ui_translation_matrix.json"
md_path = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/ui_translation_matrix.md"

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(extracted_entries, f, ensure_ascii=False, indent=2)

print(f"Deep scan complete: Extracted {len(extracted_entries)} unique UI elements.")
