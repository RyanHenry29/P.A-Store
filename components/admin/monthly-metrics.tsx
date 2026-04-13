"use client"

import { DollarSign, TrendingUp, ShoppingBag, CheckCircle, XCircle, Target } from "lucide-react"

interface MonthlyMetricsProps {
  vendasConfirmadas: number
  lucroConfirmado: number
  possiveisVendas: number
  totalPedidos: number
  pedidosFinalizados: number
  pedidosCancelados: number
  variacaoMes: number
}

export function MonthlyMetrics({
  vendasConfirmadas,
  lucroConfirmado,
  possiveisVendas,
  totalPedidos,
  pedidosFinalizados,
  pedidosCancelados,
  variacaoMes
}: MonthlyMetricsProps) {
  const taxaConversao = totalPedidos > 0 
    ? Math.round((pedidosFinalizados / totalPedidos) * 100) 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Vendas Confirmadas do Mês */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <DollarSign className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Vendas do Mês</span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          R$ {vendasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {variacaoMes >= 0 ? (
            <span className="text-xs text-emerald-400">+{variacaoMes}% vs mês anterior</span>
          ) : (
            <span className="text-xs text-red-400">{variacaoMes}% vs mês anterior</span>
          )}
        </div>
      </div>

      {/* Lucro do Mês */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Lucro do Mês</span>
        </div>
        <p className="text-2xl font-bold text-cyan-400">
          R$ {lucroConfirmado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {pedidosFinalizados} pedidos finalizados
        </p>
      </div>

      {/* Total de Pedidos */}
      <div className="bg-secondary/50 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Total Pedidos</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalPedidos}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            {pedidosFinalizados} finalizados
          </span>
          {pedidosCancelados > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="w-3 h-3" />
              {pedidosCancelados} cancelados
            </span>
          )}
        </div>
      </div>

      {/* Taxa de Conversão */}
      <div className="bg-secondary/50 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Target className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Taxa Finalização</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{taxaConversao}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {possiveisVendas > 0 && (
            <span className="text-amber-400">
              R$ {possiveisVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendentes
            </span>
          )}
          {possiveisVendas === 0 && "Todos finalizados"}
        </p>
      </div>
    </div>
  )
}
