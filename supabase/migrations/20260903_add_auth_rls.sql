-- ============================================================================
-- AVENIQ AI - Authentication & Row Level Security migration (FINAL, verified)
-- ----------------------------------------------------------------------------
-- RUN THIS MANUALLY IN THE SUPABASE DASHBOARD SQL EDITOR (one paste, one pass).
--
-- Owner of existing documents: bc613cf7-2464-47a9-af1b-23594f319114
-- (real authenticated user - all existing documents are assigned to this UUID)
--
-- Guarantees:
--   * Idempotent: any existing policies on documents / document_chunks are
--     dropped first, so there are NO duplicate-policy errors on re-run.
--   * No existing documents are deleted.
--   * No user_id is fabricated (only the real confirmed UUID is used).
--   * documents.user_id is added and enforced NOT NULL.
--   * RLS + per-user policies on documents and document_chunks.
--   * match_document_chunks(vector(768), float, int) signature and return
--     shape (id, document_id, content, similarity) preserved; search scoped
--     to auth.uid()'s documents.
--   * document_chunks cascade on document delete (no orphan chunks).
--   * anon/PUBLIC access revoked; only authenticated granted.
--   * No service-role key involved.
-- ============================================================================


-- ============================================================================
-- SECTION 1 - Add ownership column (idempotent)
-- ============================================================================
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;


-- ============================================================================
-- SECTION 2 - Assign all existing documents to the real confirmed user
--            (Option A). Does NOT delete anything.
-- ============================================================================
UPDATE public.documents
  SET user_id = 'bc613cf7-2464-47a9-af1b-23594f319114'
  WHERE user_id IS NULL;


-- ============================================================================
-- SECTION 3 - Enforce ownership on new rows
-- ============================================================================
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;


-- ============================================================================
-- SECTION 3b - Ensure document_chunks cascades on document delete
-- ----------------------------------------------------------------------------
-- Explicitly drop AND recreate the document_id foreign key with ON DELETE
-- CASCADE so deleting a document can never leave searchable orphan chunks.
-- Idempotent: safe to re-run.
-- ============================================================================
ALTER TABLE public.document_chunks
  DROP CONSTRAINT IF EXISTS document_chunks_document_id_fkey;

ALTER TABLE public.document_chunks
  ADD CONSTRAINT document_chunks_document_id_fkey
    FOREIGN KEY (document_id)
    REFERENCES public.documents(id)
    ON DELETE CASCADE;


-- ============================================================================
-- SECTION 4 - Remove any legacy / duplicate policies
-- ----------------------------------------------------------------------------
-- Drop all existing policies on both tables first to avoid duplicate-policy
-- errors and to remove any legacy permissive policies (e.g. using(true)).
-- ============================================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT p.policyname, p.tablename
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename IN ('documents', 'document_chunks')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ============================================================================
-- SECTION 5 - Enable Row Level Security
-- ============================================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 6 - Documents policies (per-user ownership)
-- ============================================================================

CREATE POLICY "Enable read access for owner"
  ON public.documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for owner"
  ON public.documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update access for owner"
  ON public.documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable delete access for owner"
  ON public.documents FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================================
-- SECTION 7 - Document_chunks policies (ownership via owning document)
-- ============================================================================

CREATE POLICY "Enable read access for owner"
  ON public.document_chunks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()));

CREATE POLICY "Enable insert access for owner"
  ON public.document_chunks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_id
      AND documents.user_id = auth.uid()));

CREATE POLICY "Enable update access for owner"
  ON public.document_chunks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_id
      AND documents.user_id = auth.uid()));

CREATE POLICY "Enable delete access for owner"
  ON public.document_chunks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()));


-- ============================================================================
-- SECTION 8 - Restrict match_document_chunks to auth.uid()'s documents
-- ----------------------------------------------------------------------------
-- Preserves signature vector(768), float, int and return shape
-- (id, document_id, content, similarity). Scoped to the caller's documents.
-- ============================================================================

DROP FUNCTION IF EXISTS public.match_document_chunks(vector(768), double precision, integer);

CREATE OR REPLACE FUNCTION public.match_document_chunks(
  query_embedding vector(768),
  match_threshold double precision,
  match_count integer
)
RETURNS TABLE (id uuid, document_id uuid, content text, similarity double precision)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT c.id::uuid, c.document_id::uuid, c.content::text,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks c
  JOIN public.documents d ON d.id = c.document_id
  WHERE d.user_id = auth.uid()
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

REVOKE EXECUTE ON FUNCTION public.match_document_chunks(vector(768), double precision, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_document_chunks(vector(768), double precision, integer)
  TO authenticated;


-- ============================================================================
-- SECTION 9 - Lock down grants (anonymous cannot touch private data)
-- ============================================================================

REVOKE ALL ON public.documents FROM anon, public;
REVOKE ALL ON public.document_chunks FROM anon, public;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_chunks TO authenticated;


-- ============================================================================
-- SECTION 10 - Post-migration verification queries (run separately if desired)
-- ============================================================================
-- select relname, relrowsecurity
-- from pg_class where relname in ('documents','document_chunks');
--
-- select name, user_id, created_at from public.documents;   -- every row should show the real UUID
-- select count(*) from public.documents where user_id is null;   -- should be 0
--
-- set role anon; select count(*) from public.documents; reset role;   -- should error / return nothing
-- ============================================================================
