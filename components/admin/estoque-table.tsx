"use client"

import { useState } from "react"
import { Search, Package, AlertTriangle, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Variante {
  id: string
  produto_id: string
  tamanho: string | null
  cor: string | null
  estoque: number
  preco_custo: number
  preco_venda: number
  produtos: {
    nome: string
    imagem_url: string | null
    ativo: boolean
  }
}

interface EstoqueTableProps {
  variantes: Variante[]
}

export function EstoqueTable({ variantes }: EstoqueTableProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")

  const filteredVariantes = variantes.filter((v) => {
    const matchesSearch = v.produtos.nome.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "low" && v.estoque > 0 && v.estoque < 5) ||
      (filter === "out" && v.estoque === 0)
    return matchesSearch && matchesFilter
  })

  const totalItems = variantes.reduce((sum, v) => sum + v.estoque, 0)
  const lowStockCount = variantes.filter((v) => v.estoque > 0 && v.estoque < 5).length
  const outOfStockCount = variantes.filter((v) => v.estoque === 0).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm mb-2">Total em estoque</p>
          <p className="text-3xl font-bold text-foreground">{totalItems}</p>
          <p className="text-muted-foreground text-sm">unidades</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm mb-2">Estoque baixo</p>
          <p className="text-3xl font-bold text-[#ff9500]">{lowStockCount}</p>
          <p className="text-muted-foreground text-sm">variantes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm mb-2">Sem estoque</p>
          <p className="text-3xl font-bold text-destructive">{outOfStockCount}</p>
          <p className="text-muted-foreground text-sm">variantes</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#00d4ff] text-black"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "low"
                  ? "bg-[#ff9500] text-black"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Baixo
            </button>
            <button
              onClick={() => setFilter("out")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "out"
                  ? "bg-destructive text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Zerado
            </button>
          </div>
        </div>

        {filteredVariantes.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma variante encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Variante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Custo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Venda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Estoque
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                    Ajustar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVariantes.map((variante) => (
                  <EstoqueRow key={variante.id} variante={variante} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function EstoqueRow({ variante }: { variante: Variante }) {
  const [estoque, setEstoque] = useState(variante.estoque)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleAdjust = async (delta: number) => {
    const newEstoque = Math.max(0, estoque + delta)
    setUpdating(true)
    await supabase.from("variantes").update({ estoque: newEstoque }).eq("id", variante.id)
    setEstoque(newEstoque)
    setUpdating(false)
    router.refresh()
  }

  const isLowStock = estoque > 0 && estoque < 5
  const isOutOfStock = estoque === 0

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {variante.produtos.imagem_url ? (
            <Image
              src={variante.produtos.imagem_url}
              alt={variante.produtos.nome}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium text-foreground">{variante.produtos.nome}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {variante.tamanho && `Tam: ${variante.tamanho}`}
        {variante.tamanho && variante.cor && " | "}
        {variante.cor && `Cor: ${variante.cor}`}
        {!variante.tamanho && !variante.cor && "-"}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {formatCurrency(variante.preco_custo)}
      </td>
      <td className="px-6 py-4 text-foreground font-medium">
        {formatCurrency(variante.preco_venda)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {(isLowStock || isOutOfStock) && (
            <AlertTriangle className={`w-4 h-4 ${isOutOfStock ? "text-destructive" : "text-[#ff9500]"}`} />
          )}
          <span
            className={`font-bold ${
              isOutOfStock
                ? "text-destructive"
                : isLowStock
                ? "text-[#ff9500]"
                : "text-foreground"
            }`}
          >
            {estoque}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAdjust(-1)}
            disabled={updating || estoque === 0}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAdjust(1)}
            disabled={updating}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
