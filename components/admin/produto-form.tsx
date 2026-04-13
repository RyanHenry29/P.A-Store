"use client"

import { useState, useEffect } from "react"
import { Plus, X, Loader2, Upload, Sparkles, Package } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Categoria } from "@/lib/types"

interface ProdutoFormProps {
  categorias: Categoria[]
  initialOpen?: boolean
}

interface VarianteGerada {
  tamanho: string
  cor: string
  estoque: number
  preco_custo: number
  preco_venda: number
  selecionada: boolean
}

export function ProdutoForm({ categorias, initialOpen = false }: ProdutoFormProps) {
  const [open, setOpen] = useState(initialOpen)
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [preco, setPreco] = useState("")
  const [precoCusto, setPrecoCusto] = useState("")
  const [imagens, setImagens] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  
  // Novo sistema de variantes
  const [tamanhos, setTamanhos] = useState("P, M, G, GG")
  const [cores, setCores] = useState("")
  const [variantesGeradas, setVariantesGeradas] = useState<VarianteGerada[]>([])
  const [estoqueGlobal, setEstoqueGlobal] = useState(10)
  
  const router = useRouter()
  const supabase = createClient()

  // Gerar variantes automaticamente quando mudar tamanhos ou cores
  useEffect(() => {
    const tamanhosArray = tamanhos
      .split(",")
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0)
    
    const coresArray = cores
      .split(",")
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0)

    const precoVenda = parseFloat(preco) || 0
    const precoCustoVal = parseFloat(precoCusto) || 0

    const novasVariantes: VarianteGerada[] = []

    if (tamanhosArray.length > 0 && coresArray.length > 0) {
      // Gerar todas as combinações tamanho x cor
      for (const tamanho of tamanhosArray) {
        for (const cor of coresArray) {
          novasVariantes.push({
            tamanho,
            cor,
            estoque: estoqueGlobal,
            preco_custo: precoCustoVal,
            preco_venda: precoVenda,
            selecionada: true,
          })
        }
      }
    } else if (tamanhosArray.length > 0) {
      // Só tamanhos, sem cores
      for (const tamanho of tamanhosArray) {
        novasVariantes.push({
          tamanho,
          cor: "",
          estoque: estoqueGlobal,
          preco_custo: precoCustoVal,
          preco_venda: precoVenda,
          selecionada: true,
        })
      }
    } else if (coresArray.length > 0) {
      // Só cores, sem tamanhos
      for (const cor of coresArray) {
        novasVariantes.push({
          tamanho: "",
          cor,
          estoque: estoqueGlobal,
          preco_custo: precoCustoVal,
          preco_venda: precoVenda,
          selecionada: true,
        })
      }
    }

    setVariantesGeradas(novasVariantes)
  }, [tamanhos, cores, estoqueGlobal, preco, precoCusto])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        
        if (res.ok && data.url) {
          setImagens(prev => [...prev, data.url])
        } else {
          alert(data.error || 'Erro no upload de uma imagem.')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro no upload da imagem.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index))
  }

  const toggleVariante = (index: number) => {
    const novas = [...variantesGeradas]
    novas[index].selecionada = !novas[index].selecionada
    setVariantesGeradas(novas)
  }

  const updateVarianteEstoque = (index: number, estoque: number) => {
    const novas = [...variantesGeradas]
    novas[index].estoque = estoque
    setVariantesGeradas(novas)
  }

  const selecionarTodas = () => {
    setVariantesGeradas(variantesGeradas.map(v => ({ ...v, selecionada: true })))
  }

  const deselecionarTodas = () => {
    setVariantesGeradas(variantesGeradas.map(v => ({ ...v, selecionada: false })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      alert('Por favor, preencha o nome do produto')
      return
    }

    if (!preco || parseFloat(preco) <= 0) {
      alert('Por favor, preencha o preço de venda')
      return
    }

    const variantesSelecionadas = variantesGeradas.filter(v => v.selecionada)
    if (variantesSelecionadas.length === 0) {
      alert('Por favor, selecione pelo menos uma variante')
      return
    }

    setLoading(true)

    try {
      // Create product
      const { data: produto, error: produtoError } = await supabase
        .from("produtos")
        .insert({
          nome,
          descricao: descricao || null,
          categoria_id: categoriaId || null,
          preco: parseFloat(preco),
          preco_custo: precoCusto ? parseFloat(precoCusto) : 0,
          imagem_url: imagens[0] || null,
          imagens: imagens,
          ativo: true,
        })
        .select()
        .single()

      if (produtoError) {
        alert(`Erro ao criar produto: ${produtoError.message}`)
        return
      }

      // Create variants
      const variantesData = variantesSelecionadas.map((v) => ({
        produto_id: produto.id,
        tamanho: v.tamanho || null,
        cor: v.cor || null,
        estoque: v.estoque,
        preco_custo: v.preco_custo,
        preco_venda: v.preco_venda,
      }))

      const { error: variantesError } = await supabase
        .from("variantes")
        .insert(variantesData)

      if (variantesError) {
        alert(`Produto criado, mas erro ao criar variantes: ${variantesError.message}`)
      }

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error('Error creating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao criar produto: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNome("")
    setDescricao("")
    setCategoriaId("")
    setPreco("")
    setPrecoCusto("")
    setImagens([])
    setTamanhos("P, M, G, GG")
    setCores("")
    setVariantesGeradas([])
    setEstoqueGlobal(10)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        Novo Produto
      </button>
    )
  }

  const variantesSelecionadas = variantesGeradas.filter(v => v.selecionada).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Novo Produto</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Nome do produto *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Camisa Polo, Calça Jeans, Vestido..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Descricao
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={2}
                placeholder="Descricao do produto..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Categoria
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Preco de custo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoCusto}
                  onChange={(e) => setPrecoCusto(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Preco de venda *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Imagens do produto
              </label>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {imagens.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 group">
                    <Image
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-[#00d4ff] text-black px-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
                
                <label className="w-20 h-20 flex flex-col items-center justify-center bg-secondary border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#00d4ff] transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                    multiple
                  />
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#00d4ff]" />
                      <span className="text-[9px] text-muted-foreground mt-1">Adicionar</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Gerador de Variantes */}
          <div className="border border-[#00d4ff]/30 rounded-xl p-5 bg-[#00d4ff]/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#00d4ff]" />
              <h3 className="font-semibold text-foreground">Gerador de Variantes</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Digite os tamanhos e cores separados por virgula. O sistema gera todas as combinacoes automaticamente!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Tamanhos (separados por virgula)
                </label>
                <input
                  type="text"
                  value={tamanhos}
                  onChange={(e) => setTamanhos(e.target.value)}
                  placeholder="Ex: P, M, G, GG"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Cores (separadas por virgula)
                </label>
                <input
                  type="text"
                  value={cores}
                  onChange={(e) => setCores(e.target.value)}
                  placeholder="Ex: Preto, Branco, Azul"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-2">
                  Estoque inicial para todas
                </label>
                <input
                  type="number"
                  min="0"
                  value={estoqueGlobal}
                  onChange={(e) => setEstoqueGlobal(parseInt(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
              </div>
              <div className="flex gap-2 pt-6">
                <button
                  type="button"
                  onClick={selecionarTodas}
                  className="px-3 py-2 text-xs bg-[#00ff88]/20 text-[#00ff88] rounded-lg hover:bg-[#00ff88]/30 transition-colors"
                >
                  Selecionar todas
                </button>
                <button
                  type="button"
                  onClick={deselecionarTodas}
                  className="px-3 py-2 text-xs bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Variantes Geradas */}
            {variantesGeradas.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Variantes geradas ({variantesSelecionadas} selecionadas)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                  {variantesGeradas.map((variante, index) => (
                    <div
                      key={index}
                      onClick={() => toggleVariante(index)}
                      className={`
                        relative p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${variante.selecionada 
                          ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                          : 'border-border bg-secondary/50 opacity-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${variante.selecionada ? 'text-[#00d4ff]' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {variante.tamanho && variante.cor 
                              ? `${variante.tamanho} - ${variante.cor}`
                              : variante.tamanho || variante.cor
                            }
                          </p>
                        </div>
                      </div>
                      {variante.selecionada && (
                        <div className="mt-2">
                          <input
                            type="number"
                            min="0"
                            value={variante.estoque}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation()
                              updateVarianteEstoque(index, parseInt(e.target.value) || 0)
                            }}
                            className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-center text-foreground"
                          />
                          <span className="text-[10px] text-muted-foreground">estoque</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {variantesGeradas.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Digite tamanhos e/ou cores para gerar as variantes</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || variantesSelecionadas === 0}
              className="flex-1 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Criar com {variantesSelecionadas} variantes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
