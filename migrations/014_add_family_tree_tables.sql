-- =====================================================
-- Migration 014: Add Family Members and Relationships Relational Tables
-- =====================================================

-- 1. Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_key text UNIQUE NOT NULL, -- e.g. 'f-201', 'f-101'
  name_hi text NOT NULL,
  name_en text NOT NULL,
  relation_hi text,
  relation_en text,
  gender text CHECK (gender IN ('male', 'female', 'M', 'F')),
  is_deceased boolean DEFAULT false,
  birth_date text,
  death_date text,
  generation integer DEFAULT 1,
  city text,
  phone text,
  photo_url text,
  bio text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure deleted_at column exists if table was created previously
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Family Relationships Table
CREATE TABLE IF NOT EXISTS public.family_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_key text NOT NULL, -- member_key of target person
  related_key text NOT NULL, -- member_key of parent, spouse, or child
  relationship_type text NOT NULL CHECK (relationship_type IN ('parent', 'spouse', 'child')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(person_key, related_key, relationship_type)
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;

-- 3. RLS Access Control Policies (Permissive Public & Admin Write Access)
DROP POLICY IF EXISTS "Public Read Family Members" ON public.family_members;
DROP POLICY IF EXISTS "Public Read Family Relationships" ON public.family_relationships;
DROP POLICY IF EXISTS "Admin Full Access Family Members" ON public.family_members;
DROP POLICY IF EXISTS "Admin Full Access Family Relationships" ON public.family_relationships;
DROP POLICY IF EXISTS "Public Manage Family Members" ON public.family_members;
DROP POLICY IF EXISTS "Public Manage Family Relationships" ON public.family_relationships;

CREATE POLICY "Public Manage Family Members" ON public.family_members
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Manage Family Relationships" ON public.family_relationships
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Soft-delete Trigger
DROP TRIGGER IF EXISTS trg_prevent_delete_family_members ON public.family_members;
CREATE TRIGGER trg_prevent_delete_family_members
BEFORE DELETE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

-- 5. Seed 35 Family Members Data
INSERT INTO public.family_members (member_key, name_hi, name_en, relation_hi, relation_en, generation, gender, is_deceased, birth_date, death_date, phone, city, photo_url, bio, sort_order) VALUES
('f-101', 'श्री भद्रसेन शर्मा', 'Shri Bhadrasen Sharma', 'दादाजी', 'Grandfather', 1, 'male', true, '10 Aug 1920', '15 May 2000', '+91 98290 11001', 'Jaipur', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'वंश परंपरा के मूल प्रपितामह एवं परिवार के पूज्य पुरोधा।', 1),
('f-102', 'श्रीमती कौशल्या शर्मा', 'Smt. Kaushalya Sharma', 'दादीजी', 'Grandmother', 1, 'female', true, '12 Oct 1925', '20 Nov 2005', '+91 98290 11002', 'Jaipur', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'परिवार की मूल संस्थापिका एवं स्नेहमयी दादीजी।', 2),
('m-101', 'श्री बंसीलाल शर्मा', 'Shri Bansilal Sharma', 'नानाजी', 'Maternal Grandfather', 1, 'male', true, '05 Jan 1922', '18 Apr 1999', '+91 98290 11003', 'Jodhpur', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'नानक वंश के पूज्य संस्थापक एवं वरिष्ठ मार्गदर्शक।', 3),
('m-102', 'श्रीमती कमला शर्मा', 'Smt. Kamla Sharma', 'नानीजी', 'Maternal Grandmother', 1, 'female', true, '18 Mar 1928', '10 Dec 2008', '+91 98290 11004', 'Jodhpur', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'ननिहाल परिवार की स्नेहमयी नानीजी।', 4),
('f-201', 'कवि गुरुप्रताप शर्मा "आग"', 'Kavi Gurupratap Sharma "Aag"', 'मुख्य साहित्यकार', 'Poet / Father', 2, 'male', false, '26 Jan 1945', NULL, '+91 98290 55432', 'Jaipur', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'हिंदी काव्य जगत के तेजस्वी हस्ताक्षर एवं वरिष्ठ साहित्यकार।', 5),
('f-202', 'श्रीमती अनिता शर्मा', 'Smt. Anita Sharma', 'माताश्री', 'Mother', 2, 'female', false, '14 Mar 1950', NULL, '+91 98290 55433', 'Jaipur', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'साहित्य साधना की प्रेरणास्रोत एवं गृह स्वामिनी।', 6),
('f-203', 'श्री चमन शर्मा', 'Shri Chaman Sharma', 'चाचाजी', 'Uncle', 2, 'male', false, '15 Aug 1948', NULL, '+91 94140 12345', 'Udaipur', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'परिवार के सम्मानित सदस्य एवं व्यवसायी।', 7),
('f-204', 'श्रीमती चमन शर्मा', 'Smt. Chaman Sharma', 'चाचीजी', 'Aunt', 2, 'female', false, '20 Nov 1952', NULL, '+91 94140 12346', 'Udaipur', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'गृहिणी।', 8),
('f-205', 'श्री सत्यप्रकाश शर्मा', 'Shri Satyaprakash Sharma', 'चाचाजी', 'Uncle', 2, 'male', false, '10 Feb 1951', NULL, '+91 94140 22334', 'Kota', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'शिक्षाविद एवं समाजसेवी।', 9),
('f-206', 'श्रीमती सत्यप्रकाश शर्मा', 'Smt. Satyaprakash Sharma', 'चाचीजी', 'Aunt', 2, 'female', false, '05 May 1955', NULL, '+91 94140 22335', 'Kota', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'गृहिणी।', 10),
('f-207', 'श्री राजेन्द्र शर्मा', 'Shri Rajendra Sharma', 'चाचाजी', 'Uncle', 2, 'male', false, '14 Dec 1954', NULL, '+91 94140 33445', 'Jaipur', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'वरिष्ठ अधिकारी।', 11),
('f-208', 'श्रीमती राजेन्द्र शर्मा', 'Smt. Rajendra Sharma', 'चाचीजी', 'Aunt', 2, 'female', false, '22 Aug 1958', NULL, '+91 94140 33446', 'Jaipur', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'गृहिणी।', 12),
('f-209', 'श्रीमती किरण शर्मा', 'Smt. Kiran Sharma', 'बुआजी (पुत्री)', 'Paternal Aunt (Sister)', 2, 'female', false, '08 Apr 1958', NULL, '+91 98280 99887', 'New Delhi', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', 'परिवार की प्रिय पुत्री व बुआजी।', 13),
('f-210', 'श्री किरण पति', 'Shri Kiran Spouse', 'फूफाजी', 'Uncle-in-law', 2, 'male', false, '10 Jan 1954', NULL, '+91 98280 99888', 'New Delhi', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', 'समाजसेवी।', 14),
('m-201', 'श्रीमती सुनीता शर्मा', 'Smt. Sunita Sharma', 'मौसीजी', 'Maternal Aunt', 2, 'female', false, '12 May 1947', NULL, '+91 98290 22001', 'Jodhpur', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी की पुत्री।', 15),
('m-202', 'श्री राजकमल', 'Shri Rajkamal', 'मौसाजी', 'Uncle-in-law', 2, 'male', false, '10 Aug 1944', NULL, '+91 98290 22002', 'Jodhpur', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'सुनीता जी के पति।', 16),
('m-205', 'श्रीमती सरिता शर्मा', 'Smt. Sarita Sharma', 'मौसीजी', 'Maternal Aunt', 2, 'female', false, '15 Jul 1952', NULL, '+91 98290 22005', 'Jodhpur', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी की पुत्री।', 17),
('m-206', 'श्री भगवती', 'Shri Bhagwati', 'मौसाजी', 'Uncle-in-law', 2, 'male', false, '02 Mar 1949', NULL, '+91 98290 22006', 'Jodhpur', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'सरिता जी के पति।', 18),
('m-207', 'श्रीमती आशा शर्मा', 'Smt. Asha Sharma', 'मौसीजी', 'Maternal Aunt', 2, 'female', false, '18 Nov 1955', NULL, '+91 98290 22007', 'Jaipur', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी की पुत्री।', 19),
('m-208', 'श्री राजेन्द्र', 'Shri Rajendra', 'मौसाजी', 'Uncle-in-law', 2, 'male', false, '25 Dec 1952', NULL, '+91 98290 22008', 'Jaipur', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'आशा जी के पति।', 20),
('m-209', 'श्रीमती सविता शर्मा', 'Smt. Savita Sharma', 'मौसीजी', 'Maternal Aunt', 2, 'female', false, '04 Jun 1958', NULL, '+91 98290 22009', 'Ahmedabad', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी की पुत्री।', 21),
('m-210', 'श्री मुकेश', 'Shri Mukesh', 'मौसाजी', 'Uncle-in-law', 2, 'male', false, '14 Sep 1955', NULL, '+91 98290 22010', 'Ahmedabad', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'सविता जी के पति।', 22),
('m-211', 'श्री संदीप शर्मा', 'Shri Sandeep Sharma', 'मामाजी', 'Maternal Uncle', 2, 'male', false, '22 Feb 1960', NULL, '+91 98290 22011', 'Pune', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी के पुत्र।', 23),
('m-212', 'श्रीमती नमिता शर्मा', 'Smt. Namita Sharma', 'मामीजी', 'Maternal Aunt (Uncle Wife)', 2, 'female', false, '08 Oct 1963', NULL, '+91 98290 22012', 'Pune', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'संदीप जी की धर्मपत्नी।', 24),
('m-213', 'श्रीमती रजनी शर्मा', 'Smt. Rajni Sharma', 'मौसीजी', 'Maternal Aunt', 2, 'female', false, '11 Jan 1963', NULL, '+91 98290 22013', 'Mumbai', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी की पुत्री।', 25),
('m-214', 'श्री आशिष', 'Shri Ashish', 'मौसाजी', 'Uncle-in-law', 2, 'male', false, '30 Mar 1960', NULL, '+91 98290 22014', 'Mumbai', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'रजनी जी के पति।', 26),
('m-215', 'श्री संजीव शर्मा', 'Shri Sanjeev Sharma', 'मामाजी', 'Maternal Uncle', 2, 'male', false, '19 Aug 1965', NULL, '+91 98290 22015', 'Jaipur', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी के पुत्र।', 27),
('m-216', 'श्रीमती कविता शर्मा', 'Smt. Kavita Sharma', 'मामीजी', 'Maternal Aunt (Uncle Wife)', 2, 'female', false, '25 Nov 1968', NULL, '+91 98290 22016', 'Jaipur', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'संजीव जी की धर्मपत्नी।', 28),
('m-217', 'श्री राजेश शर्मा', 'Shri Rajesh Sharma', 'मामाजी', 'Maternal Uncle', 2, 'male', false, '02 Apr 1968', NULL, '+91 98290 22017', 'Kota', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'बंसीलाल जी के पुत्र।', 29),
('m-218', 'श्रीमती राजेश शर्मा', 'Smt. Rajesh Sharma', 'मामीजी', 'Maternal Aunt (Uncle Wife)', 2, 'female', false, '14 Dec 1971', NULL, '+91 98290 22018', 'Kota', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'राजेश जी की धर्मपत्नी।', 30),
('f-301', 'श्रीमती पूजा शर्मा (जोशी)', 'Smt. Puja Sharma Joshi', 'पुत्री', 'Daughter', 3, 'female', false, '18 Sep 1972', NULL, '+91 98290 77665', 'Mumbai', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', 'कवि गुरुप्रताप शर्मा जी की ज्येष्ठ पुत्री।', 31),
('f-302', 'श्री विकास जोशी', 'Shri Vikas Joshi', 'दामाद (जामातृ)', 'Son-in-law', 3, 'male', false, '04 Apr 1970', NULL, '+91 98290 77666', 'Mumbai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'पूजा जी के पति।', 32),
('f-303', 'श्री संकल्प शर्मा', 'Shri Sankalp Sharma', 'पुत्र (आर्किटेक्ट)', 'Son', 3, 'male', false, '11 Dec 1975', NULL, '+91 98290 44332', 'Bengaluru', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', 'वरिष्ठ सॉफ्टवेयर इंजीनियर एवं डिजिटल आर्किटेक्ट।', 33),
('f-304', 'श्रीमती चाँदनी शर्मा', 'Smt. Chandini Sharma', 'पुत्रवधू', 'Daughter-in-law', 3, 'female', false, '09 Aug 1979', NULL, '+91 98290 44333', 'Bengaluru', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'संकल्प जी की धर्मपत्नी।', 34),
('f-305', 'श्री सनातन शर्मा', 'Shri Sanatan Sharma', 'पुत्र', 'Son', 3, 'male', false, '02 Feb 1980', NULL, '+91 94141 88776', 'New Delhi', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'गुरुप्रताप जी के कनिष्ठ पुत्र।', 35)
ON CONFLICT (member_key) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en;

-- 6. Seed Family Relationships Data
INSERT INTO public.family_relationships (person_key, related_key, relationship_type) VALUES
-- Spouses
('f-101', 'f-102', 'spouse'),
('f-102', 'f-101', 'spouse'),
('m-101', 'm-102', 'spouse'),
('m-102', 'm-101', 'spouse'),
('f-201', 'f-202', 'spouse'),
('f-202', 'f-201', 'spouse'),
('f-203', 'f-204', 'spouse'),
('f-204', 'f-203', 'spouse'),
('f-205', 'f-206', 'spouse'),
('f-206', 'f-205', 'spouse'),
('f-207', 'f-208', 'spouse'),
('f-208', 'f-207', 'spouse'),
('f-209', 'f-210', 'spouse'),
('f-210', 'f-209', 'spouse'),
('m-201', 'm-202', 'spouse'),
('m-202', 'm-201', 'spouse'),
('m-205', 'm-206', 'spouse'),
('m-206', 'm-205', 'spouse'),
('m-207', 'm-208', 'spouse'),
('m-208', 'm-207', 'spouse'),
('m-209', 'm-210', 'spouse'),
('m-210', 'm-209', 'spouse'),
('m-211', 'm-212', 'spouse'),
('m-212', 'm-211', 'spouse'),
('m-213', 'm-214', 'spouse'),
('m-214', 'm-213', 'spouse'),
('m-215', 'm-216', 'spouse'),
('m-216', 'm-215', 'spouse'),
('m-217', 'm-218', 'spouse'),
('m-218', 'm-217', 'spouse'),
('f-301', 'f-302', 'spouse'),
('f-302', 'f-301', 'spouse'),
('f-303', 'f-304', 'spouse'),
('f-304', 'f-303', 'spouse'),
('f-305', 'f-306', 'spouse'),
('f-306', 'f-305', 'spouse'),

-- Parents & Children
('f-201', 'f-101', 'parent'),
('f-201', 'f-102', 'parent'),
('f-203', 'f-101', 'parent'),
('f-203', 'f-102', 'parent'),
('f-205', 'f-101', 'parent'),
('f-205', 'f-102', 'parent'),
('f-207', 'f-101', 'parent'),
('f-207', 'f-102', 'parent'),
('f-209', 'f-101', 'parent'),
('f-209', 'f-102', 'parent'),

('f-202', 'm-101', 'parent'),
('f-202', 'm-102', 'parent'),
('m-201', 'm-101', 'parent'),
('m-201', 'm-102', 'parent'),
('m-205', 'm-101', 'parent'),
('m-205', 'm-102', 'parent'),
('m-207', 'm-101', 'parent'),
('m-207', 'm-102', 'parent'),
('m-209', 'm-101', 'parent'),
('m-209', 'm-102', 'parent'),
('m-211', 'm-101', 'parent'),
('m-211', 'm-102', 'parent'),
('m-213', 'm-101', 'parent'),
('m-213', 'm-102', 'parent'),
('m-215', 'm-101', 'parent'),
('m-215', 'm-102', 'parent'),
('m-217', 'm-101', 'parent'),
('m-217', 'm-102', 'parent'),

('f-301', 'f-201', 'parent'),
('f-301', 'f-202', 'parent'),
('f-303', 'f-201', 'parent'),
('f-303', 'f-202', 'parent'),
('f-305', 'f-201', 'parent'),
('f-305', 'f-202', 'parent')
ON CONFLICT (person_key, related_key, relationship_type) DO NOTHING;
