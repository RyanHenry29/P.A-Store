import { createClient as createAdminClient } from "@supabase/supabase-js"
import { DashboardMetrics } from "@/components/admin/dashboard-metrics"
import { SalesChart } from "@/components/admin/sales-chart"
import { RecentOrders } from "@/components/admin/recent-orders"
import { StockAlerts } from "@/components/admin/stock-alerts"
import { QuickActions } from "@/components/admin/quick-actions"
import { MonthlyMetrics } from "@/components/admin/monthly-metrics"

// Função para obter data/hora no fuso horário de Brasília
function getBrasiliaDate() {
  const now = new Date()
  // Brasília é UTC-3
  const brasiliaOffset = -3 * 60 // em minutos
  const localOffset = now.getTimezoneOffset() // em minutos
  const diff = brasiliaOffset - (-localOffset)
  return new Date(now.getTime() + diff * 60 * 1000)
}

// Função para obter início do dia em Brasília
function getStartOfDayBrasilia() {
  const brasilia = getBrasiliaDate()
  brasilia.setHours(0, 0, 0, 0)
  // Converter de volta para UTC para query no banco
  const brasiliaOffset = -3 * 60
  return new Date(brasilia.getTime() - brasiliaOffset * 60 * 1000)
}

// Função para obter início do mês em Brasília
function getStartOfMonthBrasilia() {
  const brasilia = getBrasiliaDate()
  brasilia.setDate(1)
  brasilia.setHours(0, 0, 0, 0)
  const brasiliaOffset = -3 * 60
  return new Date(brasilia.getTime() - brasiliaOffset * 60 * 1000)
}

export default async function AdminDashboardPage() {
  // Use service role to bypass RLS for admin queries
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Datas corretas no fuso de Brasília
  const todayStart = getStartOfDayBrasilia()
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  
  const monthStart = getStartOfMonthBrasilia()

  // Fetch today's orders (usando datas corretas de Brasília)
  const { data: todayOrders } = await supabase
    .from("pedidos")
    .select("*")
    .gte("created_at", todayStart.toISOString())
    .lt("created_at", tomorrowStart.toISOString())

  // Fetch yesterday's orders for comparison
  const { data: yesterdayOrders } = await supabase
    .from("pedidos")
    .select("*")
    .gte("created_at", yesterdayStart.toISOString())
    .lt("created_at", todayStart.toISOString())

  // Fetch this month's orders
  const { data: monthOrders } = await supabase
    .from("pedidos")
    .select("*")
    .gte("created_at", monthStart.toISOString())

  // Fetch last month's orders for comparison
  const lastMonthStart = new Date(monthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
  const { data: lastMonthOrders } = await supabase
    .from("pedidos")
    .select("*")
    .gte("created_at", lastMonthStart.toISOString())
    .lt("created_at", monthStart.toISOString())

  // Fetch active products
  const { count: activeProducts } = await supabase
    .from("produtos")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true)

  // Fetch low stock products (less than 5 units)
  const { count: lowStockProducts } = await supabase
    .from("variantes")
    .select("*", { count: "exact", head: true })
    .lt("estoque", 5)

  // Fetch critical stock items with product details
  const { data: criticalStock } = await supabase
    .from("variantes")
    .select(`
      id, tamanho, cor, estoque,
      produtos (id, nome, imagem_url)
    `)
    .lt("estoque", 3)
    .order("estoque", { ascending: true })
    .limit(5)

  // Fetch pending orders count for quick actions
  const { count: pendingOrders } = await supabase
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("status", "aguardando")

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch last 7 days of sales data - only finalized orders
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data: weeklyOrders } = await supabase
    .from("pedidos")
    .select("total, lucro, created_at, status")
    .gte("created_at", sevenDaysAgo.toISOString())
    .in("status", ["finalizado", "entregue"])
    .order("created_at", { ascending: true })

  // Status finalizados = vendas confirmadas
  const statusFinalizados = ["finalizado", "entregue"]
  const statusCancelados = ["cancelado"]
  
  // === MÉTRICAS DO DIA (HOJE) ===
  const pedidosFinalizadosHoje = todayOrders?.filter(o => statusFinalizados.includes(o.status)) || []
  const pedidosPendentesHoje = todayOrders?.filter(o => 
    !statusFinalizados.includes(o.status) && !statusCancelados.includes(o.status)
  ) || []
  
  const vendasConfirmadasHoje = pedidosFinalizadosHoje.reduce((sum, o) => sum + (o.total || 0), 0)
  const lucroConfirmadoHoje = pedidosFinalizadosHoje.reduce((sum, o) => sum + (o.lucro || 0), 0)
  const possiveisVendasHoje = pedidosPendentesHoje.reduce((sum, o) => sum + (o.total || 0), 0)
  const possivelLucroHoje = pedidosPendentesHoje.reduce((sum, o) => sum + (o.lucro || 0), 0)
  const pedidosHoje = todayOrders?.length || 0
  const aguardandoHoje = pedidosPendentesHoje.length

  // Comparação com ontem
  const finalizadosOntem = yesterdayOrders?.filter(o => statusFinalizados.includes(o.status)) || []
  const vendasOntemConfirmadas = finalizadosOntem.reduce((sum, o) => sum + (o.total || 0), 0)
  const variacaoVendas = vendasOntemConfirmadas > 0 
    ? Math.round(((vendasConfirmadasHoje - vendasOntemConfirmadas) / vendasOntemConfirmadas) * 100) 
    : vendasConfirmadasHoje > 0 ? 100 : 0

  // === MÉTRICAS DO MÊS ===
  const pedidosFinalizadosMes = monthOrders?.filter(o => statusFinalizados.includes(o.status)) || []
  const pedidosPendentesMes = monthOrders?.filter(o => 
    !statusFinalizados.includes(o.status) && !statusCancelados.includes(o.status)
  ) || []
  const pedidosCanceladosMes = monthOrders?.filter(o => statusCancelados.includes(o.status)) || []
  
  const vendasConfirmadasMes = pedidosFinalizadosMes.reduce((sum, o) => sum + (o.total || 0), 0)
  const lucroConfirmadoMes = pedidosFinalizadosMes.reduce((sum, o) => sum + (o.lucro || 0), 0)
  const possiveisVendasMes = pedidosPendentesMes.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPedidosMes = monthOrders?.length || 0
  const canceladosMes = pedidosCanceladosMes.length

  // Comparação com mês anterior
  const finalizadosMesAnterior = lastMonthOrders?.filter(o => statusFinalizados.includes(o.status)) || []
  const vendasMesAnterior = finalizadosMesAnterior.reduce((sum, o) => sum + (o.total || 0), 0)
  const variacaoMes = vendasMesAnterior > 0 
    ? Math.round(((vendasConfirmadasMes - vendasMesAnterior) / vendasMesAnterior) * 100) 
    : vendasConfirmadasMes > 0 ? 100 : 0

  // Process chart data
  const chartData = processChartData(weeklyOrders || [])

  // Data de hoje formatada
  const brasiliaAgora = getBrasiliaDate()
  const dataHoje = brasiliaAgora.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
  const mesAtual = brasiliaAgora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">DASHBOARD</h1>
        <p className="text-sm text-muted-foreground capitalize">{dataHoje}</p>
      </div>

      {/* Quick Actions */}
      <QuickActions 
        pendingOrders={pendingOrders || 0} 
        criticalStock={criticalStock?.length || 0} 
      />

      {/* Métricas do Dia */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Vendas de Hoje
        </h2>
        <DashboardMetrics
          vendasConfirmadas={vendasConfirmadasHoje}
          lucroConfirmado={lucroConfirmadoHoje}
          possiveisVendas={possiveisVendasHoje}
          possivelLucro={possivelLucroHoje}
          pedidosHoje={pedidosHoje}
          aguardando={aguardandoHoje}
          produtosAtivos={activeProducts || 0}
          estoqueBaixo={lowStockProducts || 0}
          variacaoVendas={variacaoVendas}
        />
      </div>

      {/* Métricas do Mês */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Vendas do Mês - {mesAtual}
        </h2>
        <MonthlyMetrics
          vendasConfirmadas={vendasConfirmadasMes}
          lucroConfirmado={lucroConfirmadoMes}
          possiveisVendas={possiveisVendasMes}
          totalPedidos={totalPedidosMes}
          pedidosFinalizados={pedidosFinalizadosMes.length}
          pedidosCancelados={canceladosMes}
          variacaoMes={variacaoMes}
        />
      </div>

      {/* Stock Alerts - Only show if there are critical items */}
      {criticalStock && criticalStock.length > 0 && (
        <StockAlerts items={criticalStock} />
      )}

      {/* Sales Chart */}
      <SalesChart data={chartData} />

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders || []} />
    </div>
  )
}

function processChartData(orders: { total: number; lucro: number; created_at: string }[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const dataByDay: Record<string, { vendas: number; lucro: number }> = {}
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = getBrasiliaDate()
    date.setDate(date.getDate() - i)
    const dayName = days[date.getDay()]
    dataByDay[dayName] = { vendas: 0, lucro: 0 }
  }

  // Aggregate orders by day
  orders.forEach(order => {
    const date = new Date(order.created_at)
    const dayName = days[date.getDay()]
    if (dataByDay[dayName]) {
      dataByDay[dayName].vendas += order.total || 0
      dataByDay[dayName].lucro += order.lucro || 0
    }
  })

  return Object.entries(dataByDay).map(([day, data]) => ({
    day,
    vendas: data.vendas,
    lucro: data.lucro,
  }))
}

// Reutilizando a função no escopo de módulo
function getBrasiliaDateModule() {
  const now = new Date()
  const brasiliaOffset = -3 * 60
  const localOffset = now.getTimezoneOffset()
  const diff = brasiliaOffset - (-localOffset)
  return new Date(now.getTime() + diff * 60 * 1000)
}
