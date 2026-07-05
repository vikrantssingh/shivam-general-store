-- Fix infinite recursion by using a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies for users table
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

-- Recreate policies for categories table
DROP POLICY IF EXISTS "Only admins can insert/update/delete categories" ON public.categories;
CREATE POLICY "Only admins can insert/update/delete categories" ON public.categories 
  FOR ALL USING (public.is_admin());

-- Recreate policies for products table
DROP POLICY IF EXISTS "Only admins can modify products." ON public.products;
CREATE POLICY "Only admins can modify products." ON public.products 
  FOR ALL USING (public.is_admin());

-- Recreate policies for orders table
DROP POLICY IF EXISTS "Admins can view and update all orders" ON public.orders;
CREATE POLICY "Admins can view and update all orders" ON public.orders 
  FOR ALL USING (public.is_admin());

-- Recreate policies for order_items table
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items 
  FOR ALL USING (public.is_admin());

-- Recreate policies for settings table
DROP POLICY IF EXISTS "Only admins can modify settings" ON public.settings;
CREATE POLICY "Only admins can modify settings" ON public.settings 
  FOR ALL USING (public.is_admin());
