-- ==================== STORAGE BUCKETS ====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

-- Allow public read access to chat files
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;
CREATE POLICY "Anyone can view chat files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-files');
