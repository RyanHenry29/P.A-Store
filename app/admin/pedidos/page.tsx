import { createClient as createAdminClient } from "@supabase/supabase-js"
import { PedidosTable } from "@/components/admin/pedidos-table"

export default async function PedidosPage() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      pedido_itens (
        id,
        produto_nome,
        quantidade,
        preco_unitario,
        variante_id
      )
    `)
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("[v0] Error fetching pedidos:", error)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">PEDIDOS</h1>
      <PedidosTable pedidos={pedidos || []} />
    </div>
  )
}
