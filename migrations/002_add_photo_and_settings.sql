-- Add photo_path to about_content
ALTER TABLE about_content 
ADD COLUMN IF NOT EXISTS photo_path text;

-- Add thank_you_message to settings
INSERT INTO settings (key, value, display_label) VALUES
('thank_you_message', 'Thank you!', 'Thank You Message')
ON CONFLICT (key) DO NOTHING;

-- Add email settings
INSERT INTO settings (key, value, display_label) VALUES
('email', '', 'Email Address'),
('email_text', 'Email me', 'Email Link Text')
ON CONFLICT (key) DO NOTHING;

-- Add whatsapp_text setting
INSERT INTO settings (key, value, display_label) VALUES
('whatsapp_text', 'Whatsapp me', 'Whatsapp Link Text')
ON CONFLICT (key) DO NOTHING;

-- Add phone_text setting
INSERT INTO settings (key, value, display_label) VALUES
('phone_text', 'Call me', 'Phone Link Text')
ON CONFLICT (key) DO NOTHING;