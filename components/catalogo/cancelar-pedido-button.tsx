"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface CancelarPedidoButtonProps {
  pedidoId: string
  pedidoCodigo: string
  status: string
}

const motivosComuns = [
  "Desisti da compra",
  "Encontrei mais barato em outro lugar",
  "Comprei errado",
  "Demora na entrega",
  "Problemas financeiros",
  "Outro motivo"
]

export function CancelarPedidoButton({ pedidoId, pedidoCodigo, status }: CancelarPedidoButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [motivoSelecionado, setMotivoSelecionado] = useState("")
  const [mostrarOutro, setMostrarOutro] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Só pode cancelar pedidos que ainda não foram finalizados/entregues/cancelados
  const statusQuePodemCancelar = ["aguardando", "confirmado", "preparando"]
  const podeCancelar = statusQuePodemCancelar.includes(status)

  if (!podeCancelar) {
    return null
  }

  const handleSelecionarMotivo = (m: string) => {
    setMotivoSelecionado(m)
    if (m === "Outro motivo") {
      setMostrarOutro(true)
      setMotivo("")
    } else {
      setMostrarOutro(false)
      setMotivo(m)
    }
  }

  const handleCancelar = async () => {
    const motivoFinal = mostrarOutro ? motivo : motivoSelecionado

    if (!motivoFinal.trim()) {
      setError("Por favor, informe o motivo do cancelamento")
      return
    }

    if (motivoFinal.trim().length < 5) {
      setError("O motivo deve ter pelo menos 5 caracteres")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: updateData, error: updateError } = await supabase
        .from("pedidos")
        .update({ 
          status: "cancelado",
          motivo_cancelamento: motivoFinal.trim(),
          cancelado_por: "cliente",
          data_cancelamento: new Date().toISOString()
        })
        .eq("id", pedidoId)
        .select()

      if (updateError) {
        throw updateError
      }

      if (!updateData || updateData.length === 0) {
        throw new Error("Não foi possível cancelar o pedido. Tente novamente.")
      }

      // Criar notificação para o admin
      await supabase
        .from("notificacoes")
        .insert({
          tipo: "pedido_cancelado",
          titulo: `Pedido #${pedidoCodigo} Cancelado pelo Cliente`,
          mensagem: `Motivo: ${motivoFinal.trim()}`,
          link: "/admin/pedidos",
          dados: { pedido_id: pedidoId, codigo: pedidoCodigo, motivo: motivoFinal.trim() }
        })

      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao cancelar pedido"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fecharModal = () => {
    setShowModal(false)
    setMotivo("")
    setMotivoSelecionado("")
    setMostrarOutro(false)
    setError(null)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 text-destructive hover:text-destructive/80 text-sm transition-colors"
      >
        <X className="w-4 h-4" />
        Cancelar pedido
      </button>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Pedido Cancelado</h2>
                <p className="text-muted-foreground">O pedido #{pedidoCodigo} foi cancelado com sucesso.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Cancelar Pedido</h2>
                    <p className="text-sm text-muted-foreground">Pedido #{pedidoCodigo}</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  Por favor, selecione o motivo do cancelamento:
                </p>

                {/* Opções de motivo */}
                <div className="space-y-2 mb-4">
                  {motivosComuns.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelecionarMotivo(m)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        motivoSelecionado === m 
                          ? "border-[#00d4ff] bg-[#00d4ff]/10 text-foreground" 
                          : "border-border bg-secondary hover:bg-secondary/80 text-muted-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Campo de texto para "Outro motivo" */}
                {mostrarOutro && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Descreva o motivo:
                    </label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Digite o motivo do cancelamento..."
                      rows={3}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={fecharModal}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={loading || (!motivoSelecionado && !motivo.trim())}
                    className="flex-1 py-3 px-4 bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Confirmar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
