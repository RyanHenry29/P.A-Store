"use client"

import Image from "next/image"
import Link from "next/link"
import { Package } from "lucide-react"
import type { Produto, Variante, Categoria } from "@/lib/types"

interface ProdutoWithRelations extends Produto {
  categorias: Pick<Categoria, "nome" | "slug"> | null
  variantes: Pick<Variante, "id" | "tamanho" | "cor" | "estoque" | "preco_venda">[]
}

interface ProdutoCardProps {
  produto: ProdutoWithRelations
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  const precos = produto.variantes.map((v) => v.preco_venda)
  const minPreco = Math.min(...precos)
  const maxPreco = Math.max(...precos)
  const temVariantes = produto.variantes.length > 1

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Link
      href={`/catalogo/produto/${produto.id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-[#00d4ff]/50 transition-all"
    >
      {/* Image */}
      <div className="aspect-square relative bg-muted">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {produto.categorias && (
          <span className="absolute top-2 left-2 bg-background/90 backdrop-blur text-xs font-medium px-2 py-1 rounded-full text-muted-foreground">
            {produto.categorias.nome}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-foreground group-hover:text-[#00d4ff] transition-colors line-clamp-2">
          {produto.nome}
        </h3>
        <div className="mt-2">
          {temVariantes && minPreco !== maxPreco ? (
            <p className="text-[#00d4ff] font-bold">
              {formatCurrency(minPreco)} - {formatCurrency(maxPreco)}
            </p>
          ) : (
            <p className="text-[#00d4ff] font-bold">{formatCurrency(minPreco)}</p>
          )}
        </div>
        {temVariantes && (
          <p className="text-xs text-muted-foreground mt-1">
            {produto.variantes.length} opções
          </p>
        )}
      </div>
    </Link>
  )
}
