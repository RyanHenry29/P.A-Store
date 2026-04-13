import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShoppingBag, Package, Truck, MapPin, CreditCard, Clock } from "lucide-react"
import Link from "next/link"
import { CancelarPedidoButton } from "@/components/catalogo/cancelar-pedido-button"

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  aguardando: { bg: "bg-[#ff9500]/20", text: "text-[#ff9500]", icon: "clock" },
  confirmado: { bg: "bg-[#00d4ff]/20", text: "text-[#00d4ff]", icon: "check" },
  preparando: { bg: "bg-[#a855f7]/20", text: "text-[#a855f7]", icon: "package" },
  pronto: { bg: "bg-[#00ff88]/20", text: "text-[#00ff88]", icon: "check" },
  saiu_entrega: { bg: "bg-[#00d4ff]/20", text: "text-[#00d4ff]", icon: "truck" },
  entregue: { bg: "bg-[#00ff88]/20", text: "text-[#00ff88]", icon: "check" },
  finalizado: { bg: "bg-[#00ff88]/20", text: "text-[#00ff88]", icon: "check" },
  cancelado: { bg: "bg-destructive/20", text: "text-destructive", icon: "x" },
}

const statusLabels: Record<string, string> = {
  aguardando: "Aguardando confirmação",
  confirmado: "Confirmado",
  preparando: "Preparando",
  pronto: "Pronto para retirada",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
}

const formaPagamentoLabels: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
}

export default async function MeusPedidosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/catalogo/meus-pedidos")
  }

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      pedido_itens (
        id,
        produto_nome,
        quantidade,
        preco_unitario,
        total
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pedidos:", error)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
        <Link
          href="/catalogo"
          className="text-[#00d4ff] hover:underline text-sm"
        >
          Continuar comprando
        </Link>
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhum pedido ainda
          </h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não fez nenhum pedido. Que tal dar uma olhada nos nossos produtos?
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const colors = statusColors[pedido.status] || statusColors.aguardando

            return (
              <div
                key={pedido.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                      <p className="text-[#00d4ff] font-bold">
                        Pedido #{pedido.codigo}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(pedido.created_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {statusLabels[pedido.status] || pedido.status}
                  </span>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3">
                  {pedido.pedido_itens && pedido.pedido_itens.length > 0 ? (
                    pedido.pedido_itens.map((item: {
                      id: string
                      produto_nome: string | null
                      quantidade: number
                      preco_unitario: number
                      total: number
                    }) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-foreground">
                          {item.quantidade}x {item.produto_nome || "Produto"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.total || item.preco_unitario * item.quantidade)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Itens do pedido</p>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 border-t border-border bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      {pedido.tipo_entrega === "entrega" ? (
                        <>
                          <Truck className="w-4 h-4" />
                          Entrega
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          Retirada na loja
                        </>
                      )}
                    </span>
                    {pedido.forma_pagamento && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {formaPagamentoLabels[pedido.forma_pagamento] || pedido.forma_pagamento}
                      </span>
                    )}
                  </div>
                  
                  {pedido.endereco_entrega && (
                    <p className="text-xs text-muted-foreground truncate">
                      {pedido.endereco_entrega}
                    </p>
                  )}
                </div>

                {/* Footer - Total e Ações */}
                <div className="flex justify-between items-center p-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <CancelarPedidoButton 
                      pedidoId={pedido.id} 
                      pedidoCodigo={pedido.codigo}
                      status={pedido.status}
                    />
                  </div>
                  <span className="text-xl font-bold text-[#00d4ff]">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
