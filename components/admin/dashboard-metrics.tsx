"use client"

import { DollarSign, TrendingUp, ShoppingBag, Package, ArrowUp, ArrowDown, Clock, CheckCircle } from "lucide-react"

interface DashboardMetricsProps {
  vendasConfirmadas: number
  lucroConfirmado: number
  possiveisVendas: number
  possivelLucro: number
  pedidosHoje: number
  aguardando: number
  produtosAtivos: number
  estoqueBaixo: number
  variacaoVendas: number
}

export function DashboardMetrics({
  vendasConfirmadas,
  lucroConfirmado,
  possiveisVendas,
  possivelLucro,
  pedidosHoje,
  aguardando,
  produtosAtivos,
  estoqueBaixo,
  variacaoVendas,
}: DashboardMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-4">
      {/* Vendas Confirmadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas Confirmadas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <CheckCircle className="w-4 h-4 text-[#00ff88]" />
            <span>VENDAS CONFIRMADAS</span>
          </div>
          <p className="text-3xl font-bold text-[#00ff88]">
            {formatCurrency(vendasConfirmadas)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {variacaoVendas >= 0 ? (
              <>
                <ArrowUp className="w-4 h-4 text-[#00ff88]" />
                <span className="text-[#00ff88] text-sm">
                  {variacaoVendas}% vs ontem
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-[#ff4d4d]" />
                <span className="text-[#ff4d4d] text-sm">
                  {Math.abs(variacaoVendas)}% vs ontem
                </span>
              </>
            )}
          </div>
        </div>

        {/* Lucro Confirmado */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <TrendingUp className="w-4 h-4 text-[#00ff88]" />
            <span>LUCRO CONFIRMADO</span>
          </div>
          <p className="text-3xl font-bold text-[#00ff88]">
            {formatCurrency(lucroConfirmado)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Pedidos finalizados
          </p>
        </div>

        {/* Possíveis Vendas (Pendentes) */}
        <div className="bg-card border border-[#f59e0b]/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#f59e0b] text-sm mb-3">
            <Clock className="w-4 h-4" />
            <span>POSSÍVEIS VENDAS</span>
          </div>
          <p className="text-3xl font-bold text-[#f59e0b]">
            {formatCurrency(possiveisVendas)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {aguardando} pedidos pendentes
          </p>
        </div>

        {/* Possível Lucro */}
        <div className="bg-card border border-[#f59e0b]/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#f59e0b] text-sm mb-3">
            <TrendingUp className="w-4 h-4" />
            <span>POSSÍVEL LUCRO</span>
          </div>
          <p className="text-3xl font-bold text-[#f59e0b]">
            {formatCurrency(possivelLucro)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Aguardando finalização
          </p>
        </div>
      </div>

      {/* Segunda linha - Totais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total do Dia */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <DollarSign className="w-4 h-4" />
            <span>TOTAL DO DIA</span>
          </div>
          <p className="text-3xl font-bold text-[#00d4ff]">
            {formatCurrency(vendasConfirmadas + possiveisVendas)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Confirmadas + Pendentes
          </p>
        </div>

        {/* Pedidos Hoje */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <ShoppingBag className="w-4 h-4" />
            <span>PEDIDOS HOJE</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {pedidosHoje}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {aguardando} aguardando
          </p>
        </div>

        {/* Produtos Ativos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Package className="w-4 h-4" />
            <span>PRODUTOS ATIVOS</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {produtosAtivos}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {estoqueBaixo} com estoque baixo
          </p>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>TAXA FINALIZAÇÃO</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {pedidosHoje > 0 ? Math.round(((pedidosHoje - aguardando) / pedidosHoje) * 100) : 0}%
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {pedidosHoje - aguardando} de {pedidosHoje} finalizados
          </p>
        </div>
      </div>
    </div>
  )
}
