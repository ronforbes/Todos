-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true);

-- Storage policies for item-photos bucket
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'item-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view photos for their couple's items"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'item-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete photos for their couple's items"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'item-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );
