-- SQL Migration 012: Grant Public Access to all Content Tables (Disable RLS or Grant TO anon, authenticated)

-- Option A: Explicitly Disable RLS on public portfolio content tables
ALTER TABLE public.about_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards_honors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- Option B: Grant full permissions to anon & authenticated roles on all public schema tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
