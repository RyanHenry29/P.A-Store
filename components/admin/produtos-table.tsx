"use client"

import { useState } from "react"
import { Search, Edit, Trash2, Package, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Produto, Variante, Categoria } from "@/lib/types"
import { ProdutoEditModal } from "./produto-edit-modal"

interface ProdutoWithRelations extends Produto {
  categorias: Pick<Categoria, "nome"> | null
  variantes: Variante[]
}

interface ProdutosTableProps {
  produtos: ProdutoWithRelations[]
  categorias: Categoria[]
}

export function ProdutosTable({ produtos, categorias }: ProdutosTableProps) {
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProdutoWithRelations | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredProdutos = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categorias?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  const [toggling, setToggling] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    
    setDeleting(id)
    await supabase.from("produtos").delete().eq("id", id)
    router.refresh()
    setDeleting(null)
  }

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    setToggling(id)
    await supabase.from("produtos").update({ ativo: !currentStatus }).eq("id", id)
    router.refresh()
    setToggling(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTotalStock = (variantes: Variante[]) => {
    return variantes.reduce((sum, v) => sum + v.estoque, 0)
  }

  const getPriceRange = (variantes: Variante[]) => {
    if (variantes.length === 0) return "-"
    const prices = variantes.map((v) => v.preco_venda)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return formatCurrency(min)
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
          />
        </div>
      </div>

      {filteredProdutos.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {produto.imagem_url ? (
                        <Image
                          src={produto.imagem_url}
                          alt={produto.nome}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-foreground">{produto.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {produto.categorias?.nome || "-"}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {getPriceRange(produto.variantes)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getTotalStock(produto.variantes) < 5 ? "text-[#ff9500]" : "text-foreground"}`}>
                      {getTotalStock(produto.variantes)} un.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleVisibility(produto.id, produto.ativo)}
                      disabled={toggling === produto.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                        produto.ativo
                          ? "bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {produto.ativo ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Visível
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Oculto
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingProduct(produto)}
                        className="p-2 text-muted-foreground hover:text-[#00d4ff] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        disabled={deleting === produto.id}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProdutoEditModal
          produto={{
            ...editingProduct,
            imagens: editingProduct.imagens || (editingProduct.imagem_url ? [editingProduct.imagem_url] : [])
          }}
          categorias={categorias}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
