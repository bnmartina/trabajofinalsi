-- Recrear función con search_path seguro usando CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$;