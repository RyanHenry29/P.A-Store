-- Este script cria o usuário admin diretamente no banco
-- Credenciais: admin@pastore.com / admin123

-- Primeiro, vamos verificar se já existe um profile admin
DO $$
BEGIN
  -- Se já existe um admin, não faz nada
  IF EXISTS (SELECT 1 FROM profiles WHERE is_admin = true) THEN
    RAISE NOTICE 'Admin já existe';
  ELSE
    -- Criar profile admin (o usuário precisa ser criado via API)
    RAISE NOTICE 'Execute a API /api/admin/setup para criar o admin';
  END IF;
END $$;

-- Atualizar qualquer usuário com email admin@pastore.com para ser admin
UPDATE profiles 
SET is_admin = true, nome = 'Administrador P.A Store'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@pastore.com'
);
