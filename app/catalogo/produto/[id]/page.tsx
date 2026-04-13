import { createClient as createAdminClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { ProdutoDetail } from "@/components/catalogo/produto-detail"

interface ProdutoPageProps {
  params: Promise<{ id: string }>
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { id } = await params
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: produto } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (nome, slug),
      variantes (id, tamanho, cor, estoque, preco_venda, preco_custo)
    `)
    .eq("id", id)
    .eq("ativo", true)
    .single()

  if (!produto) {
    notFound()
  }

  return <ProdutoDetail produto={produto} />
}
