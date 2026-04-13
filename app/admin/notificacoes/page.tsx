"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Bell, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  UserPlus,
  Trash2,
  Check,
  CheckCheck,
  RefreshCw
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  link: string | null
  lida: boolean
  dados: Record<string, unknown>
  created_at: string
}

const iconMap: Record<string, React.ReactNode> = {
  novo_pedido: <ShoppingBag className="w-5 h-5 text-[#00d4ff]" />,
  status_pedido: <CheckCircle className="w-5 h-5 text-[#00ff88]" />,
  estoque_baixo: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  novo_cliente: <UserPlus className="w-5 h-5 text-purple-500" />,
}

const bgColorMap: Record<string, string> = {
  novo_pedido: "bg-[#00d4ff]/10 border-[#00d4ff]/30",
  status_pedido: "bg-[#00ff88]/10 border-[#00ff88]/30",
  estoque_baixo: "bg-amber-500/10 border-amber-500/30",
  novo_cliente: "bg-purple-500/10 border-purple-500/30",
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"todas" | "nao_lidas" | "lidas">("todas")
  const supabase = createClient()

  const fetchNotificacoes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      setNotificacoes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotificacoes()

    // Realtime subscription
    const channel = supabase
      .channel("notificacoes-page")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notificacoes"
      }, (payload) => {
        setNotificacoes(prev => [payload.new as Notificacao, ...prev])
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notificacoes"
      }, (payload) => {
        setNotificacoes(prev => 
          prev.map(n => n.id === payload.new.id ? payload.new as Notificacao : n)
        )
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "notificacoes"
      }, (payload) => {
        setNotificacoes(prev => prev.filter(n => n.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const marcarComoLida = async (id: string) => {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id)
    
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    )
  }

  const marcarTodasComoLidas = async () => {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("lida", false)
    
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const deletarNotificacao = async (id: string) => {
    await supabase
      .from("notificacoes")
      .delete()
      .eq("id", id)
    
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }

  const deletarTodasLidas = async () => {
    await supabase
      .from("notificacoes")
      .delete()
      .eq("lida", true)
    
    setNotificacoes(prev => prev.filter(n => !n.lida))
  }

  const notificacoesFiltradas = notificacoes.filter(n => {
    if (filtro === "nao_lidas") return !n.lida
    if (filtro === "lidas") return n.lida
    return true
  })

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00d4ff]" />
            Notificações
            {naoLidas > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {naoLidas} nova{naoLidas > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe tudo que acontece na sua loja
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotificacoes}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {naoLidas > 0 && (
            <button
              onClick={marcarTodasComoLidas}
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-medium rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFiltro("todas")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === "todas" 
              ? "bg-[#00d4ff] text-black" 
              : "bg-secondary hover:bg-secondary/80 text-foreground"
          }`}
        >
          Todas ({notificacoes.length})
        </button>
        <button
          onClick={() => setFiltro("nao_lidas")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === "nao_lidas" 
              ? "bg-[#00d4ff] text-black" 
              : "bg-secondary hover:bg-secondary/80 text-foreground"
          }`}
        >
          Não lidas ({naoLidas})
        </button>
        <button
          onClick={() => setFiltro("lidas")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === "lidas" 
              ? "bg-[#00d4ff] text-black" 
              : "bg-secondary hover:bg-secondary/80 text-foreground"
          }`}
        >
          Lidas ({notificacoes.length - naoLidas})
        </button>

        {filtro === "lidas" && notificacoes.some(n => n.lida) && (
          <button
            onClick={deletarTodasLidas}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar lidas
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff]" />
        </div>
      ) : notificacoesFiltradas.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma notificação
          </h3>
          <p className="text-muted-foreground">
            {filtro === "nao_lidas" 
              ? "Você já viu todas as notificações!" 
              : filtro === "lidas"
              ? "Nenhuma notificação lida ainda"
              : "As notificações aparecerão aqui quando houver atividade na loja"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoesFiltradas.map((notificacao) => (
            <div
              key={notificacao.id}
              className={`
                relative bg-card border rounded-xl p-4 transition-all
                ${notificacao.lida 
                  ? "border-border opacity-70" 
                  : `${bgColorMap[notificacao.tipo] || "border-border"}`
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${notificacao.lida ? "bg-secondary" : "bg-secondary/50"}
                `}>
                  {iconMap[notificacao.tipo] || <Bell className="w-5 h-5 text-muted-foreground" />}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${notificacao.lida ? "text-muted-foreground" : "text-foreground"}`}>
                        {notificacao.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notificacao.mensagem}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notificacao.lida && (
                        <button
                          onClick={() => marcarComoLida(notificacao.id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4 text-[#00ff88]" />
                        </button>
                      )}
                      <button
                        onClick={() => deletarNotificacao(notificacao.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Link e Data */}
                  <div className="flex items-center justify-between mt-3">
                    {notificacao.link && (
                      <a
                        href={notificacao.link}
                        className="text-sm text-[#00d4ff] hover:underline"
                      >
                        Ver detalhes
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(notificacao.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>

                {/* Indicador de não lida */}
                {!notificacao.lida && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-[#00d4ff] rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
