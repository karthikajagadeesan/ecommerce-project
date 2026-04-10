-- 1. Create the 'layouts' bucket in Ecommerce project
-- Note: You might need to create the bucket manually in the UI first if this SQL isn't supported in your version
-- Ensure 'Public' is checked when creating in the UI.

-- 2. Enable public uploads for the API (Service Role will use this)
CREATE POLICY "Enable server-side uploads for layouts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'layouts');

-- 3. Enable public viewing for embed rendering
CREATE POLICY "Enable public viewing for layouts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'layouts');
