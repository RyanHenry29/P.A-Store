"use client"

import { AlertTriangle, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface StockItem {
  id: string
  tamanho: string | null
  cor: string | null
  estoque: number
  produtos: {
    id: string
    nome: string
    imagem_url: string | null
  } | null
}

interface StockAlertsProps {
  items: StockItem[]
}

export function StockAlerts({ items }: StockAlertsProps) {
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-destructive/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Alerta de Estoque Crítico</h3>
            <p className="text-sm text-muted-foreground">
              Produtos com menos de 3 unidades
            </p>
          </div>
        </div>
        <Link
          href="/admin/estoque"
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00a3cc] text-sm font-medium transition-colors"
        >
          Ver estoque completo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
          >
            {item.produtos?.imagem_url ? (
              <Image
                src={item.produtos.imagem_url}
                alt={item.produtos.nome}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">IMG</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.produtos?.nome}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.tamanho && `${item.tamanho}`}
                {item.tamanho && item.cor && " / "}
                {item.cor && `${item.cor}`}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${
                item.estoque === 0 ? "text-destructive" : "text-[#ff9500]"
              }`}>
                {item.estoque}
              </span>
              <p className="text-xs text-muted-foreground">un.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
