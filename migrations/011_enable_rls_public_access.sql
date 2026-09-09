-- SQL Migration 011: Enable Public Read (SELECT) and Anonymous Submission (INSERT) Policies on all tables

-- 1. Enable RLS and add public read policy on about_content
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for about_content" ON public.about_content;
CREATE POLICY "Public read access for about_content" ON public.about_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for about_content" ON public.about_content;
CREATE POLICY "Allow all for about_content" ON public.about_content FOR ALL USING (true) WITH CHECK (true);

-- 2. Enable RLS and add public read policy on publications
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for publications" ON public.publications;
CREATE POLICY "Public read access for publications" ON public.publications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for publications" ON public.publications;
CREATE POLICY "Allow all for publications" ON public.publications FOR ALL USING (true) WITH CHECK (true);

-- 3. Enable RLS and add public read policy on poems
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for poems" ON public.poems;
CREATE POLICY "Public read access for poems" ON public.poems FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for poems" ON public.poems;
CREATE POLICY "Allow all for poems" ON public.poems FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable RLS and add public read policy on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for categories" ON public.categories;
CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable RLS and add public read policy on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for settings" ON public.settings;
CREATE POLICY "Public read access for settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for settings" ON public.settings;
CREATE POLICY "Allow all for settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable RLS and add public read policy on timeline_milestones
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for timeline_milestones" ON public.timeline_milestones;
CREATE POLICY "Public read access for timeline_milestones" ON public.timeline_milestones FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for timeline_milestones" ON public.timeline_milestones;
CREATE POLICY "Allow all for timeline_milestones" ON public.timeline_milestones FOR ALL USING (true) WITH CHECK (true);

-- 7. Enable RLS and add public read policy on awards_honors
ALTER TABLE public.awards_honors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for awards_honors" ON public.awards_honors;
CREATE POLICY "Public read access for awards_honors" ON public.awards_honors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for awards_honors" ON public.awards_honors;
CREATE POLICY "Allow all for awards_honors" ON public.awards_honors FOR ALL USING (true) WITH CHECK (true);

-- 8. Enable RLS and add public insert/select policy on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert access for contact_submissions" ON public.contact_submissions;
CREATE POLICY "Public insert access for contact_submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for contact_submissions" ON public.contact_submissions;
CREATE POLICY "Allow all for contact_submissions" ON public.contact_submissions FOR ALL USING (true) WITH CHECK (true);
