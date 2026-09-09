-- =====================================================
-- Migration 010: Add Timeline, Awards, and Contact Submissions Tables
-- =====================================================

-- 1. Timeline Milestones Table
CREATE TABLE IF NOT EXISTS public.timeline_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_display text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Awards & Honors Table
CREATE TABLE IF NOT EXISTS public.awards_honors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_display text NOT NULL,
  title text NOT NULL,
  organization text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Contact Form Submissions Inbox Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards_honors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Permissive Public Access Policies for REST API reads and contact form posting
DROP POLICY IF EXISTS "Public read timeline" ON public.timeline_milestones;
CREATE POLICY "Public read timeline" ON public.timeline_milestones FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public manage timeline" ON public.timeline_milestones;
CREATE POLICY "Public manage timeline" ON public.timeline_milestones FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read awards" ON public.awards_honors;
CREATE POLICY "Public read awards" ON public.awards_honors FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public manage awards" ON public.awards_honors;
CREATE POLICY "Public manage awards" ON public.awards_honors FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert contact" ON public.contact_submissions;
CREATE POLICY "Public insert contact" ON public.contact_submissions FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public manage contact" ON public.contact_submissions;
CREATE POLICY "Public manage contact" ON public.contact_submissions FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed Initial Timeline Data
INSERT INTO public.timeline_milestones (year_display, title, description, sort_order) VALUES
('१९४५', 'जन्म एवं प्रारम्भिक शिक्षा', 'साहित्यिक वातावरण में बाल्यकाल व्यतीत हुआ। संस्कृत एवं हिंदी साहित्य में उच्च शिक्षा पूर्ण की।', 1),
('१९६८', 'काव्य यात्रा का शुभारम्भ', 'प्रमुख राष्ट्रीय पत्र-पत्रिकाओं में कविताओं का प्रकाशन एवं कवि सम्मेलनों में ओजस्वी प्रस्तुति।', 2),
('१९८५', '''अग्नि कलश'' का प्रकाशन', 'प्रसिद्ध काव्य कृति ''अग्नि कलश'' का प्रथम संस्करण प्रकाशित, जिसे साहित्य जगत में अपार ख्याति मिली।', 3),
('२०२६', '५० वर्ष का साहित्यिक अवदान', 'हिंदी काव्य सेवा के ५० वर्ष पूर्ण होने पर राष्ट्रीय स्तर पर नागरिक अभिनंदन।', 4)
ON CONFLICT DO NOTHING;

-- Seed Initial Awards Data
INSERT INTO public.awards_honors (year_display, title, organization, sort_order) VALUES
('१९९५', 'राजस्थान साहित्य अकादमी सम्मान', 'राजस्थान सरकार', 1),
('२०१०', 'राष्ट्रकवि मैथिलीशरण गुप्त पुरस्कार', 'हिंदी साहित्य सम्मेलन', 2),
('२०२२', 'साहित्य जीवन साधना सम्मान', 'भारतीय भाषा परिषद', 3)
ON CONFLICT DO NOTHING;
