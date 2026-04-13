"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Bell, X, ShoppingBag, AlertTriangle, CheckCircle, Info, Trash2, UserPlus } from "lucide-react"

interface Notification {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  link: string | null
  created_at: string
}

const iconMap: Record<string, React.ReactNode> = {
  novo_pedido: <ShoppingBag className="w-4 h-4 text-[#00d4ff]" />,
  status_pedido: <CheckCircle className="w-4 h-4 text-[#00ff88]" />,
  estoque_baixo: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  novo_cliente: <UserPlus className="w-4 h-4 text-purple-500" />,
  pedido_cancelado: <X className="w-4 h-4 text-destructive" />,
  pedido: <ShoppingBag className="w-4 h-4 text-[#00d4ff]" />,
  estoque: <AlertTriangle className="w-4 h-4 text-[#ff9500]" />,
  sucesso: <CheckCircle className="w-4 h-4 text-[#00ff88]" />,
  info: <Info className="w-4 h-4 text-muted-foreground" />,
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.lida).length

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes'
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
        // Tocar som de notificação
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...")
          audio.volume = 0.3
          audio.play().catch(() => {})
        } catch (e) {}
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("notificacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
    
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id)
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    )
  }

  const markAllAsRead = async () => {
    await supabase.from("notificacoes").update({ lida: true }).eq("lida", false)
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from("notificacoes").delete().eq("id", id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.lida) {
      await markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
    setIsOpen(false)
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diff = now.getTime() - notifDate.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora"
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#00d4ff] hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.lida ? "bg-[#00d4ff]/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className="mt-0.5">
                      {iconMap[notification.tipo] || iconMap.info}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!notification.lida ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {notification.titulo}
                        </p>
                        {!notification.lida && (
                          <span className="w-2 h-2 bg-[#00d4ff] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.mensagem}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border text-center">
                <button
                  onClick={() => {
                    router.push("/admin/notificacoes")
                    setIsOpen(false)
                  }}
                  className="text-sm text-[#00d4ff] hover:underline"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
