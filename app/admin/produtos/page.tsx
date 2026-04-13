import { createClient as createAdminClient } from "@supabase/supabase-js"
import { ProdutosTable } from "@/components/admin/produtos-table"
import { ProdutoForm } from "@/components/admin/produto-form"

interface ProdutosPageProps {
  searchParams: Promise<{ novo?: string }>
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const { novo } = await searchParams
  const openModal = novo === "true"
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: produtos } = await supabase
    .from("produtos")
    .select(`
      id, nome, descricao, categoria_id, preco, preco_custo, imagem_url, imagens, ativo, destaque, created_at,
      categorias (nome),
      variantes (id, tamanho, cor, estoque, preco_custo, preco_venda)
    `)
    .order("created_at", { ascending: false })

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nome")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">PRODUTOS</h1>
        <ProdutoForm categorias={categorias || []} initialOpen={openModal} />
      </div>

      <ProdutosTable produtos={produtos || []} categorias={categorias || []} />
    </div>
  )
}
