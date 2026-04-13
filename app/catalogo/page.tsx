import { createClient as createAdminClient } from "@supabase/supabase-js"
import { ProdutoCard } from "@/components/catalogo/produto-card"
import Image from "next/image"

export default async function CatalogoPage() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: produtos } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (nome, slug),
      variantes (id, tamanho, cor, estoque, preco_venda)
    `)
    .eq("ativo", true)
    .order("created_at", { ascending: false })

  const produtosComEstoque = produtos?.filter(p => 
    p.variantes && p.variantes.some((v: { estoque: number }) => v.estoque > 0)
  ) || produtos || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#00d4ff]/20 to-[#00ff88]/10">
        <div className="flex items-center justify-between p-8 md:p-12">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              P.A Store
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              OO da Quebrada - Guarulhos
            </p>
            <p className="text-muted-foreground">
              As melhores roupas e acessórios com estilo e qualidade
            </p>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yqH3dprW1LMnU8DwBPDSBDREOuSHgw.png"
              alt="P.A Store"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">
          Todos os Produtos
        </h2>

        {produtosComEstoque.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum produto disponível no momento
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
    </div>
  )
}
