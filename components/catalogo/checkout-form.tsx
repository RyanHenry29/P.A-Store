"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "./cart-context"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Send, Truck, Store, Banknote, QrCode, CreditCard, MapPin, Phone, Tag, Check } from "lucide-react"

interface EnderecoData {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

interface CheckoutFormProps {
  onCupomChange?: (cupom: {codigo: string, desconto: number, tipo: string} | null) => void
}

export function CheckoutForm({ onCupomChange }: CheckoutFormProps) {
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingEndereco, setLoadingEndereco] = useState(true)
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega")
  const [formaPagamento, setFormaPagamento] = useState<"pix" | "dinheiro" | "cartao">("pix")
  const [whatsapp, setWhatsapp] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [cupom, setCupom] = useState("")
  const [cupomAplicado, setCupomAplicado] = useState<{codigo: string, desconto: number, tipo: string} | null>(null)
  const [validandoCupom, setValidandoCupom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [endereco, setEndereco] = useState<EnderecoData>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  })
  const [enderecoSalvo, setEnderecoSalvo] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Load saved address on mount
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingEndereco(false)
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("cep, endereco, numero, complemento, bairro, cidade, estado, telefone")
          .eq("id", user.id)
          .single()

        if (profile?.telefone) {
          setWhatsapp(profile.telefone)
        }

        if (profile && profile.cep) {
          setEndereco({
            cep: profile.cep || "",
            logradouro: profile.endereco || "",
            numero: profile.numero || "",
            complemento: profile.complemento || "",
            bairro: profile.bairro || "",
            cidade: profile.cidade || "",
            estado: profile.estado || ""
          })
          setEnderecoSalvo(true)
        }
      } catch (err) {
        // Ignore error, just use empty address
      } finally {
        setLoadingEndereco(false)
      }
    }

    loadSavedAddress()
  }, [supabase])

  // Auto-search CEP via ViaCEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "")
    if (cepLimpo.length !== 8) return

    setLoadingCep(true)
    setError(null)
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        setError("CEP não encontrado")
        return
      }

      setEndereco(prev => ({
        ...prev,
        cep: cepLimpo,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || ""
      }))
    } catch (err) {
      setError("Erro ao buscar CEP")
    } finally {
      setLoadingCep(false)
    }
  }

  // Format CEP as user types
  const handleCepChange = (value: string) => {
    const cepLimpo = value.replace(/\D/g, "")
    let cepFormatado = cepLimpo
    if (cepLimpo.length > 5) {
      cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`
    }
    setEndereco(prev => ({ ...prev, cep: cepFormatado }))
    
    // Auto-search when CEP is complete
    if (cepLimpo.length === 8) {
      buscarCep(cepLimpo)
    }
  }

  // Save address to profile
  const salvarEndereco = async (userId: string) => {
    try {
      await supabase
        .from("profiles")
        .update({
          cep: endereco.cep.replace(/\D/g, ""),
          endereco: endereco.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado
        })
        .eq("id", userId)

      setEnderecoSalvo(true)
    } catch (err) {
      // Ignore error, address save is optional
    }
  }

  // Validar cupom
  const validarCupom = async () => {
    if (!cupom.trim()) return

    setValidandoCupom(true)
    setError(null)

    try {
      const { data: config } = await supabase
        .from("configuracoes")
        .select("cupom_ativo, codigo_cupom, desconto_cupom, tipo_desconto_cupom")
        .single()

      if (!config?.cupom_ativo || !config?.codigo_cupom) {
        setError("Nenhum cupom disponível no momento")
        setValidandoCupom(false)
        return
      }

      if (cupom.toUpperCase() !== config.codigo_cupom.toUpperCase()) {
        setError("Cupom inválido")
        setValidandoCupom(false)
        return
      }

      const cupomData = {
        codigo: config.codigo_cupom,
        desconto: config.desconto_cupom,
        tipo: config.tipo_desconto_cupom || "percentual"
      }
      setCupomAplicado(cupomData)
      onCupomChange?.(cupomData)
      setCupom("")
    } catch (err) {
      setError("Erro ao validar cupom")
    } finally {
      setValidandoCupom(false)
    }
  }

  // Calcular desconto do cupom
  const calcularDesconto = () => {
    if (!cupomAplicado) return 0
    if (cupomAplicado.tipo === "percentual") {
      return total * (cupomAplicado.desconto / 100)
    }
    return cupomAplicado.desconto
  }

  const desconto = calcularDesconto()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      setError("Carrinho vazio")
      return
    }

    const whatsappLimpo = whatsapp.replace(/\D/g, "")
    if (!whatsappLimpo || whatsappLimpo.length < 10) {
      setError("Informe seu WhatsApp para contato sobre o pedido")
      return
    }

    if (tipoEntrega === "entrega" && (!endereco.logradouro || !endereco.numero)) {
      setError("Preencha o endereço completo para entrega")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login?redirect=/catalogo/carrinho")
        return
      }

      // Get user profile for client info
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome, telefone, email")
        .eq("id", user.id)
        .single()

      // Generate order code
      const codigo = `PA${String(Date.now()).slice(-6)}`

      // Calculate values
      const taxaEntrega = tipoEntrega === "entrega" ? 10 : 0
      const subtotal = total
      const descontoAplicado = desconto
      const totalFinal = subtotal + taxaEntrega - descontoAplicado
      const lucro = (subtotal - descontoAplicado) * 0.3

      // Build full address string
      const enderecoCompleto = tipoEntrega === "entrega" 
        ? `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ` - ${endereco.complemento}` : ""}, ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`
        : null

      // Format and save WhatsApp to profile
      const whatsappFormatado = whatsappLimpo
      await supabase
        .from("profiles")
        .update({ telefone: whatsappFormatado })
        .eq("id", user.id)

      // Create order
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          codigo,
          user_id: user.id,
          cliente_nome: profile?.nome || user.email?.split('@')[0] || 'Cliente',
          cliente_telefone: whatsappFormatado,
          cliente_email: profile?.email || user.email || null,
          cupom_usado: cupomAplicado?.codigo || null,
          desconto_cupom: descontoAplicado,
          status: "aguardando",
          subtotal: subtotal,
          taxa_entrega: taxaEntrega,
          total: totalFinal,
          lucro: lucro,
          tipo_entrega: tipoEntrega,
          endereco_entrega: enderecoCompleto,
          forma_pagamento: formaPagamento,
          observacoes: observacoes || null,
        })
        .select()
        .single()

      if (pedidoError) {
        setError(`Erro ao criar pedido: ${pedidoError.message}`)
        setLoading(false)
        return
      }

      // Create order items with produto_nome and total
      const pedidoItens = items.map((item) => ({
        pedido_id: pedido.id,
        variante_id: item.varianteId,
        produto_nome: item.produtoNome,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        total: item.preco * item.quantidade,
      }))

      const { error: itensError } = await supabase
        .from("pedido_itens")
        .insert(pedidoItens)

      if (itensError) {
        setError(`Erro ao adicionar itens: ${itensError.message}`)
        setLoading(false)
        return
      }

      // Save address if delivery and not already saved
      if (tipoEntrega === "entrega" && !enderecoSalvo) {
        await salvarEndereco(user.id)
      }

      // Clear cart and show success
      clearCart()
      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/catalogo/pedido-confirmado?codigo=${codigo}`)
      }, 2000)

    } catch (err) {
      setError("Erro ao finalizar pedido. Tente novamente.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-[#00ff88]" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Pedido realizado!</h3>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    )
  }

  // Format WhatsApp as user types
  const handleWhatsappChange = (value: string) => {
    const digits = value.replace(/\D/g, "")
    let formatted = digits
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}`
      if (digits.length > 7) {
        formatted += `-${digits.slice(7, 11)}`
      }
    }
    setWhatsapp(formatted)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* WhatsApp - Required */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Phone className="w-4 h-4 text-[#25D366]" />
          WhatsApp para contato *
        </label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => handleWhatsappChange(e.target.value)}
          placeholder="(11) 99999-9999"
          maxLength={15}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Entraremos em contato por aqui sobre seu pedido
        </p>
      </div>

      {/* Delivery Type */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Tipo de entrega
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipoEntrega("entrega")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              tipoEntrega === "entrega"
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border hover:border-[#00d4ff]/50"
            }`}
          >
            <Truck className={`w-6 h-6 ${tipoEntrega === "entrega" ? "text-[#00d4ff]" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${tipoEntrega === "entrega" ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
              Entrega
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTipoEntrega("retirada")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              tipoEntrega === "retirada"
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border hover:border-[#00d4ff]/50"
            }`}
          >
            <Store className={`w-6 h-6 ${tipoEntrega === "retirada" ? "text-[#00d4ff]" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${tipoEntrega === "retirada" ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
              Retirada
            </span>
          </button>
        </div>
      </div>

      {/* Address Fields - Only show for delivery */}
      {tipoEntrega === "entrega" && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="w-4 h-4" />
            Endereço de entrega
          </label>
          
          {loadingEndereco ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* CEP */}
              <div className="relative">
                <input
                  type="text"
                  value={endereco.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="CEP (digite para buscar)"
                  maxLength={9}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" />
                  </div>
                )}
              </div>

              {/* Street */}
              <input
                type="text"
                value={endereco.logradouro}
                onChange={(e) => setEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                placeholder="Rua/Avenida"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />

              {/* Number and Complement */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={endereco.numero}
                  onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                  placeholder="Número *"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
                <input
                  type="text"
                  value={endereco.complemento}
                  onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                  placeholder="Complemento"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
              </div>

              {/* Neighborhood */}
              <input
                type="text"
                value={endereco.bairro}
                onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                placeholder="Bairro"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />

              {/* City and State */}
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={endereco.cidade}
                  onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Cidade"
                  className="col-span-2 w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                />
                <input
                  type="text"
                  value={endereco.estado}
                  onChange={(e) => setEndereco(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                  placeholder="UF"
                  maxLength={2}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] uppercase"
                />
              </div>

              {enderecoSalvo && (
                <p className="text-xs text-[#00ff88] flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>
                  Endereço salvo para próximas compras
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Forma de pagamento
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormaPagamento("pix")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              formaPagamento === "pix"
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border hover:border-[#00d4ff]/50"
            }`}
          >
            <QrCode className={`w-6 h-6 ${formaPagamento === "pix" ? "text-[#00d4ff]" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${formaPagamento === "pix" ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
              PIX
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFormaPagamento("dinheiro")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              formaPagamento === "dinheiro"
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border hover:border-[#00d4ff]/50"
            }`}
          >
            <Banknote className={`w-6 h-6 ${formaPagamento === "dinheiro" ? "text-[#00d4ff]" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${formaPagamento === "dinheiro" ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
              Dinheiro
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFormaPagamento("cartao")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              formaPagamento === "cartao"
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border hover:border-[#00d4ff]/50"
            }`}
          >
            <CreditCard className={`w-6 h-6 ${formaPagamento === "cartao" ? "text-[#00d4ff]" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${formaPagamento === "cartao" ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
              Cartão
            </span>
          </button>
        </div>
      </div>

      {/* Cupom de Desconto */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Tag className="w-4 h-4" />
          Cupom de desconto (opcional)
        </label>
        {cupomAplicado ? (
          <div className="flex items-center justify-between bg-[#00ff88]/10 border border-[#00ff88] rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#00ff88]" />
              <span className="text-[#00ff88] font-medium">
                {cupomAplicado.codigo} - {cupomAplicado.tipo === "percentual" 
                  ? `${cupomAplicado.desconto}% OFF` 
                  : `R$ ${cupomAplicado.desconto.toFixed(2)} OFF`
                }
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setCupomAplicado(null); onCupomChange?.(null) }}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Remover
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              placeholder="Digite o código do cupom"
              className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] uppercase"
            />
            <button
              type="button"
              onClick={validarCupom}
              disabled={validandoCupom || !cupom.trim()}
              className="px-4 py-3 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validandoCupom ? <Loader2 className="w-5 h-5 animate-spin" /> : "Aplicar"}
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma observação sobre o pedido?"
          rows={2}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            Finalizar pedido
          </>
        )}
      </button>
    </form>
  )
}
