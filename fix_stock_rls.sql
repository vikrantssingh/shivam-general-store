-- Copy paste this into your Supabase SQL Editor and click RUN

DROP POLICY IF EXISTS "Allow customers to update stock" ON public.products;

CREATE POLICY "Allow customers to update stock"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
