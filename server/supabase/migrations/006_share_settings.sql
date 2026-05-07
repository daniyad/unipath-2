-- Add view_count and settings to share_links
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{"expiresIn":"never","showTuition":true}'::jsonb;

-- Atomic increment function (SECURITY DEFINER so it bypasses RLS for the public token lookup)
CREATE OR REPLACE FUNCTION increment_share_view_count(p_token text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE share_links SET view_count = COALESCE(view_count, 0) + 1 WHERE token = p_token;
$$;
