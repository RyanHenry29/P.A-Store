-- Fix RLS policies for P.A Store

-- Drop existing problematic policies
DROP POLICY IF EXISTS "categorias_select_all" ON public.categorias;
DROP POLICY IF EXISTS "produtos_select_all" ON public.produtos;
DROP POLICY IF EXISTS "variantes_select_all" ON public.variantes;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_select" ON public.profiles;

-- Recreate public read policies with USING (true) for catalog
CREATE POLICY "categorias_public_read" ON public.categorias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "produtos_public_read" ON public.produtos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "variantes_public_read" ON public.variantes FOR SELECT TO anon, authenticated USING (true);

-- Profiles: users can read their own profile
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admin_profiles_read_all" ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Add email column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;
