INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Policy to allow admins to upload images
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND public.is_admin());

-- Policy to allow admins to update images
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products' AND public.is_admin());

-- Policy to allow admins to delete images
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products' AND public.is_admin());
