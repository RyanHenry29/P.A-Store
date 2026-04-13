"use client"

import { useState } from "react"
import { Search, Eye, ChevronDown, ShoppingBag, X, MessageCircle, Truck, Store, CheckCircle, Package, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PedidoItem {
  id: string
  produto_nome: string | null
  quantidade: number
  preco_unitario: number
  variante_id: string | null
}

interface Pedido {
  id: string
  codigo: string
  user_id: string | null
  cliente_nome: string | null
  cliente_telefone: string | null
  cliente_email: string | null
  status: string
  subtotal: number
  taxa_entrega: number
  total: number
  lucro: number
  tipo_entrega: string
  endereco_entrega: string | null
  forma_pagamento: string | null
  observacoes: string | null
  created_at: string
  pedido_itens: PedidoItem[]
  motivo_cancelamento?: string | null
  cancelado_por?: string | null
  data_cancelamento?: string | null
}

interface PedidosTableProps {
  pedidos: Pedido[]
}

const statusColors: Record<string, { bg: string; text: string }> = {
  aguardando: { bg: "bg-[#ff9500]/20", text: "text-[#ff9500]" },
  embalando: { bg: "bg-[#00d4ff]/20", text: "text-[#00d4ff]" },
  pronto: { bg: "bg-[#00ff88]/20", text: "text-[#00ff88]" },
  entregue: { bg: "bg-muted", text: "text-muted-foreground" },
  cancelado: { bg: "bg-destructive/20", text: "text-destructive" },
}

const statusLabels: Record<string, string> = {
  aguardando: "Aguardando",
  embalando: "Embalando",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export function PedidosTable({ pedidos }: PedidosTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tipoEntregaFilter, setTipoEntregaFilter] = useState<string>("all")
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

  const filteredPedidos = pedidos.filter((p) => {
    const matchesSearch =
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente_telefone?.includes(search)
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesTipoEntrega = tipoEntregaFilter === "all" || p.tipo_entrega === tipoEntregaFilter
    return matchesSearch && matchesStatus && matchesTipoEntrega
  })

  // Stats
  const totalEntrega = pedidos.filter(p => p.tipo_entrega === "entrega").length
  const totalRetirada = pedidos.filter(p => p.tipo_entrega === "retirada").length
  const pendentes = pedidos.filter(p => p.status === "aguardando").length

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
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
          <button
            onClick={() => setStatusFilter(statusFilter === "aguardando" ? "all" : "aguardando")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
              statusFilter === "aguardando" 
                ? "bg-[#ff9500]/20 border-2 border-[#ff9500]" 
                : "bg-card border border-border hover:bg-muted"
            }`}
          >
            <Clock className="w-5 h-5 text-[#ff9500]" />
            <div className="text-left">
              <p className="text-lg font-bold text-[#ff9500]">{pendentes}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </button>
          <button
            onClick={() => setTipoEntregaFilter(tipoEntregaFilter === "entrega" ? "all" : "entrega")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
              tipoEntregaFilter === "entrega" 
                ? "bg-[#00d4ff]/20 border-2 border-[#00d4ff]" 
                : "bg-card border border-border hover:bg-muted"
            }`}
          >
            <Truck className="w-5 h-5 text-[#00d4ff]" />
            <div className="text-left">
              <p className="text-lg font-bold text-[#00d4ff]">{totalEntrega}</p>
              <p className="text-xs text-muted-foreground">Entregas</p>
            </div>
          </button>
          <button
            onClick={() => setTipoEntregaFilter(tipoEntregaFilter === "retirada" ? "all" : "retirada")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
              tipoEntregaFilter === "retirada" 
                ? "bg-[#00ff88]/20 border-2 border-[#00ff88]" 
                : "bg-card border border-border hover:bg-muted"
            }`}
          >
            <Store className="w-5 h-5 text-[#00ff88]" />
            <div className="text-left">
              <p className="text-lg font-bold text-[#00ff88]">{totalRetirada}</p>
              <p className="text-xs text-muted-foreground">Retiradas</p>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código, cliente ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
          >
            <option value="all">Todos os status</option>
            <option value="aguardando">Aguardando</option>
            <option value="embalando">Embalando</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {filteredPedidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Lucro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Entrega
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPedidos.map((pedido) => (
                  <PedidoRow
                    key={pedido.id}
                    pedido={pedido}
                    onView={() => setSelectedPedido(pedido)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPedido && (
        <PedidoDetail
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </>
  )
}

function PedidoRow({
  pedido,
  onView,
}: {
  pedido: Pedido
  onView: () => void
}) {
  const [status, setStatus] = useState(pedido.status)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatWhatsAppLink = (phone: string | null) => {
    if (!phone) return null
    const cleanPhone = phone.replace(/\D/g, "")
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
    return `https://wa.me/${fullPhone}`
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    await supabase.from("pedidos").update({ status: newStatus }).eq("id", pedido.id)
    setStatus(newStatus)
    setUpdating(false)
    router.refresh()
  }

  // Quick actions - advance to next status
  const handleQuickAction = async () => {
    const nextStatus: Record<string, string> = {
      aguardando: "embalando",
      embalando: "pronto",
      pronto: "entregue",
    }
    const next = nextStatus[status]
    if (next) {
      await handleStatusChange(next)
    }
  }

  const quickActionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    aguardando: { label: "Confirmar", icon: <CheckCircle className="w-3 h-3" /> },
    embalando: { label: "Pronto", icon: <Package className="w-3 h-3" /> },
    pronto: { label: "Entregar", icon: <Truck className="w-3 h-3" /> },
  }

  const colors = statusColors[status] || statusColors.aguardando
  const whatsappLink = formatWhatsAppLink(pedido.cliente_telefone)

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4">
        <span className="text-[#00d4ff] font-medium">#{pedido.codigo}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-foreground font-medium">{pedido.cliente_nome || "Cliente"}</p>
            {pedido.cliente_telefone ? (
              <a
                href={`https://wa.me/55${pedido.cliente_telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#25D366] hover:underline text-sm"
              >
                <MessageCircle className="w-3 h-3" />
                {pedido.cliente_telefone}
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">Sem telefone</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-muted-foreground text-sm">
        {formatDate(pedido.created_at)}
      </td>
      <td className="px-6 py-4">
        <span className="text-foreground font-medium">{formatCurrency(pedido.total)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[#00ff88] font-medium">{formatCurrency(pedido.lucro)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {pedido.tipo_entrega === "entrega" ? (
              <>
                <Truck className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-[#00d4ff] font-medium text-sm">ENTREGA</span>
              </>
            ) : (
              <>
                <Store className="w-4 h-4 text-[#00ff88]" />
                <span className="text-[#00ff88] font-medium text-sm">RETIRADA</span>
              </>
            )}
          </div>
          {pedido.tipo_entrega === "entrega" && pedido.endereco_entrega && (
            <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={pedido.endereco_entrega}>
              {pedido.endereco_entrega}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Quick Action Button */}
          {quickActionLabels[status] && (
            <button
              onClick={handleQuickAction}
              disabled={updating}
              className="flex items-center gap-1.5 bg-[#00d4ff] hover:bg-[#00a3cc] text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {quickActionLabels[status].icon}
              {quickActionLabels[status].label}
            </button>
          )}
          
          {/* WhatsApp */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg transition-colors"
              title="Abrir WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          
          {/* View Details */}
          <button
            onClick={onView}
            className="p-2 text-muted-foreground hover:text-[#00d4ff] transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="appearance-none bg-secondary border border-border rounded-lg px-3 py-1.5 pr-8 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00d4ff] disabled:opacity-50"
            >
              <option value="aguardando">Aguardando</option>
              <option value="embalando">Embalando</option>
              <option value="pronto">Pronto</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </td>
    </tr>
  )
}

function PedidoDetail({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Pedido #{pedido.codigo}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente Info */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">CLIENTE</h3>
            <p className="text-foreground font-medium">{pedido.cliente_nome || "Cliente"}</p>
            {pedido.cliente_telefone && (
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={`https://wa.me/55${pedido.cliente_telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chamar no WhatsApp
                </a>
                <span className="text-muted-foreground text-sm">{pedido.cliente_telefone}</span>
              </div>
            )}
            {pedido.cliente_email && (
              <p className="text-muted-foreground text-sm mt-1">{pedido.cliente_email}</p>
            )}
          </div>

          {/* Tipo de Entrega */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">TIPO DE ENTREGA</h3>
            <div className="flex items-center gap-2">
              {pedido.tipo_entrega === "entrega" ? (
                <>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00d4ff]/20">
                    <Truck className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <div>
                    <p className="text-[#00d4ff] font-medium">Entrega</p>
                    <p className="text-xs text-muted-foreground">O cliente quer receber em casa</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00ff88]/20">
                    <Store className="w-5 h-5 text-[#00ff88]" />
                  </div>
                  <div>
                    <p className="text-[#00ff88] font-medium">Retirada na Loja</p>
                    <p className="text-xs text-muted-foreground">O cliente vai buscar na loja</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Endereço de Entrega */}
          {pedido.tipo_entrega === "entrega" && (
            <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#00d4ff] mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                ENDEREÇO DE ENTREGA
              </h3>
              {pedido.endereco_entrega ? (
                <p className="text-foreground">{pedido.endereco_entrega}</p>
              ) : (
                <p className="text-muted-foreground italic">Endereço não informado</p>
              )}
            </div>
          )}

          {/* Itens */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">ITENS</h3>
            <div className="space-y-3">
              {pedido.pedido_itens && pedido.pedido_itens.length > 0 ? (
                pedido.pedido_itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-secondary rounded-lg p-3"
                  >
                    <div>
                      <p className="text-foreground font-medium">
                        {item.produto_nome || "Produto"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">
                        {item.quantidade}x {formatCurrency(item.preco_unitario)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum item registrado</p>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          {pedido.forma_pagamento && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">PAGAMENTO</h3>
              <p className="text-foreground capitalize">{pedido.forma_pagamento}</p>
            </div>
          )}

{/* Observações */}
  {pedido.observacoes && (
  <div>
  <h3 className="text-sm font-medium text-muted-foreground mb-2">OBSERVAÇÕES</h3>
  <p className="text-foreground text-sm bg-secondary rounded-lg p-3">
  {pedido.observacoes}
  </p>
  </div>
  )}

  {/* Motivo de Cancelamento */}
  {pedido.status === "cancelado" && pedido.motivo_cancelamento && (
  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
  <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
  <X className="w-4 h-4" />
  MOTIVO DO CANCELAMENTO
  </h3>
  <p className="text-foreground">{pedido.motivo_cancelamento}</p>
  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
  {pedido.cancelado_por && (
  <span>Cancelado por: <span className="text-foreground capitalize">{pedido.cancelado_por}</span></span>
  )}
  {pedido.data_cancelamento && (
  <span>Em: {new Date(pedido.data_cancelamento).toLocaleString("pt-BR")}</span>
  )}
  </div>
  </div>
  )}
  
  {/* Totais */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-foreground font-bold">{formatCurrency(pedido.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lucro</span>
              <span className="text-[#00ff88] font-bold">{formatCurrency(pedido.lucro)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
