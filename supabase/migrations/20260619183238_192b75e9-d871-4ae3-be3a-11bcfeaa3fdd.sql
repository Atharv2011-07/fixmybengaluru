
CREATE POLICY "Pothole images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pothole-images');

CREATE POLICY "Anyone can upload pothole images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pothole-images');

CREATE POLICY "Users can update own pothole images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pothole-images' AND owner = auth.uid());

CREATE POLICY "Users can delete own pothole images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pothole-images' AND owner = auth.uid());
