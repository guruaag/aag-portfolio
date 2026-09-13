import json
import os

i18n_path = "/Users/sankalpg/Documents/Project/aag/src/i18n/config.js"

with open(i18n_path, "r", encoding="utf-8") as f:
    config_code = f.read()

# Audit checklist of all dictionary keys
expected_dictionary = {
    # 1. Admin About & Hero
    "about_hero.section_header": ("Biography & Hero", "कवि परिचय व बैनर"),
    "about_hero.subsection_header": ("Banner Details", "बैनर जानकारी"),
    "about_hero.hero_tag_pill": ("Hero Tag", "हीरो टैग"),
    "about_hero.poet_full_name": ("Full Name *", "नाम *"),
    "about_hero.hero_subtitle": ("Subtitle *", "उपशीर्षक *"),
    "about_hero.badge_tag": ("Badge Tag", "बैज टैग"),
    "about_hero.quote_attribution": ("Quote Credit", "उद्धरण श्रेय"),
    "about_hero.overview_bio": ("Short Bio", "संक्षिप्त परिचय"),
    "about_hero.photo_upload": ("Profile Image", "प्रोफाइल फोटो"),

    # 2. Admin Timeline & Awards
    "timeline.section_header": ("Timeline", "समयरेखा"),
    "timeline.year_period": ("Year", "वर्ष"),
    "timeline.milestone_title": ("Title", "मुख्य घटना"),
    "timeline.description": ("Details", "विवरण"),
    "timeline.sort_order": ("Order", "क्रम"),
    "awards.section_header": ("Awards", "सम्मान व पुरस्कार"),
    "awards.name": ("Award Name", "पुरस्कार"),
    "awards.year": ("Year", "वर्ष"),
    "awards.organization": ("Organization", "संस्था"),

    # 3. Admin Home Manager
    "home.section_header": ("Home Setup", "होम सेटअप"),
    "home.hero_title": ("Main Heading", "मुख्य शीर्षक"),
    "home.hero_subtitle": ("Subheading", "उपशीर्षक"),
    "home.bio_excerpt": ("Brief Intro", "परिचय"),
    "home.single_row_limit": ("Max Items", "सीमा"),

    # 4. Admin Poetry Manager
    "poetry.section_header": ("Poetry Archive", "काव्य संग्रह"),
    "poetry.title": ("Poem Title *", "कविता शीर्षक *"),
    "poetry.context_lines": ("Context *", "परिचय पंक्ति *"),
    "poetry.stanzas": ("Poem Text *", "कविता पाठ *"),
    "poetry.krutidev_convert": ("Kruti Dev > Unicode", "कृतिदेव > यूनिकोड"),
    "poetry.sort_order": ("Order", "क्रम"),
    "poetry.audio_link": ("Audio Link", "ऑडियो लिंक"),
    "poetry.category_select": ("Category", "श्रेणी"),

    # 5. Admin Publications Manager
    "pub.section_header": ("Publications", "प्रकाशन"),
    "pub.title": ("Book Title *", "पुस्तक शीर्षक *"),
    "pub.overview": ("Summary", "विवरण"),
    "pub.cover_upload": ("Cover Photo", "कवर फोटो"),
    "pub.sample_stanzas": ("Sample Stanzas", "काव्य अंश"),
    "pub.purchase_link": ("Buy Link", "खरीद लिंक"),
    "pub.price": ("Price", "कीमत"),
    "pub.publisher": ("Publisher", "प्रकाशक"),

    # 6. Admin Contact & Inbox
    "contact.office_address": ("Address", "पता"),
    "contact.phone_whatsapp": ("Phone / WhatsApp", "फोन / व्हाट्सएप"),
    "contact.email": ("Email", "ईमेल"),
    "inbox.sender_col": ("From", "प्रेषक"),
    "inbox.date_col": ("Date", "तिथि"),
    "inbox.reply_action": ("Reply", "उत्तर दें"),
    "inbox.mark_read": ("Mark Read", "पढ़ा गया"),
    "inbox.delete_action": ("Delete", "हटाएं"),

    # 7. PageMaker Canvas (PM5 Desk)
    "pm5.layout_controls": ("Page Control", "पेज कंट्रोल"),
    "pm5.apply": ("Apply", "लागू करें"),
    "pm5.exit": ("Exit", "बाहर निकलें"),
    "pm5.new_page": ("Add Page", "नया पेज"),
    "pm5.krutidev_btn": ("🔄 Kruti Dev > Unicode", "🔄 कृतिदेव > यूनिकोड"),
    "pm5.autoflow_indicator": ("Auto-Flow", "ऑटो-फ्लो"),

    # 8. Public Site Navigation & Actions
    "public_nav.home": ("Home", "होम"),
    "public_nav.about": ("Biography", "परिचय"),
    "public_nav.poetry": ("Poetry", "कविताएं"),
    "public_nav.publications": ("Books", "पुस्तकें"),
    "public_nav.contact": ("Contact", "संपर्क"),
    "public_actions.read_more": ("Read More", "पढ़ें"),
    "public_actions.buy_now": ("Buy Book", "खरीदें"),
    "public_actions.sample": ("Preview", "अंश देखें"),
    "public_footer.copyright": ("© All Rights Reserved", "© सर्वाधिकार सुरक्षित")
}

missing = []
for key, (en, hi) in expected_dictionary.items():
    if en not in config_code or hi not in config_code:
        missing.append((key, en, hi))

if missing:
    print(f"FAILED: {len(missing)} entries missing from i18n config!")
    for m in missing:
        print("  -", m)
else:
    print(f"VERIFIED: All {len(expected_dictionary)} dictionary entries are 100% present in i18n config.js!")
