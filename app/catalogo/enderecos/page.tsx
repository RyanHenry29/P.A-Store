"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Trash2, Edit2, Save, Loader2, ArrowLeft, Home, Building } from "lucide-react"
import Link from "next/link"

interface Endereco {
  id: string
  tipo: "casa" | "trabalho" | "outro"
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  cep: string
  principal: boolean
}

export default function EnderecosPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  
  const [form, setForm] = useState({
    tipo: "casa" as "casa" | "trabalho" | "outro",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "Guarulhos",
    cep: "",
    principal: false,
  })

  useEffect(() => {
    const loadEnderecos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }

      // Carregar do localStorage por enquanto (pode migrar para banco depois)
      const saved = localStorage.getItem(`enderecos_${user.id}`)
      if (saved) {
        setEnderecos(JSON.parse(saved))
      }
      
      setLoading(false)
    }

    loadEnderecos()
  }, [supabase, router])

  const saveToStorage = async (newEnderecos: Endereco[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      localStorage.setItem(`enderecos_${user.id}`, JSON.stringify(newEnderecos))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const newEndereco: Endereco = {
      id: editingId || crypto.randomUUID(),
      ...form,
    }

    let newEnderecos: Endereco[]
    
    if (editingId) {
      newEnderecos = enderecos.map(e => e.id === editingId ? newEndereco : e)
    } else {
      newEnderecos = [...enderecos, newEndereco]
    }

    // Se marcou como principal, desmarcar os outros
    if (form.principal) {
      newEnderecos = newEnderecos.map(e => ({
        ...e,
        principal: e.id === newEndereco.id,
      }))
    }

    setEnderecos(newEnderecos)
    await saveToStorage(newEnderecos)
    
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const newEnderecos = enderecos.filter(e => e.id !== id)
    setEnderecos(newEnderecos)
    await saveToStorage(newEnderecos)
  }

  const handleEdit = (endereco: Endereco) => {
    setForm({
      tipo: endereco.tipo,
      rua: endereco.rua,
      numero: endereco.numero,
      complemento: endereco.complemento || "",
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      cep: endereco.cep,
      principal: endereco.principal,
    })
    setEditingId(endereco.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({
      tipo: "casa",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "Guarulhos",
      cep: "",
      principal: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/catalogo"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Endereços</h1>
            <p className="text-muted-foreground">Gerencie seus endereços de entrega</p>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-medium rounded-full text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Editar endereço" : "Novo endereço"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>

          {/* Tipo */}
          <div className="flex gap-2">
            {[
              { value: "casa", label: "Casa", icon: Home },
              { value: "trabalho", label: "Trabalho", icon: Building },
              { value: "outro", label: "Outro", icon: MapPin },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, tipo: value as typeof form.tipo })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                  form.tipo === value
                    ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* CEP e Rua */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              placeholder="CEP"
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
            <input
              type="text"
              value={form.rua}
              onChange={(e) => setForm({ ...form, rua: e.target.value })}
              placeholder="Rua"
              className="col-span-2 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              placeholder="Número"
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
            <input
              type="text"
              value={form.complemento}
              onChange={(e) => setForm({ ...form, complemento: e.target.value })}
              placeholder="Complemento"
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            />
          </div>

          {/* Bairro e Cidade */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              placeholder="Bairro"
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              placeholder="Cidade"
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              required
            />
          </div>

          {/* Principal */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.principal}
              onChange={(e) => setForm({ ...form, principal: e.target.checked })}
              className="w-5 h-5 rounded border-border bg-secondary text-[#00d4ff] focus:ring-[#00d4ff]"
            />
            <span className="text-sm text-muted-foreground">Definir como endereço principal</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {editingId ? "Salvar alterações" : "Adicionar endereço"}
              </>
            )}
          </button>
        </form>
      )}

      {/* Lista de endereços */}
      {enderecos.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Você ainda não tem endereços cadastrados</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-medium rounded-full text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar endereço
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {enderecos.map((endereco) => (
            <div
              key={endereco.id}
              className={`bg-card border rounded-xl p-4 ${
                endereco.principal ? "border-[#00d4ff]" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    endereco.principal ? "bg-[#00d4ff]/20 text-[#00d4ff]" : "bg-secondary text-muted-foreground"
                  }`}>
                    {endereco.tipo === "casa" ? (
                      <Home className="w-5 h-5" />
                    ) : endereco.tipo === "trabalho" ? (
                      <Building className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground capitalize">{endereco.tipo}</span>
                      {endereco.principal && (
                        <span className="text-xs bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {endereco.rua}, {endereco.numero}
                      {endereco.complemento && ` - ${endereco.complemento}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {endereco.bairro} - {endereco.cidade}
                    </p>
                    <p className="text-sm text-muted-foreground">CEP: {endereco.cep}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(endereco)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(endereco.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
