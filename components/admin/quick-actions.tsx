"use client"

import Link from "next/link"
import { ShoppingBag, AlertTriangle, Plus, Package } from "lucide-react"

interface QuickActionsProps {
  pendingOrders: number
  criticalStock: number
}

export function QuickActions({ pendingOrders, criticalStock }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pedidos Pendentes */}
      <Link
        href="/admin/pedidos?status=aguardando"
        className="flex items-center gap-4 bg-[#ff9500]/10 border border-[#ff9500]/30 rounded-xl p-4 hover:bg-[#ff9500]/20 transition-all group"
      >
        <div className="w-12 h-12 bg-[#ff9500]/20 rounded-xl flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-[#ff9500]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#ff9500]">{pendingOrders}</p>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Pedidos pendentes
          </p>
        </div>
      </Link>

      {/* Estoque Crítico */}
      <Link
        href="/admin/estoque?filter=critico"
        className={`flex items-center gap-4 rounded-xl p-4 transition-all group ${
          criticalStock > 0 
            ? "bg-destructive/10 border border-destructive/30 hover:bg-destructive/20" 
            : "bg-card border border-border hover:bg-muted"
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          criticalStock > 0 ? "bg-destructive/20" : "bg-muted"
        }`}>
          <AlertTriangle className={`w-6 h-6 ${criticalStock > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${criticalStock > 0 ? "text-destructive" : "text-foreground"}`}>
            {criticalStock}
          </p>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Estoque crítico
          </p>
        </div>
      </Link>

      {/* Novo Produto */}
      <Link
        href="/admin/produtos?action=novo"
        className="flex items-center gap-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-xl p-4 hover:bg-[#00d4ff]/20 transition-all group"
      >
        <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center">
          <Plus className="w-6 h-6 text-[#00d4ff]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#00d4ff]">AÇÃO RÁPIDA</p>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Cadastrar produto
          </p>
        </div>
      </Link>

      {/* Ver Catálogo */}
      <Link
        href="/catalogo"
        target="_blank"
        className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:bg-muted transition-all group"
      >
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">VER LOJA</p>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Abrir catálogo
          </p>
        </div>
      </Link>
    </div>
  )
}
