-- Fix variantes columns to match the code expectations
-- Rename columns for better semantics (clothing store)

-- Add new columns if they don't exist
ALTER TABLE variantes ADD COLUMN IF NOT EXISTS tamanho VARCHAR(20);
ALTER TABLE variantes ADD COLUMN IF NOT EXISTS cor VARCHAR(50);
ALTER TABLE variantes ADD COLUMN IF NOT EXISTS preco_venda DECIMAL(10, 2);
ALTER TABLE variantes ADD COLUMN IF NOT EXISTS preco_custo DECIMAL(10, 2);

-- Copy data from old columns to new if they exist
UPDATE variantes SET tamanho = nome WHERE tamanho IS NULL AND nome IS NOT NULL;
UPDATE variantes SET cor = tipo WHERE cor IS NULL AND tipo IS NOT NULL;
UPDATE variantes SET preco_venda = preco_adicional WHERE preco_venda IS NULL AND preco_adicional IS NOT NULL;

-- Set default preco_venda from produto if still null
UPDATE variantes v 
SET preco_venda = (SELECT preco FROM produtos p WHERE p.id = v.produto_id)
WHERE v.preco_venda IS NULL;

-- Drop old columns
ALTER TABLE variantes DROP COLUMN IF EXISTS nome;
ALTER TABLE variantes DROP COLUMN IF EXISTS tipo;
ALTER TABLE variantes DROP COLUMN IF EXISTS preco_adicional;
