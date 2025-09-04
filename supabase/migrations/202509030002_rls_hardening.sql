-- RLS Hardening: certificates table
-- Remove broad public read; require either ownership OR hash/ID equality with limited columns.

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Certificates public read') THEN
    EXECUTE 'drop policy "Certificates public read" on public.certificates';
  END IF;
END$$;

-- Recreate selective read policy: allow selecting certificate rows ONLY by hash or id filter
create policy "Certificates selective read" on public.certificates for select
  using (
    -- Allow if caller owns the certificate OR explicitly filtering by id/hash
    (auth.uid() = user_id) OR 
    (id = current_setting('request.jwt.claim.certificate_id', true)) OR 
    (hash = current_setting('request.jwt.claim.certificate_hash', true))
  );

-- (Optional) Insert policy remains (owner insert). If absent, recreate:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Certificates insert owner') THEN
    EXECUTE 'create policy "Certificates insert owner" on public.certificates for insert with check (auth.uid() = user_id)';
  END IF;
END$$;

-- NOTE: Edge Function uses service role key -> bypasses RLS; client now must use hash/id constrained filters.
