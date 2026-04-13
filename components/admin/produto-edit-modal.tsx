"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { X, Loader2, Upload, Trash2, Plus, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface Categoria {
  id: string
  nome: string
}

interface Variante {
  id: string
  tamanho: string | null
  cor: string | null
  estoque: number
  preco_custo: number
  preco_venda: number
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  categoria_id: string | null
  preco: number
  preco_custo: number
  imagem_url: string | null
  imagens: string[]
  ativo: boolean
  variantes: Variante[]
}

interface ProdutoEditModalProps {
  produto: Produto
  categorias: Categoria[]
  open: boolean
  onClose: () => void
}

export function ProdutoEditModal({ produto, categorias, open, onClose }: ProdutoEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(produto.nome)
  const [descricao, setDescricao] = useState(produto.descricao || "")
  const [categoriaId, setCategoriaId] = useState(produto.categoria_id || "")
  const [preco, setPreco] = useState(String(produto.preco))
  const [precoCusto, setPrecoCusto] = useState(String(produto.preco_custo || 0))
  const [ativo, setAtivo] = useState(produto.ativo)
  const [imagens, setImagens] = useState<string[]>(produto.imagens || [])
  const [uploading, setUploading] = useState(false)
  const [variantes, setVariantes] = useState<Variante[]>(produto.variantes || [])
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setNome(produto.nome)
    setDescricao(produto.descricao || "")
    setCategoriaId(produto.categoria_id || "")
    setPreco(String(produto.preco))
    setPrecoCusto(String(produto.preco_custo || 0))
    setAtivo(produto.ativo)
    setImagens(produto.imagens || [])
    setVariantes(produto.variantes || [])
  }, [produto])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (res.ok && data.url) {
        setImagens([...imagens, data.url])
      } else {
        alert(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro no upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index))
  }

  const handleAddVariante = () => {
    setVariantes([...variantes, { 
      id: `new-${Date.now()}`, 
      tamanho: "", 
      cor: "", 
      estoque: 0, 
      preco_custo: 0, 
      preco_venda: 0 
    }])
  }

  const handleRemoveVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index))
  }

  const handleVarianteChange = (index: number, field: keyof Variante, value: string | number) => {
    const updated = [...variantes]
    updated[index] = { ...updated[index], [field]: value }
    setVariantes(updated)
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

    setLoading(true)

    try {
      // Update product
      const { error: produtoError } = await supabase
        .from("produtos")
        .update({
          nome,
          descricao: descricao || null,
          categoria_id: categoriaId || null,
          preco: parseFloat(preco),
          preco_custo: precoCusto ? parseFloat(precoCusto) : 0,
          imagem_url: imagens[0] || null,
          imagens: imagens,
          ativo,
        })
        .eq("id", produto.id)

      if (produtoError) {
        alert(`Erro ao atualizar produto: ${produtoError.message}`)
        return
      }

      // Handle variants - delete removed ones, update existing, insert new
      const existingIds = variantes.filter(v => !v.id.startsWith('new-')).map(v => v.id)
      
      // Delete variants not in the list
      if (produto.variantes.length > 0) {
        const toDelete = produto.variantes.filter(v => !existingIds.includes(v.id)).map(v => v.id)
        if (toDelete.length > 0) {
          await supabase.from("variantes").delete().in("id", toDelete)
        }
      }

      // Update existing variants
      for (const v of variantes.filter(v => !v.id.startsWith('new-'))) {
        await supabase.from("variantes").update({
          tamanho: v.tamanho || null,
          cor: v.cor || null,
          estoque: v.estoque,
          preco_custo: v.preco_custo,
          preco_venda: v.preco_venda,
        }).eq("id", v.id)
      }

      // Insert new variants
      const newVariants = variantes.filter(v => v.id.startsWith('new-'))
      if (newVariants.length > 0) {
        const variantesData = newVariants.map(v => ({
          produto_id: produto.id,
          tamanho: v.tamanho || null,
          cor: v.cor || null,
          estoque: v.estoque,
          preco_custo: v.preco_custo,
          preco_venda: v.preco_venda,
        }))
        await supabase.from("variantes").insert(variantesData)
      }

      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Erro ao atualizar produto')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Editar Produto</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Nome do produto *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
            />
          </div>

          {/* Categoria e Preço */}
          <div className="grid grid-cols-2 gap-4">
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
                Preço de venda *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                required
              />
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-secondary text-[#00d4ff] focus:ring-[#00d4ff]"
            />
            <label htmlFor="ativo" className="text-sm text-foreground">
              Produto ativo (visível no catálogo)
            </label>
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Imagens do produto
            </label>
            <div className="flex flex-wrap gap-3">
              {imagens.map((img, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                  <Image
                    src={img}
                    alt={`Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-[#00d4ff] text-black px-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
              
              {/* Upload button */}
              <label className="w-24 h-24 flex flex-col items-center justify-center bg-secondary border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#00d4ff] transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-[#00d4ff]" />
                    <span className="text-[10px] text-muted-foreground mt-1">Adicionar</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-muted-foreground">Variantes</label>
              <button
                type="button"
                onClick={handleAddVariante}
                className="text-sm text-[#00d4ff] hover:text-[#00a3cc] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar variante
              </button>
            </div>

            <div className="space-y-4">
              {variantes.map((variante, index) => (
                <div key={variante.id} className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Variante {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariante(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Tamanho (ex: M, G, 42)"
                      value={variante.tamanho || ""}
                      onChange={(e) => handleVarianteChange(index, "tamanho", e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Cor (ex: Preto, Azul)"
                      value={variante.cor || ""}
                      onChange={(e) => handleVarianteChange(index, "cor", e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Estoque</label>
                      <input
                        type="number"
                        min="0"
                        value={variante.estoque}
                        onChange={(e) => handleVarianteChange(index, "estoque", parseInt(e.target.value) || 0)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Preço custo</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variante.preco_custo}
                        onChange={(e) => handleVarianteChange(index, "preco_custo", parseFloat(e.target.value) || 0)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Preço venda</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variante.preco_venda}
                        onChange={(e) => handleVarianteChange(index, "preco_venda", parseFloat(e.target.value) || 0)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
