INSERT INTO public.categories (name, status) VALUES
('Grocery', true),
('Beverages', true),
('Personal Care', true),
('Household', true),
('Snacks', true),
('Dairy', true)
ON CONFLICT DO NOTHING;
