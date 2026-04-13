"use client"

import { useState, useEffect } from "react"
import { 
  Store, Bell, Shield, Save, Loader2, MapPin, Clock, 
  Truck, CreditCard, Power, Instagram, Phone,
  Mail, CheckCircle, AlertTriangle, Gift, Tag, Percent,
  Calendar, AlertCircle, Palmtree, MessageSquare, Eye,
  RefreshCw, FileText, Settings, Megaphone, Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Configuracoes {
  id: string
  // Basico
  nome_loja: string
  slogan: string
  whatsapp: string
  instagram: string
  email: string
  // Endereco
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  // Horarios
  horario_seg_sex_abertura: string
  horario_seg_sex_fechamento: string
  horario_sab_abertura: string
  horario_sab_fechamento: string
  horario_dom_abertura: string
  horario_dom_fechamento: string
  // Entrega
  taxa_entrega: number
  frete_gratis_acima: number
  tempo_entrega_min: number
  tempo_entrega_max: number
  pedido_minimo: number
  aceita_retirada: boolean
  aceita_entrega: boolean
  // Pagamentos
  aceita_pix: boolean
  aceita_dinheiro: boolean
  aceita_cartao: boolean
  chave_pix: string
  // Notificacoes
  alerta_novo_pedido: boolean
  alerta_estoque_baixo: boolean
  estoque_minimo_alerta: number
  // Status
  loja_aberta: boolean
  mensagem_fechada: string
  // Ferias
  modo_ferias: boolean
  msg_ferias: string
  data_volta_ferias: string | null
  // Feriado
  feriado_ativo: boolean
  msg_feriado: string
  data_feriado: string | null
  // Promocao
  promocao_ativa: boolean
  titulo_promocao: string
  descricao_promocao: string
  desconto_promocao: number
  data_inicio_promocao: string | null
  data_fim_promocao: string | null
  // Aviso
  aviso_ativo: boolean
  msg_aviso: string
  cor_aviso: string
  // Cupom
  cupom_ativo: boolean
  codigo_cupom: string
  desconto_cupom: number
  tipo_desconto_cupom: string
  // Exibicao
  mostrar_estoque: boolean
  mostrar_vendidos: boolean
  produtos_por_pagina: number
  // Politicas
  politica_troca: string
  sobre_loja: string
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [activeTab, setActiveTab] = useState("geral")
  
  const supabase = createClient()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("*")
      .single()
    
    if (error) {
      console.error("Erro ao carregar configuracoes:", error)
      setError("Erro ao carregar configuracoes")
    } else {
      setConfig(data)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!config) return
    
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from("configuracoes")
      .update({
        ...config,
        updated_at: new Date().toISOString()
      })
      .eq("id", config.id)

    if (error) {
      console.error("Erro ao salvar:", error)
      setError("Erro ao salvar configuracoes")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const updateConfig = (field: keyof Configuracoes, value: string | number | boolean | null) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Erro ao carregar configuracoes</p>
      </div>
    )
  }

  const tabs = [
    { id: "geral", label: "Geral", icon: Store },
    { id: "horarios", label: "Horarios", icon: Clock },
    { id: "entrega", label: "Entrega", icon: Truck },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { id: "promocoes", label: "Promocoes", icon: Tag },
    { id: "avisos", label: "Avisos", icon: Megaphone },
    { id: "exibicao", label: "Exibicao", icon: Eye },
    { id: "politicas", label: "Politicas", icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">CONFIGURACOES</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as configuracoes da sua loja
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status da Loja */}
          <button
            onClick={() => updateConfig("loja_aberta", !config.loja_aberta)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              config.loja_aberta 
                ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            <Power className="w-4 h-4" />
            {config.loja_aberta ? "Loja Aberta" : "Loja Fechada"}
          </button>

          {/* Botao Salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {config.modo_ferias && (
          <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
            <Palmtree className="w-3 h-3" /> Modo Ferias Ativo
          </span>
        )}
        {config.feriado_ativo && (
          <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
            <Calendar className="w-3 h-3" /> Feriado Ativo
          </span>
        )}
        {config.promocao_ativa && (
          <span className="flex items-center gap-1 bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-sm">
            <Sparkles className="w-3 h-3" /> Promocao Ativa
          </span>
        )}
        {config.cupom_ativo && (
          <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
            <Percent className="w-3 h-3" /> Cupom Ativo
          </span>
        )}
        {config.aviso_ativo && (
          <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="w-3 h-3" /> Aviso Ativo
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#00d4ff] text-black"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid gap-6">
        {/* GERAL */}
        {activeTab === "geral" && (
          <>
            {/* Informacoes da Loja */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Informacoes da Loja</h2>
                  <p className="text-sm text-muted-foreground">Dados basicos que aparecem no site</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome da Loja
                  </label>
                  <input
                    type="text"
                    value={config.nome_loja}
                    onChange={(e) => updateConfig("nome_loja", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={config.slogan}
                    onChange={(e) => updateConfig("slogan", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp da Loja
                  </label>
                  <input
                    type="text"
                    value={config.whatsapp}
                    onChange={(e) => updateConfig("whatsapp", e.target.value)}
                    placeholder="11999999999"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Instagram className="w-4 h-4" />
                    Instagram (sem @)
                  </label>
                  <input
                    type="text"
                    value={config.instagram}
                    onChange={(e) => updateConfig("instagram", e.target.value)}
                    placeholder="p.a__storee"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Mail className="w-4 h-4" />
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => updateConfig("email", e.target.value)}
                    placeholder="contato@pastore.com"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
              </div>
            </div>

            {/* Endereco */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#00ff88]/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Endereco da Loja</h2>
                  <p className="text-sm text-muted-foreground">Localizacao que aparece no footer</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Endereco (Rua/Avenida e numero)
                  </label>
                  <input
                    type="text"
                    value={config.endereco}
                    onChange={(e) => updateConfig("endereco", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Bairro</label>
                  <input
                    type="text"
                    value={config.bairro}
                    onChange={(e) => updateConfig("bairro", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">CEP</label>
                  <input
                    type="text"
                    value={config.cep}
                    onChange={(e) => updateConfig("cep", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Cidade</label>
                  <input
                    type="text"
                    value={config.cidade}
                    onChange={(e) => updateConfig("cidade", e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Estado</label>
                  <input
                    type="text"
                    value={config.estado}
                    onChange={(e) => updateConfig("estado", e.target.value)}
                    maxLength={2}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
              </div>
            </div>

            {/* Notificacoes */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Notificacoes</h2>
                  <p className="text-sm text-muted-foreground">Configure alertas e avisos</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Alerta de novo pedido</p>
                    <p className="text-sm text-muted-foreground">Tocar som quando chegar pedido</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.alerta_novo_pedido}
                    onChange={(e) => updateConfig("alerta_novo_pedido", e.target.checked)}
                    className="w-5 h-5 accent-[#00d4ff]" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Alerta de estoque baixo</p>
                    <p className="text-sm text-muted-foreground">Notificar quando estoque menor que o limite</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.alerta_estoque_baixo}
                    onChange={(e) => updateConfig("alerta_estoque_baixo", e.target.checked)}
                    className="w-5 h-5 accent-[#00d4ff]" 
                  />
                </label>

                {config.alerta_estoque_baixo && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Limite minimo de estoque
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={config.estoque_minimo_alerta}
                      onChange={(e) => updateConfig("estoque_minimo_alerta", parseInt(e.target.value) || 3)}
                      className="w-32 bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* HORARIOS */}
        {activeTab === "horarios" && (
          <>
            {/* Horarios normais */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Horarios de Funcionamento</h2>
                  <p className="text-sm text-muted-foreground">Define quando a loja aparece como aberta</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-foreground font-medium">Segunda a Sexta</span>
                  <input
                    type="time"
                    value={config.horario_seg_sex_abertura}
                    onChange={(e) => updateConfig("horario_seg_sex_abertura", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <input
                    type="time"
                    value={config.horario_seg_sex_fechamento}
                    onChange={(e) => updateConfig("horario_seg_sex_fechamento", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-foreground font-medium">Sabado</span>
                  <input
                    type="time"
                    value={config.horario_sab_abertura}
                    onChange={(e) => updateConfig("horario_sab_abertura", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <input
                    type="time"
                    value={config.horario_sab_fechamento}
                    onChange={(e) => updateConfig("horario_sab_fechamento", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-foreground font-medium">Domingo</span>
                  <input
                    type="time"
                    value={config.horario_dom_abertura}
                    onChange={(e) => updateConfig("horario_dom_abertura", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <input
                    type="time"
                    value={config.horario_dom_fechamento}
                    onChange={(e) => updateConfig("horario_dom_fechamento", e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
              </div>
            </div>

            {/* Modo Ferias */}
            <div className="bg-card border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Palmtree className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Modo Ferias</h2>
                    <p className="text-sm text-muted-foreground">Feche a loja temporariamente</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.modo_ferias}
                    onChange={(e) => updateConfig("modo_ferias", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {config.modo_ferias && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Mensagem para clientes
                    </label>
                    <textarea
                      value={config.msg_ferias}
                      onChange={(e) => updateConfig("msg_ferias", e.target.value)}
                      rows={2}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Data de retorno (opcional)
                    </label>
                    <input
                      type="date"
                      value={config.data_volta_ferias || ""}
                      onChange={(e) => updateConfig("data_volta_ferias", e.target.value || null)}
                      className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Feriado */}
            <div className="bg-card border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Feriado</h2>
                    <p className="text-sm text-muted-foreground">Marque um dia especifico como fechado</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.feriado_ativo}
                    onChange={(e) => updateConfig("feriado_ativo", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {config.feriado_ativo && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Data do feriado
                    </label>
                    <input
                      type="date"
                      value={config.data_feriado || ""}
                      onChange={(e) => updateConfig("data_feriado", e.target.value || null)}
                      className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Mensagem do feriado
                    </label>
                    <input
                      type="text"
                      value={config.msg_feriado}
                      onChange={(e) => updateConfig("msg_feriado", e.target.value)}
                      placeholder="Hoje e feriado! Estamos fechados."
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ENTREGA */}
        {activeTab === "entrega" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Opcoes de Entrega</h2>
                <p className="text-sm text-muted-foreground">Configure como os clientes recebem os pedidos</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tipos de entrega */}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Aceita Entrega</p>
                    <p className="text-sm text-muted-foreground">Entregar no endereco do cliente</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.aceita_entrega}
                    onChange={(e) => updateConfig("aceita_entrega", e.target.checked)}
                    className="w-5 h-5 accent-[#00d4ff]" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Aceita Retirada</p>
                    <p className="text-sm text-muted-foreground">Cliente retira na loja</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.aceita_retirada}
                    onChange={(e) => updateConfig("aceita_retirada", e.target.checked)}
                    className="w-5 h-5 accent-[#00d4ff]" 
                  />
                </label>
              </div>

              {/* Taxas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Taxa de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={config.taxa_entrega}
                    onChange={(e) => updateConfig("taxa_entrega", parseFloat(e.target.value) || 0)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = entrega gratis</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Frete Gratis Acima de (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={config.frete_gratis_acima}
                    onChange={(e) => updateConfig("frete_gratis_acima", parseFloat(e.target.value) || 0)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = sem frete gratis</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Pedido Minimo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={config.pedido_minimo}
                    onChange={(e) => updateConfig("pedido_minimo", parseFloat(e.target.value) || 0)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = sem minimo</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Tempo de Entrega
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={config.tempo_entrega_min}
                      onChange={(e) => updateConfig("tempo_entrega_min", parseInt(e.target.value) || 0)}
                      className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    />
                    <span className="text-muted-foreground">a</span>
                    <input
                      type="number"
                      min="0"
                      value={config.tempo_entrega_max}
                      onChange={(e) => updateConfig("tempo_entrega_max", parseInt(e.target.value) || 0)}
                      className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    />
                    <span className="text-muted-foreground">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGAMENTOS */}
        {activeTab === "pagamentos" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Formas de Pagamento</h2>
                <p className="text-sm text-muted-foreground">Habilite as formas de pagamento aceitas</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">PIX</p>
                  <p className="text-sm text-muted-foreground">Pagamento instantaneo</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.aceita_pix}
                  onChange={(e) => updateConfig("aceita_pix", e.target.checked)}
                  className="w-5 h-5 accent-[#00d4ff]" 
                />
              </label>
              
              {config.aceita_pix && (
                <div className="ml-4">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Chave PIX (aparece para o cliente copiar)
                  </label>
                  <input
                    type="text"
                    value={config.chave_pix}
                    onChange={(e) => updateConfig("chave_pix", e.target.value)}
                    placeholder="Sua chave PIX"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                  />
                </div>
              )}

              <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Dinheiro</p>
                  <p className="text-sm text-muted-foreground">Pagamento na entrega/retirada</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.aceita_dinheiro}
                  onChange={(e) => updateConfig("aceita_dinheiro", e.target.checked)}
                  className="w-5 h-5 accent-[#00d4ff]" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Cartao</p>
                  <p className="text-sm text-muted-foreground">Credito ou debito na entrega</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.aceita_cartao}
                  onChange={(e) => updateConfig("aceita_cartao", e.target.checked)}
                  className="w-5 h-5 accent-[#00d4ff]" 
                />
              </label>
            </div>
          </div>
        )}

        {/* PROMOCOES */}
        {activeTab === "promocoes" && (
          <>
            {/* Promocao Geral */}
            <div className="bg-card border border-pink-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Promocao Geral</h2>
                    <p className="text-sm text-muted-foreground">Banner e desconto em toda loja</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.promocao_ativa}
                    onChange={(e) => updateConfig("promocao_ativa", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {config.promocao_ativa && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Titulo da Promocao
                      </label>
                      <input
                        type="text"
                        value={config.titulo_promocao}
                        onChange={(e) => updateConfig("titulo_promocao", e.target.value)}
                        placeholder="MEGA PROMOCAO"
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Desconto (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.desconto_promocao}
                        onChange={(e) => updateConfig("desconto_promocao", parseInt(e.target.value) || 0)}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Descricao
                    </label>
                    <textarea
                      value={config.descricao_promocao}
                      onChange={(e) => updateConfig("descricao_promocao", e.target.value)}
                      placeholder="Descricao da promocao..."
                      rows={2}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Data Inicio
                      </label>
                      <input
                        type="date"
                        value={config.data_inicio_promocao || ""}
                        onChange={(e) => updateConfig("data_inicio_promocao", e.target.value || null)}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Data Fim
                      </label>
                      <input
                        type="date"
                        value={config.data_fim_promocao || ""}
                        onChange={(e) => updateConfig("data_fim_promocao", e.target.value || null)}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cupom de Desconto */}
            <div className="bg-card border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Percent className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Cupom de Desconto</h2>
                    <p className="text-sm text-muted-foreground">Codigo para clientes usarem no checkout</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cupom_ativo}
                    onChange={(e) => updateConfig("cupom_ativo", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {config.cupom_ativo && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Codigo do Cupom
                    </label>
                    <input
                      type="text"
                      value={config.codigo_cupom}
                      onChange={(e) => updateConfig("codigo_cupom", e.target.value.toUpperCase())}
                      placeholder="PROMO10"
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Tipo de Desconto
                    </label>
                    <select
                      value={config.tipo_desconto_cupom}
                      onChange={(e) => updateConfig("tipo_desconto_cupom", e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="percentual">Percentual (%)</option>
                      <option value="fixo">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Valor do Desconto
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={config.desconto_cupom}
                      onChange={(e) => updateConfig("desconto_cupom", parseInt(e.target.value) || 0)}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* AVISOS */}
        {activeTab === "avisos" && (
          <>
            {/* Aviso no Topo */}
            <div className="bg-card border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Aviso no Topo do Site</h2>
                    <p className="text-sm text-muted-foreground">Mensagem destacada para todos os clientes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.aviso_ativo}
                    onChange={(e) => updateConfig("aviso_ativo", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-yellow-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {config.aviso_ativo && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Mensagem do Aviso
                    </label>
                    <input
                      type="text"
                      value={config.msg_aviso}
                      onChange={(e) => updateConfig("msg_aviso", e.target.value)}
                      placeholder="Frete gratis para todo o bairro!"
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Cor do Aviso
                    </label>
                    <div className="flex gap-2">
                      {["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"].map((cor) => (
                        <button
                          key={cor}
                          onClick={() => updateConfig("cor_aviso", cor)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            config.cor_aviso === cor ? "border-white" : "border-transparent"
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Preview */}
                  <div 
                    className="p-3 rounded-lg text-center text-white font-medium"
                    style={{ backgroundColor: config.cor_aviso }}
                  >
                    {config.msg_aviso || "Preview do aviso"}
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem Loja Fechada */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Power className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Mensagem de Loja Fechada</h2>
                  <p className="text-sm text-muted-foreground">Aparece quando a loja esta offline</p>
                </div>
              </div>

              <textarea
                value={config.mensagem_fechada}
                onChange={(e) => updateConfig("mensagem_fechada", e.target.value)}
                placeholder="Estamos fechados no momento. Volte em breve!"
                rows={3}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />
            </div>
          </>
        )}

        {/* EXIBICAO */}
        {activeTab === "exibicao" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Opcoes de Exibicao</h2>
                <p className="text-sm text-muted-foreground">Configure o que aparece no catalogo</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Mostrar Estoque</p>
                  <p className="text-sm text-muted-foreground">Exibir quantidade disponivel nos produtos</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.mostrar_estoque}
                  onChange={(e) => updateConfig("mostrar_estoque", e.target.checked)}
                  className="w-5 h-5 accent-[#00d4ff]" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Mostrar Vendidos</p>
                  <p className="text-sm text-muted-foreground">Exibir quantidade de vendas de cada produto</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.mostrar_vendidos}
                  onChange={(e) => updateConfig("mostrar_vendidos", e.target.checked)}
                  className="w-5 h-5 accent-[#00d4ff]" 
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Produtos por Pagina
                </label>
                <select
                  value={config.produtos_por_pagina}
                  onChange={(e) => updateConfig("produtos_por_pagina", parseInt(e.target.value))}
                  className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                >
                  <option value={8}>8 produtos</option>
                  <option value={12}>12 produtos</option>
                  <option value={16}>16 produtos</option>
                  <option value={24}>24 produtos</option>
                  <option value={32}>32 produtos</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* POLITICAS */}
        {activeTab === "politicas" && (
          <>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Politica de Trocas e Devolucoes</h2>
                  <p className="text-sm text-muted-foreground">Informacoes sobre trocas para os clientes</p>
                </div>
              </div>

              <textarea
                value={config.politica_troca}
                onChange={(e) => updateConfig("politica_troca", e.target.value)}
                placeholder="Aceitamos trocas em ate 7 dias apos a compra..."
                rows={4}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Sobre a Loja</h2>
                  <p className="text-sm text-muted-foreground">Descricao que aparece no rodape e pagina sobre</p>
                </div>
              </div>

              <textarea
                value={config.sobre_loja}
                onChange={(e) => updateConfig("sobre_loja", e.target.value)}
                placeholder="Conte a historia da sua loja..."
                rows={4}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />
            </div>
          </>
        )}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black px-6 py-3 rounded-full font-medium shadow-lg shadow-[#00d4ff]/30 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saved ? "Salvo!" : "Salvar Alteracoes"}
        </button>
      </div>
    </div>
  )
}
