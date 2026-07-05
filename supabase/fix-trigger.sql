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
      COALESCE((new.raw_user_meta_data->>'role')::user_role, 'retail'::user_role)
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignore the error so the user is still created in Supabase Auth
    RAISE LOG 'Trigger Error: %', SQLERRM;
  END;
  RETURN new;
END;
$$;
