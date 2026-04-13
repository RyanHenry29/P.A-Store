"use client"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Pedido, Profile } from "@/lib/types"

interface OrderWithProfile extends Pedido {
  profiles: Pick<Profile, "nome" | "telefone" | "email"> | null
}

interface RecentOrdersProps {
  orders: OrderWithProfile[]
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

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          ÚLTIMOS PEDIDOS
        </h2>
        <Link
          href="/admin/pedidos"
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00a3cc] text-sm font-medium transition-colors"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lucro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function OrderRow({ order }: { order: OrderWithProfile }) {
  const [status, setStatus] = useState(order.status)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const { error } = await supabase
      .from("pedidos")
      .update({ status: newStatus })
      .eq("id", order.id)

    if (!error) {
      setStatus(newStatus)
    }
    setUpdating(false)
  }

  const colors = statusColors[status] || statusColors.aguardando

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4">
        <span className="text-[#00d4ff] font-medium">#{order.codigo}</span>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-foreground font-medium">
            {order.profiles?.nome || "Cliente"}
          </p>
          <p className="text-muted-foreground text-sm">
            {order.profiles?.telefone || order.profiles?.email || "-"}
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-foreground font-medium">
          {formatCurrency(order.total)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[#00ff88] font-medium">
          {formatCurrency(order.lucro)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-foreground uppercase text-sm">
          {order.tipo_entrega === "entrega" ? "ENTREGA" : "RETIRADA"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00d4ff] disabled:opacity-50"
          >
            <option value="aguardando">Aguardando</option>
            <option value="embalando">Embalando</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </td>
    </tr>
  )
}
