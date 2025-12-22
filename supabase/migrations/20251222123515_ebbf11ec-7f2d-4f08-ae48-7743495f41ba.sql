-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
);

-- Create RLS policies for media bucket
CREATE POLICY "Anyone can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND is_admin(auth.uid()));