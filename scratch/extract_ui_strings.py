import json
import re
import os

app_dir = "/Users/sankalpg/Documents/Project/aag/src"

extracted = []

def add_entry(key, current_hi, current_en, location, category):
    extracted.append({
        "key": key,
        "current_text_hi": current_hi,
        "current_text_en": current_en,
        "location": location,
        "category": category
    })

# 1. Navigation & Public Header / Footer
add_entry("nav.home", "होम", "Home", "Header.jsx", "Public Navigation")
add_entry("nav.about", "परिचय", "About", "Header.jsx", "Public Navigation")
add_entry("nav.poetry", "कविताएं", "Poetry", "Header.jsx", "Public Navigation")
add_entry("nav.books", "पुस्तकें", "Books", "Header.jsx", "Public Navigation")
add_entry("nav.contact", "संपर्क", "Contact", "Header.jsx", "Public Navigation")
add_entry("header.switch_lang", "English", "हिंदी", "Header.jsx", "Public Navigation")
add_entry("header.admin_panel", "एडमिन पैनल", "Admin Panel", "Header.jsx", "Public Navigation")
add_entry("header.logout", "लॉगआउट", "Logout", "Header.jsx", "Public Navigation")
add_entry("footer.copyright", "सर्वाधिकार सुरक्षित", "All Rights Reserved", "Footer.jsx", "Public Footer")
add_entry("footer.quick_links", "त्वरित लिंक्स", "Quick Links", "Footer.jsx", "Public Footer")
add_entry("footer.contact_title", "संपर्क सूत्र", "Contact Info", "Footer.jsx", "Public Footer")
add_entry("footer.admin_access", "एडमिन लॉगिन", "Admin Portal", "Footer.jsx", "Public Footer")

# 2. Public Common & Buttons
add_entry("common.read_more", "पढ़ें →", "Read →", "PoemCard.jsx", "Public Common")
add_entry("common.buy_now", "अभी खरीदें", "Buy Now", "PublicationCard.jsx", "Public Common")
add_entry("common.sample_chapter", "नमूना अध्याय", "Sample Chapter", "PublicationCard.jsx", "Public Common")
add_entry("common.back_to_home", "← होम पर वापस जाएं", "← Back to Home", "CategoryDetail.jsx", "Public Common")
add_entry("common.listen_poem", "कविता सुनें 🔊", "Listen to Poem 🔊", "PoemPage.jsx", "Public Common")

# 3. Public Contact & Modal
add_entry("contact_form.title", "सीधा संदेश भेजें (Direct Message)", "Send a Direct Message", "Contact.jsx", "Public Contact")
add_entry("contact_form.name_label", "आपका नाम *", "Your Name *", "Contact.jsx", "Public Contact")
add_entry("contact_form.name_placeholder", "जैसे: राजेश कुमार", "e.g. Rajesh Kumar", "Contact.jsx", "Public Contact")
add_entry("contact_form.email_label", "आपका ईमेल *", "Your Email *", "Contact.jsx", "Public Contact")
add_entry("contact_form.email_placeholder", "जैसे: rajesh@example.com", "e.g. rajesh@example.com", "Contact.jsx", "Public Contact")
add_entry("contact_form.subject_label", "विषय", "Subject", "Contact.jsx", "Public Contact")
add_entry("contact_form.subject_placeholder", "जैसे: काव्य सम्मेलन आमंत्रण / प्रतिक्रिया", "e.g. Event Invitation / Feedback", "Contact.jsx", "Public Contact")
add_entry("contact_form.message_label", "आपका संदेश *", "Your Message *", "Contact.jsx", "Public Contact")
add_entry("contact_form.message_placeholder", "यहाँ अपना विस्तृत संदेश लिखें...", "Type your detailed message here...", "Contact.jsx", "Public Contact")
add_entry("contact_form.send_btn", "📨 भेजें", "📨 Send", "Contact.jsx", "Public Contact")
add_entry("contact_form.sending_btn", "⏳ भेजा जा रहा है...", "⏳ Sending...", "Contact.jsx", "Public Contact")
add_entry("contact_form.success_msg", "✓ आपका संदेश सफलतापूर्वक भेज दिया गया है!", "✓ Your message has been sent successfully!", "Contact.jsx", "Public Contact")

# 4. Admin Sidebar Navigation
add_entry("admin_sidebar.home", "होम", "Home", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.hero", "हीरो बैनर", "Hero Banner", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.bio_excerpt", "परिचय सारांश", "Bio Excerpt", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.featured", "प्रमुख रचनाएं व पुस्तकें", "Featured Works", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.highlights", "मुख्य उपलब्धियां", "Highlights & Awards", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.about", "परिचय", "About", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.overview_hero", "कवि परिचय व बैनर", "Overview & Hero", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.timeline", "जीवन यात्रा (टाइमलाइन)", "Timeline", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.awards", "पुरस्कार व सम्मान", "Awards & Honors", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.poetry", "कविताएं", "Poetry", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.books", "पुस्तकें", "Books", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.inbox", "संदेश", "Inbox", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.contact_info", "संपर्क विवरण", "Contact Info", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.received_inbox", "प्राप्त संदेश", "Received Inbox", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.settings", "सेटिंग्स", "Settings", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.main_site", "मुख्य साइट", "Main Site", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.switch_lang", "हिंदी / English", "English / Hindi", "Dashboard.jsx", "Admin Sidebar")
add_entry("admin_sidebar.logout", "लॉगआउट", "Logout", "Dashboard.jsx", "Admin Sidebar")

# 5. Admin Top Sticky Header Controls
add_entry("admin_header.save_btn", "💾 सहेजें", "💾 Save", "Dashboard.jsx", "Admin Sticky Header")
add_entry("admin_header.unsaved_badge", "⚠️ बिना सहेजा", "⚠️ Unsaved", "Dashboard.jsx", "Admin Sticky Header")

# 6. Global Card Hover Action Badges
add_entry("card_badge.edit", "बदलें", "Edit", "ContentItemCard.jsx", "Admin Card Actions")
add_entry("card_badge.move_up", "ऊपर", "Move Up", "ContentItemCard.jsx", "Admin Card Actions")
add_entry("card_badge.move_down", "नीचे", "Move Down", "ContentItemCard.jsx", "Admin Card Actions")
add_entry("card_badge.delete", "हटाएं", "Delete", "ContentItemCard.jsx", "Admin Card Actions")
add_entry("card_badge.reply", "जवाब दें", "Reply", "Dashboard.jsx", "Admin Card Actions")
add_entry("card_badge.mark_read", "पढ़ा हुआ", "Mark Read", "Dashboard.jsx", "Admin Card Actions")
add_entry("card_badge.mark_unread", "अपठित", "Mark Unread", "Dashboard.jsx", "Admin Card Actions")

# 7. PageMaker / Layout Canvas (PM5)
add_entry("pm5_canvas.edit_layout_btn", "🎨 लेआउट बदलें", "🎨 Edit Layout", "Dashboard.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.apply_btn", "💾 लागू करें", "💾 Apply", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.new_page_btn", "📄 नया पृष्ठ", "📄 New Page", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.exit_btn", "✕ बाहर निकलें", "✕ Exit", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.krutidev_btn", "🔄 कृतिदेव ➔ यूनिकोड", "🔄 Kruti Dev ➔ Unicode", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.undo_btn", "↩️ पूर्ववत", "↩️ Undo", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.redo_btn", "↪️ पुनः", "↪️ Redo", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.fullscreen_btn", "⛶ Fullscreen", "⛶ Fullscreen", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.format_info", "प्रारूप: अधिकतम २० पंक्तियाँ/पृष्ठ • स्वचालित पृष्ठ विभाजन", "Format: Max 20 Lines/Page • Auto-Flow & Line Wrap", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.autosaving", "⏳ सहेजा जा रहा है...", "⏳ Saving...", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.autosaved", "💾 स्वतः सहेजा गया", "💾 Auto-saved", "PM5WritingDesk.jsx", "PageMaker Canvas")
add_entry("pm5_canvas.add_page_btn", "+ नया पृष्ठ जोड़ें", "+ Add New Page", "PM5WritingDesk.jsx", "PageMaker Canvas")

# 8. Home Manager (/admin/home)
add_entry("home_mgr.hero_title_label", "हीरो मुख्य शीर्षक (Hero Main Title)", "Hero Main Title", "Dashboard.jsx", "Admin Home Manager")
add_entry("home_mgr.hero_subtitle_label", "हीरो उप-शीर्षक / कवि नाम", "Hero Subtitle / Author Name", "Dashboard.jsx", "Admin Home Manager")
add_entry("home_mgr.bio_excerpt_label", "कवि परिचय सारांश (Bio Excerpt)", "Bio Excerpt", "Dashboard.jsx", "Admin Home Manager")
add_entry("home_mgr.featured_poems_limit", "होम पेज पर प्रमुख कविताओं की अधिकतम संख्या", "Max Featured Poems on Home Page", "Dashboard.jsx", "Admin Home Manager")
add_entry("home_mgr.featured_pubs_limit", "होम पेज पर प्रमुख पुस्तकों की अधिकतम संख्या", "Max Featured Publications on Home Page", "Dashboard.jsx", "Admin Home Manager")

# 9. Poetry Manager (/admin/kavya-sangrah)
add_entry("poetry_mgr.title_label", "कविता / रचना का शीर्षक *", "Poem Title *", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.title_placeholder", "जैसे: सुबह की किरण", "e.g. Subah Ki Kiran", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.desc_label", "रचना संदर्भ / संक्षिप्त विवरण (अधिकतम २ पंक्तियाँ, १६० अक्षर)", "Context / Brief Description (Max 2 lines, 160 chars)", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.desc_placeholder", "संक्षिप्त २ पंक्तियों में संदर्भ (अधिकतम ८० अक्षर प्रति पंक्ति)...", "Brief 2-line context (max 80 chars per line)...", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.stanzas_label", "सम्पूर्ण कविता पंक्तियाँ *", "Full Stanzas / Verse Text *", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.krutidev_btn", "🔄 कृतिदेव ➔ यूनिकोड", "🔄 Kruti Dev ➔ Unicode", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.sort_order_label", "क्रम संख्या", "Sort Order", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.add_new_btn", "+ नई रचना जोड़ें", "+ Add New Poem", "Dashboard.jsx", "Admin Poetry Manager")
add_entry("poetry_mgr.back_to_list", "← काव्य संग्रह सूची पर वापस जाएं", "← Back to Poems List", "Dashboard.jsx", "Admin Poetry Manager")

# 10. Publications Manager (/admin/prakashan)
add_entry("pub_mgr.title_label", "पुस्तक का शीर्षक *", "Book Title *", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.title_placeholder", "जैसे: ओजस्वी काव्य संग्रह", "e.g. Ojaswi Kavya Sangrah", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.desc_label", "संक्षिप्त विवरण / भूमिका", "Description / Brief Overview", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.cover_image_label", "कवर चित्र (Book Cover Image)", "Book Cover Image", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.stanzas_label", "सम्पूर्ण पद / पुस्तक अंश (Stanzas / Full Text)", "Full Stanzas / Excerpt Text", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.krutidev_btn", "🔄 कृतिदेव ➔ यूनिकोड", "🔄 Kruti Dev ➔ Unicode", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.sort_order_label", "क्रम संख्या", "Sort Order", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.purchase_url_label", "खरीदने का लिंक (Purchase Link URL)", "Purchase Link URL", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.add_new_btn", "+ नई पुस्तक जोड़ें", "+ Add New Publication", "Dashboard.jsx", "Admin Publications Manager")
add_entry("pub_mgr.back_to_list", "← प्रकाशन सूची पर वापस जाएं", "← Back to Publications List", "Dashboard.jsx", "Admin Publications Manager")

# 11. About / Timeline / Awards Manager (/admin/about)
add_entry("about_mgr.author_name_label", "कवि का नाम (Author Name)", "Author Name", "Dashboard.jsx", "Admin About Manager")
add_entry("about_mgr.hero_tag_label", "कवि टैगलाइन / पदनाम", "Tagline / Designation", "Dashboard.jsx", "Admin About Manager")
add_entry("about_mgr.overview_bio_label", "कवि विस्तृत परिचय (Detailed Overview Bio)", "Detailed Overview Bio", "Dashboard.jsx", "Admin About Manager")
add_entry("timeline_mgr.year_label", "वर्ष / काल (e.g. 1975 या १९७५)", "Year / Period", "Dashboard.jsx", "Admin Timeline Manager")
add_entry("timeline_mgr.title_label", "उपलब्धि / मील का पत्थर शीर्षक", "Milestone Title", "Dashboard.jsx", "Admin Timeline Manager")
add_entry("timeline_mgr.desc_label", "विवरण (Description)", "Description", "Dashboard.jsx", "Admin Timeline Manager")
add_entry("awards_mgr.title_label", "पुरस्कार / सम्मान नाम", "Award / Honor Name", "Dashboard.jsx", "Admin Awards Manager")
add_entry("awards_mgr.year_label", "वर्ष", "Year", "Dashboard.jsx", "Admin Awards Manager")
add_entry("awards_mgr.org_label", "प्रदाता संस्था (Awarding Organization)", "Awarding Organization", "Dashboard.jsx", "Admin Awards Manager")

# 12. Contact & Inbox (/admin/contact & /admin/inbox)
add_entry("inbox_mgr.title", "📬 प्राप्त संदेश इनबॉक्स", "📬 Messages Inbox", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.subject_prefix", "विषय:", "Subject:", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.no_subject", "(कोई विषय नहीं)", "(No Subject)", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.reply_btn", "जवाब दें", "Reply", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.mark_read_btn", "पढ़ा हुआ", "Mark Read", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.mark_unread_btn", "अपठित", "Mark Unread", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("inbox_mgr.delete_btn", "हटाएं", "Delete", "Dashboard.jsx", "Admin Inbox Manager")
add_entry("contact_mgr.address_label", "संपर्क पता (Office / Residence Address)", "Office / Residence Address", "Dashboard.jsx", "Admin Contact Manager")
add_entry("contact_mgr.phone_label", "फोन नंबर (Phone / WhatsApp)", "Phone / WhatsApp Number", "Dashboard.jsx", "Admin Contact Manager")
add_entry("contact_mgr.email_label", "ईमेल पता (Email Address)", "Email Address", "Dashboard.jsx", "Admin Contact Manager")

# 13. Site Settings (/admin/settings)
add_entry("settings_mgr.site_title_label", "वेबसाइट का मुख्य शीर्षक", "Site Main Title", "Dashboard.jsx", "Admin Settings Manager")
add_entry("settings_mgr.site_subtitle_label", "उप-शीर्षक / टैगलाइन", "Subtitle / Tagline", "Dashboard.jsx", "Admin Settings Manager")
add_entry("settings_mgr.logo_upload_label", "वेबसाइट लोगो (Site Logo)", "Site Logo Image", "Dashboard.jsx", "Admin Settings Manager")

# Output to JSON artifact
output_path = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/ui_translation_matrix.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(extracted, f, ensure_ascii=False, indent=2)

print(f"Successfully extracted {len(extracted)} UI string entries into {output_path}")
