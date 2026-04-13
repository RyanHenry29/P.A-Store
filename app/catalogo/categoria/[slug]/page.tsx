import { createClient as createAdminClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { ProdutoCard } from "@/components/catalogo/produto-card"

interface CategoriaPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: categoria } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!categoria) {
    notFound()
  }

  const { data: produtos } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (nome, slug),
      variantes (id, tamanho, cor, estoque, preco_venda)
    `)
    .eq("categoria_id", categoria.id)
    .eq("ativo", true)
    .order("created_at", { ascending: false })

  const produtosComEstoque = produtos?.filter(p => 
    p.variantes.some((v: { estoque: number }) => v.estoque > 0)
  ) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">{categoria.nome}</h1>
      {categoria.descricao && (
        <p className="text-muted-foreground mb-8">{categoria.descricao}</p>
      )}

      {produtosComEstoque.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum produto disponível nesta categoria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {produtosComEstoque.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </div>
  )
}
