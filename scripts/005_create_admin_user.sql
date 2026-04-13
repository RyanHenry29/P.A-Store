-- Criar usuário admin diretamente com email confirmado
-- Senha: admin123 (hash bcrypt)

-- Primeiro, deletar admin existente se houver
DELETE FROM auth.users WHERE email = 'admin@pastore.com';

-- Inserir novo admin com email confirmado
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@pastore.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar profile de admin
INSERT INTO public.profiles (id, nome, telefone, is_admin, email)
SELECT id, 'Administrador', '', true, 'admin@pastore.com'
FROM auth.users WHERE email = 'admin@pastore.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, nome = 'Administrador', email = 'admin@pastore.com';
