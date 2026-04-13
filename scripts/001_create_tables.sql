-- P.A Store Database Schema
-- Create tables for profiles, categories, products, variants, orders, and order items

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  endereco TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  imagem_url TEXT,
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2) DEFAULT 0,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table (sizes, colors)
CREATE TABLE IF NOT EXISTS public.variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, -- e.g. "P", "M", "G", "Azul", "Preto"
  tipo TEXT NOT NULL, -- "tamanho" or "cor"
  estoque INT DEFAULT 0,
  preco_adicional DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE, -- e.g. #PA001
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  endereco_entrega TEXT,
  tipo_entrega TEXT DEFAULT 'entrega', -- 'entrega' or 'retirada'
  subtotal DECIMAL(10,2) NOT NULL,
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  lucro DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'aguardando', -- 'aguardando', 'embalando', 'pronto', 'enviado', 'entregue', 'cancelado'
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  variante_id UUID REFERENCES public.variantes(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  variante_nome TEXT,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public read for categories and products (catalog)
CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "produtos_select_all" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "variantes_select_all" ON public.variantes FOR SELECT USING (true);

-- Pedidos policies - users can see their own orders
CREATE POLICY "pedidos_select_own" ON public.pedidos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pedidos_insert_own" ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pedido itens policies
CREATE POLICY "pedido_itens_select_own" ON public.pedido_itens FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.pedidos WHERE pedidos.id = pedido_itens.pedido_id AND pedidos.user_id = auth.uid()));

-- Admin policies (for users with is_admin = true in profiles)
CREATE POLICY "admin_categorias_all" ON public.categorias FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin_produtos_all" ON public.produtos FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin_variantes_all" ON public.variantes FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin_pedidos_all" ON public.pedidos FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin_pedido_itens_all" ON public.pedido_itens FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin_profiles_select" ON public.profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true) OR auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, telefone, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'telefone', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order code
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 4) AS INT)), 0) + 1 INTO next_num FROM public.pedidos;
  NEW.codigo := '#PA' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_code ON public.pedidos;

CREATE TRIGGER set_order_code
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW
  WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
  EXECUTE FUNCTION public.generate_order_code();
