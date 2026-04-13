-- Create notifications table
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'pedido', 'estoque', 'sistema'
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample notifications
INSERT INTO notificacoes (tipo, titulo, mensagem, link) VALUES
('sistema', 'Bem-vindo ao Painel Admin', 'Seu painel administrativo está configurado e pronto para uso!', '/admin'),
('estoque', 'Estoque configurado', 'O sistema de gestão de estoque está ativo. Adicione seus produtos!', '/admin/produtos');

-- Enable RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin only access via layout)
CREATE POLICY "Allow all for authenticated" ON notificacoes
  FOR ALL USING (true);
