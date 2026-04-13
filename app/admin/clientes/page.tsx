import { createClient as createAdminClient } from "@supabase/supabase-js"
import { ClientesTable } from "@/components/admin/clientes-table"

export default async function ClientesPage() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Fetch all clients with their order history
  const { data: clientes, error } = await supabase
    .from("profiles")
    .select(`
      *,
      pedidos:pedidos (
        id,
        total,
        status,
        created_at,
        cliente_telefone
      )
    `)
    .eq("is_admin", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching clientes:", error)
  }

  // Also fetch unique clients from pedidos table (clients who ordered but may not have profile)
  const { data: pedidosClientes } = await supabase
    .from("pedidos")
    .select("cliente_nome, cliente_telefone, cliente_email, total, created_at")
    .not("cliente_telefone", "is", null)
    .order("created_at", { ascending: false })

  // Calculate stats for each profile client
  const profileClientes = clientes?.map(cliente => {
    const pedidos = cliente.pedidos || []
    // Get phone from profile or from latest order
    const telefone = cliente.telefone || (pedidos.length > 0 ? pedidos[0].cliente_telefone : null)
    const totalGasto = pedidos.reduce((sum: number, p: { total: number }) => sum + (p.total || 0), 0)
    const totalPedidos = pedidos.length
    const ultimoPedido = pedidos.length > 0 
      ? pedidos.reduce((latest: { created_at: string }, p: { created_at: string }) => 
          new Date(p.created_at) > new Date(latest.created_at) ? p : latest
        )
      : null

    return {
      ...cliente,
      telefone,
      totalGasto,
      totalPedidos,
      ultimoPedido: ultimoPedido?.created_at || null
    }
  }) || []

  // Create unique set of customers from pedidos (grouped by phone)
  const pedidoClientesMap = new Map<string, {
    id: string
    nome: string | null
    email: string | null
    telefone: string
    totalGasto: number
    totalPedidos: number
    ultimoPedido: string | null
    is_admin: boolean
  }>()

  pedidosClientes?.forEach(pedido => {
    if (!pedido.cliente_telefone) return
    const phone = pedido.cliente_telefone
    const existing = pedidoClientesMap.get(phone)
    
    if (existing) {
      existing.totalGasto += pedido.total || 0
      existing.totalPedidos += 1
      if (pedido.created_at && (!existing.ultimoPedido || new Date(pedido.created_at) > new Date(existing.ultimoPedido))) {
        existing.ultimoPedido = pedido.created_at
      }
    } else {
      pedidoClientesMap.set(phone, {
        id: phone, // use phone as ID for non-profile clients
        nome: pedido.cliente_nome,
        email: pedido.cliente_email,
        telefone: phone,
        totalGasto: pedido.total || 0,
        totalPedidos: 1,
        ultimoPedido: pedido.created_at,
        is_admin: false
      })
    }
  })

  // Merge: profile clients first, then add pedido clients that aren't already in profiles
  const profilePhones = new Set(profileClientes.map(c => c.telefone).filter(Boolean))
  const additionalClientes = Array.from(pedidoClientesMap.values())
    .filter(c => !profilePhones.has(c.telefone))

  const clientesWithStats = [...profileClientes, ...additionalClientes]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">CLIENTES</h1>
        <p className="text-muted-foreground mt-1">
          Base de leads e histórico de compras
        </p>
      </div>

      <ClientesTable clientes={clientesWithStats} />
    </div>
  )
}
