-- Enable extensions
create extension if not exists "pgcrypto";

-- categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name_en text not null,
  name_display text,
  content_type text not null, -- 'about' | 'publications' | 'writings'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_categories_sort on categories(sort_order);

-- about_content (one row per site)
create table about_content (
  id uuid primary key default gen_random_uuid(),
  title text,
  body_text text, -- allow markdown/html
  truncated_preview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- publications
create table publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text, -- Supabase Storage path
  image_alt text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_publications_sort on publications(sort_order);

-- poems (writings)
create table poems (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  heading text,
  description text,
  full_text text,
  language text default 'mixed', -- optional
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_poems_order on poems(sort_order);

-- settings (key/value)
create table settings (
  key text primary key,
  value text,
  display_label text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed settings
insert into settings (key, value, display_label) values
('phone', '+917676885989', 'Call me'),
('whatsapp', 'https://wa.me/917676885989', 'Whatsapp me'),
('default_accent', '#964B00', 'Default Accent'),
('site_title', 'Gurupratap Sharma | AAG', 'Site Title');

-- Seed categories
insert into categories (sort_order, name_en, name_display, content_type) values
(1, 'About Gurupratap Sharma', 'About Gurupratap Sharma', 'about'),
(2, 'My Publications', 'My Publications', 'publications'),
(3, 'My Writings', 'My Writings', 'writings');

-- Seed about content
insert into about_content (title, body_text, truncated_preview) values
('About Gurupratap Sharma', 
'# About Gurupratap Sharma

Gurupratap Sharma is a distinguished poet and writer, whose works reflect deep philosophical insights and cultural richness. Through his writings, he explores themes of spirituality, human connection, and the beauty of language.

His contributions to literature have been recognized widely, and his publications continue to inspire readers across the globe.', 
'Gurupratap Sharma is a distinguished poet and writer, whose works reflect deep philosophical insights and cultural richness.');

-- Seed sample publications (with placeholder image paths)
insert into publications (title, subtitle, image_path, image_alt, description, sort_order) values
('Book One', 'Subtitle One', 'publications/placeholder/book1.jpg', 'Book One Cover', 'This is the first publication by Gurupratap Sharma.', 1),
('Book Two', 'Subtitle Two', 'publications/placeholder/book2.jpg', 'Book Two Cover', 'This is the second publication showcasing unique perspectives.', 2),
('Book Three', 'Subtitle Three', 'publications/placeholder/book3.jpg', 'Book Three Cover', 'The third publication delves into deeper themes of life and spirituality.', 3),
('Book Four', 'Subtitle Four', 'publications/placeholder/book4.jpg', 'Book Four Cover', 'A collection of profound writings and poems.', 4),
('Book Five', 'Subtitle Five', 'publications/placeholder/book5.jpg', 'Book Five Cover', 'Exploring the nuances of language and expression.', 5),
('Book Six', 'Subtitle Six', 'publications/placeholder/book6.jpg', 'Book Six Cover', 'A journey through words and emotions.', 6),
('Book Seven', 'Subtitle Seven', 'publications/placeholder/book7.jpg', 'Book Seven Cover', 'Reflections on life, love, and wisdom.', 7),
('Book Eight', 'Subtitle Eight', 'publications/placeholder/book8.jpg', 'Book Eight Cover', 'The latest collection of inspiring works.', 8);

-- Seed sample poems
insert into poems (sort_order, heading, description, full_text) values
(1, 'Poem Heading 1', 'A beautiful poem about life and nature', 
'जीवन एक यात्रा है,\nसुख दुख का संगम है।\nहर पल नया अनुभव है,\nहर क्षण एक संदेश है।\n\nLife is a journey,\nA confluence of joy and sorrow.\nEvery moment is a new experience,\nEvery instant is a message.'),
(2, 'Poem Heading 2', 'Reflections on time and existence', 
'समय बीत जाता है,\nपल पल में बदलता है।\nहम सोचते हैं कि क्या है,\nलेकिन समय ही जवाब देता है।\n\nTime passes by,\nChanges in every moment.\nWe wonder what it is,\nBut time itself gives the answer.'),
(3, 'Poem Heading 3', 'A poem about love and connection', 
'प्रेम एक भावना है,\nजो दिल को जोड़ती है।\nभाषा की सीमा नहीं,\nसिर्फ भाव की गहराई है।\n\nLove is an emotion,\nThat connects hearts.\nNo language barrier,\nOnly depth of feeling.'),
(4, 'Poem Heading 4', 'Contemplations on wisdom', 
'ज्ञान एक दीपक है,\nजो अंधकार मिटाता है।\nसीखना जीवन का उद्देश्य,\nसमझना सच्ची खुशी है।\n\nKnowledge is a lamp,\nThat dispels darkness.\nLearning is life''s purpose,\nUnderstanding is true happiness.'),
(5, 'Poem Heading 5', 'Ode to poetry itself', 
'कविता शब्दों का संगम,\nभावनाओं का अभिव्यक्ति।\nहर पंक्ति एक कहानी,\nहर शब्द एक भाव।\n\nPoetry is a confluence of words,\nExpression of emotions.\nEvery line is a story,\nEvery word is a feeling.');

