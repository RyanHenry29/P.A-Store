"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, ShoppingBag, Check, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { useCart } from "./cart-context"
import type { Produto, Variante, Categoria } from "@/lib/types"

interface ProdutoWithRelations extends Produto {
  categorias: Pick<Categoria, "nome" | "slug"> | null
  variantes: (Pick<Variante, "id" | "tamanho" | "cor" | "estoque" | "preco_venda" | "preco_custo">)[]
}

interface ProdutoDetailProps {
  produto: ProdutoWithRelations
}

export function ProdutoDetail({ produto }: ProdutoDetailProps) {
  const { addItem } = useCart()
  
  // Separate state for selected tamanho and cor
  const [selectedTamanho, setSelectedTamanho] = useState<string | null>(
    produto.variantes[0]?.tamanho || null
  )
  const [selectedCor, setSelectedCor] = useState<string | null>(
    produto.variantes[0]?.cor || null
  )
  const [added, setAdded] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  
  // Image gallery state
  const allImages = produto.imagens?.length > 0 
    ? produto.imagens 
    : produto.imagem_url 
      ? [produto.imagem_url] 
      : []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Find variante based on selected tamanho and cor
  const varianteAtual = produto.variantes.find((v) => {
    const matchTamanho = !selectedTamanho || v.tamanho === selectedTamanho
    const matchCor = !selectedCor || v.cor === selectedCor
    return matchTamanho && matchCor
  })

  const tamanhos = [...new Set(produto.variantes.map((v) => v.tamanho).filter(Boolean))]
  const cores = [...new Set(produto.variantes.map((v) => v.cor).filter(Boolean))]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleAddToCart = () => {
    if (!varianteAtual || varianteAtual.estoque === 0) return

    addItem({
      varianteId: varianteAtual.id,
      produtoNome: produto.nome,
      produtoImagem: produto.imagem_url,
      tamanho: varianteAtual.tamanho,
      cor: varianteAtual.cor,
      preco: varianteAtual.preco_venda,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleSelectTamanho = (tamanho: string) => {
    setSelectedTamanho(tamanho)
    // Try to find a variant with this tamanho and current cor
    const varianteComCorAtual = produto.variantes.find(
      (v) => v.tamanho === tamanho && v.cor === selectedCor && v.estoque > 0
    )
    // If not found with current cor, just set tamanho and let cor be flexible
    if (!varianteComCorAtual && selectedCor) {
      const varianteComTamanho = produto.variantes.find(
        (v) => v.tamanho === tamanho && v.estoque > 0
      )
      if (varianteComTamanho?.cor) {
        setSelectedCor(varianteComTamanho.cor)
      }
    }
  }

  const handleSelectCor = (cor: string) => {
    setSelectedCor(cor)
    // Try to find a variant with this cor and current tamanho
    const varianteComTamanhoAtual = produto.variantes.find(
      (v) => v.cor === cor && v.tamanho === selectedTamanho && v.estoque > 0
    )
    // If not found with current tamanho, just set cor and let tamanho be flexible
    if (!varianteComTamanhoAtual && selectedTamanho) {
      const varianteComCor = produto.variantes.find(
        (v) => v.cor === cor && v.estoque > 0
      )
      if (varianteComCor?.tamanho) {
        setSelectedTamanho(varianteComCor.tamanho)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div 
            className="aspect-square relative bg-card border border-border rounded-2xl overflow-hidden cursor-zoom-in group"
            onClick={() => allImages.length > 0 && setZoomOpen(true)}
          >
            {allImages.length > 0 ? (
              <>
                <Image
                  src={allImages[currentImageIndex]}
                  alt={produto.nome}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                
                {/* Zoom indicator */}
                <div className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5" />
                </div>
                
                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    index === currentImageIndex 
                      ? "border-[#00d4ff]" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${produto.nome} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {produto.categorias && (
            <span className="inline-block bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full">
              {produto.categorias.nome}
            </span>
          )}

          <h1 className="text-3xl font-bold text-foreground">{produto.nome}</h1>

          {produto.descricao && (
            <p className="text-muted-foreground">{produto.descricao}</p>
          )}

          {/* Price */}
          <div className="text-3xl font-bold text-[#00d4ff]">
            {varianteAtual ? formatCurrency(varianteAtual.preco_venda) : "-"}
          </div>

          {/* Tamanhos */}
          {tamanhos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Tamanho
              </label>
              <div className="flex flex-wrap gap-2">
                {tamanhos.map((tamanho) => {
                  const variantesComTamanho = produto.variantes.filter(
                    (v) => v.tamanho === tamanho
                  )
                  const temEstoque = variantesComTamanho.some((v) => v.estoque > 0)
                  const isSelected = selectedTamanho === tamanho

                  return (
                    <button
                      key={tamanho}
                      onClick={() => handleSelectTamanho(tamanho!)}
                      disabled={!temEstoque}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-[#00d4ff] text-black"
                          : temEstoque
                          ? "bg-secondary border border-border text-foreground hover:border-[#00d4ff]"
                          : "bg-muted text-muted-foreground line-through cursor-not-allowed"
                      }`}
                    >
                      {tamanho}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cores */}
          {cores.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {cores.map((cor) => {
                  const variantesComCor = produto.variantes.filter((v) => v.cor === cor)
                  const temEstoque = variantesComCor.some((v) => v.estoque > 0)
                  const isSelected = selectedCor === cor

                  return (
                    <button
                      key={cor}
                      onClick={() => handleSelectCor(cor!)}
                      disabled={!temEstoque}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-[#00d4ff] text-black"
                          : temEstoque
                          ? "bg-secondary border border-border text-foreground hover:border-[#00d4ff]"
                          : "bg-muted text-muted-foreground line-through cursor-not-allowed"
                      }`}
                    >
                      {cor}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          {varianteAtual && (
            <p className={`text-sm ${varianteAtual.estoque > 0 ? "text-[#00ff88]" : "text-destructive"}`}>
              {varianteAtual.estoque > 0
                ? `${varianteAtual.estoque} unidades disponíveis`
                : "Produto esgotado"}
            </p>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!varianteAtual || varianteAtual.estoque === 0}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              added
                ? "bg-[#00ff88] text-black"
                : "bg-[#00d4ff] hover:bg-[#00a3cc] text-black disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                Adicionar ao carrinho
              </>
            )}
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setZoomOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Main zoomed image */}
          <div 
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[currentImageIndex]}
              alt={produto.nome}
              fill
              className="object-contain"
              quality={100}
            />
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Thumbnails at bottom */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-[#00d4ff] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${produto.nome} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
