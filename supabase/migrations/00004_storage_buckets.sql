-- ============================================================
-- PRE-OWNED CAR INSPECTION PLATFORM
-- Migration 00004: Storage Buckets
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars', 'avatars', TRUE, 2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('vehicles', 'vehicles', TRUE, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('inspections', 'inspections', FALSE, 10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/webm', 'audio/mp4']),
  ('reports', 'reports', FALSE, 20971520,
    ARRAY['application/pdf']),
  ('invoices', 'invoices', FALSE, 5242880,
    ARRAY['application/pdf']),
  ('blog', 'blog', TRUE, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- STORAGE RLS POLICIES

-- Avatars
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar owner upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Avatar owner update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Avatar owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Vehicles
CREATE POLICY "Vehicle public read" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
CREATE POLICY "Vehicle owner upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicles' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Vehicle owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicles' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Inspections
CREATE POLICY "Inspection upload by inspector" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inspections' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Inspection read by authenticated" ON storage.objects FOR SELECT
  USING (bucket_id = 'inspections' AND auth.role() = 'authenticated');
CREATE POLICY "Inspection delete by inspector" ON storage.objects FOR DELETE
  USING (bucket_id = 'inspections' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Reports
CREATE POLICY "Report read by authenticated" ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND auth.role() = 'authenticated');
CREATE POLICY "Report upload by system" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports');

-- Invoices
CREATE POLICY "Invoice read by authenticated" ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');
CREATE POLICY "Invoice upload by system" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoices');

-- Blog
CREATE POLICY "Blog public read" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Blog admin upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog' AND public.get_user_role() = 'admin');
CREATE POLICY "Blog admin delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'blog' AND public.get_user_role() = 'admin');
