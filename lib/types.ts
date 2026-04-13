export interface Profile {
  id: string
  nome: string | null
  telefone: string | null
  endereco: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nome: string
  slug: string
  imagem_url: string | null
  ordem: number
  ativo: boolean
  created_at: string
}

export interface Produto {
  id: string
  categoria_id: string | null
  nome: string
  descricao: string | null
  preco: number
  preco_custo: number
  imagem_url: string | null
  imagens: string[]
  ativo: boolean
  destaque: boolean
  created_at: string
  updated_at: string
  categoria?: Categoria
  variantes?: Variante[]
}

export interface Variante {
  id: string
  produto_id: string
  tamanho: string | null
  cor: string | null
  estoque: number
  preco_custo: number
  preco_venda: number
  created_at: string
}

export type StatusPedido = 'aguardando' | 'embalando' | 'pronto' | 'enviado' | 'entregue' | 'cancelado'
export type TipoEntrega = 'entrega' | 'retirada'

export interface Pedido {
  id: string
  codigo: string
  user_id: string | null
  cliente_nome: string
  cliente_telefone: string | null
  cliente_email: string | null
  endereco_entrega: string | null
  tipo_entrega: TipoEntrega
  subtotal: number
  taxa_entrega: number
  total: number
  lucro: number
  status: StatusPedido
  observacoes: string | null
  created_at: string
  updated_at: string
  itens?: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  produto_id: string | null
  variante_id: string | null
  produto_nome: string
  variante_nome: string | null
  quantidade: number
  preco_unitario: number
  preco_custo: number
  total: number
  created_at: string
}

export interface CartItem {
  produto: Produto
  variante: Variante | null
  quantidade: number
}

export interface DashboardStats {
  vendasHoje: number
  lucroHoje: number
  pedidosHoje: number
  produtosAtivos: number
  pedidosAguardando: number
  produtosEstoqueBaixo: number
  variacaoVendas: number
}

export interface VendasDia {
  dia: string
  vendas: number
  lucro: number
}
