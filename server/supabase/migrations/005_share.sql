-- Persistent shareable links — one per student, revocable by deleting the row
CREATE TABLE IF NOT EXISTS share_links (
  token      text        PRIMARY KEY,
  user_id    uuid        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share_links_owner" ON share_links USING (auth.uid() = user_id);

-- AI-generated summaries, cached weekly — one per student (covers all universities)
CREATE TABLE IF NOT EXISTS share_summaries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary      text        NOT NULL,
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE share_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share_summaries_service" ON share_summaries USING (true);
