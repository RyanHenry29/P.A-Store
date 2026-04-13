-- Seed categorias iniciais para P.A Store
INSERT INTO categorias (nome, slug, ordem) VALUES
('Camisetas', 'camisetas', 1),
('Calças', 'calcas', 2),
('Bermudas', 'bermudas', 3),
('Bonés', 'bones', 4),
('Tênis', 'tenis', 5),
('Acessórios', 'acessorios', 6)
ON CONFLICT (slug) DO NOTHING;
