-- Supabase Migration 013: Critical Database Protection Safeguards
-- Description: Enables Row Level Security (RLS), adds BEFORE DELETE soft-delete triggers, and enforces column defaults.

--------------------------------------------------------------------------------
-- 1. COLUMN DEFAULTS & SCHEMA INTEGRITY
--------------------------------------------------------------------------------
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.categories ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.poems ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.publications ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.about_content ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.about_content ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.about_content ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.timeline_milestones ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.timeline_milestones ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.timeline_milestones ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.awards_honors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.awards_honors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.awards_honors ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ALTER COLUMN is_deleted SET DEFAULT FALSE;

ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contact_submissions ALTER COLUMN is_deleted SET DEFAULT FALSE;


--------------------------------------------------------------------------------
-- 2. POSTGRESQL BEFORE DELETE SOFT-DELETE TRIGGERS
--------------------------------------------------------------------------------
-- Function to intercept physical DELETE queries and auto-convert to soft-delete
CREATE OR REPLACE FUNCTION public.prevent_physical_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Perform a soft-delete update on the target row instead of physical deletion
  EXECUTE format('UPDATE %I.%I SET is_deleted = true, is_active = false WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME) USING OLD.id;
  -- Return NULL to abort the physical DELETE operation gracefully
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to all content tables
DROP TRIGGER IF EXISTS trg_prevent_delete_categories ON public.categories;
CREATE TRIGGER trg_prevent_delete_categories
BEFORE DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_poems ON public.poems;
CREATE TRIGGER trg_prevent_delete_poems
BEFORE DELETE ON public.poems
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_publications ON public.publications;
CREATE TRIGGER trg_prevent_delete_publications
BEFORE DELETE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_about_content ON public.about_content;
CREATE TRIGGER trg_prevent_delete_about_content
BEFORE DELETE ON public.about_content
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_timeline ON public.timeline_milestones;
CREATE TRIGGER trg_prevent_delete_timeline
BEFORE DELETE ON public.timeline_milestones
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_awards ON public.awards_honors;
CREATE TRIGGER trg_prevent_delete_awards
BEFORE DELETE ON public.awards_honors
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_settings ON public.settings;
CREATE TRIGGER trg_prevent_delete_settings
BEFORE DELETE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();


--------------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
--------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards_honors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;


--------------------------------------------------------------------------------
-- 4. RLS ACCESS CONTROL POLICIES
--------------------------------------------------------------------------------
-- Drop legacy or conflicting policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Poems" ON public.poems;
DROP POLICY IF EXISTS "Public Read Publications" ON public.publications;
DROP POLICY IF EXISTS "Public Read About" ON public.about_content;
DROP POLICY IF EXISTS "Public Read Timeline" ON public.timeline_milestones;
DROP POLICY IF EXISTS "Public Read Awards" ON public.awards_honors;
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Anon Insert Contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin Full Access Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Full Access Poems" ON public.poems;
DROP POLICY IF EXISTS "Admin Full Access Publications" ON public.publications;
DROP POLICY IF EXISTS "Admin Full Access About" ON public.about_content;
DROP POLICY IF EXISTS "Admin Full Access Timeline" ON public.timeline_milestones;
DROP POLICY IF EXISTS "Admin Full Access Awards" ON public.awards_honors;
DROP POLICY IF EXISTS "Admin Full Access Settings" ON public.settings;
DROP POLICY IF EXISTS "Admin Full Access Contact" ON public.contact_submissions;

-- Public / Anonymous SELECT policies (Active & Non-deleted only)
CREATE POLICY "Public Read Categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read Poems" ON public.poems
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read Publications" ON public.publications
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read About" ON public.about_content
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read Timeline" ON public.timeline_milestones
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read Awards" ON public.awards_honors
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false AND coalesce(is_active, true) = true);

CREATE POLICY "Public Read Settings" ON public.settings
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_deleted, false) = false);

-- Contact Submissions: Public INSERT only (Cannot SELECT other people's submissions)
CREATE POLICY "Anon Insert Contact" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Authenticated Admin Policies: Full access to ALL records (including soft-deleted for TrashBin)
CREATE POLICY "Admin Full Access Categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Poems" ON public.poems
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Publications" ON public.publications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access About" ON public.about_content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Timeline" ON public.timeline_milestones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Awards" ON public.awards_honors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Settings" ON public.settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Contact" ON public.contact_submissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
