-- Migration 009: Rename & Cleanup Categories to match site sections

UPDATE categories 
SET name_en = 'Kavi Parichay (About)', name_display = 'कवि परिचय (About)', sort_order = 1 
WHERE content_type = 'about' OR name_en = 'About Display' OR name_display = 'About Display' OR name_en = 'About Gurupratap Sharma';

UPDATE categories 
SET name_en = 'Prakashan (Publications)', name_display = 'प्रकाशन (Publications)', sort_order = 2 
WHERE content_type = 'publications' OR name_en = 'My Publications' OR name_display = 'My Publications';

UPDATE categories 
SET name_en = 'Kavya Sangrah (Poetry Collection)', name_display = 'काव्य संग्रह (Poetry Collection)', sort_order = 3 
WHERE content_type = 'writings' OR name_en = '2My Writings' OR name_en = 'My Writings';

-- Delete temporary test entries
DELETE FROM categories 
WHERE name_en LIKE '%3 writing%' OR name_display LIKE '%3 writing%' OR name_en LIKE '%test%';
