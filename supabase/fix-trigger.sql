CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'), 
      CASE 
        WHEN new.raw_user_meta_data->>'role' = 'shopkeeper_pending' THEN 'shopkeeper_pending'::user_role
        ELSE 'retail'::user_role
      END
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignore the error so the user is still created in Supabase Auth
    RAISE LOG 'Trigger Error: %', SQLERRM;
  END;
  RETURN new;
END;
$$;
