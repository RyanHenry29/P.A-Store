import { createClient as createAdminClient } from "@supabase/supabase-js"
import { EstoqueTable } from "@/components/admin/estoque-table"

export default async function EstoquePage() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: variantes } = await supabase
    .from("variantes")
    .select(`
      *,
      produtos (nome, imagem_url, ativo)
    `)
    .order("estoque", { ascending: true })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">ESTOQUE</h1>
      <EstoqueTable variantes={variantes || []} />
    </div>
  )
}
