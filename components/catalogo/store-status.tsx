"use client"

import { useEffect, useState } from "react"
import { Clock, Umbrella, Calendar, AlertTriangle } from "lucide-react"
import type { Configuracoes } from "@/lib/configuracoes"

interface StoreStatusProps {
  config: Configuracoes
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours + (minutes || 0) / 60
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":")
  return `${hours}:${minutes || "00"}`
}

export function StoreStatus({ config }: StoreStatusProps) {
  const [status, setStatus] = useState<{ 
    isOpen: boolean
    message: string
    reason?: "ferias" | "feriado" | "fechado" | "horario"
  } | null>(null)

  useEffect(() => {
    const checkStatus = () => {
      // Verificar modo férias
      if (config.modo_ferias) {
        let msg = config.msg_ferias || "Estamos em recesso"
        if (config.data_volta_ferias) {
          const dataVolta = new Date(config.data_volta_ferias).toLocaleDateString("pt-BR")
          msg += ` - Voltamos em ${dataVolta}`
        }
        return { isOpen: false, message: msg, reason: "ferias" as const }
      }

      // Verificar feriado
      const hoje = new Date().toISOString().split('T')[0]
      if (config.feriado_ativo && config.data_feriado === hoje) {
        return { 
          isOpen: false, 
          message: config.msg_feriado || "Hoje é feriado",
          reason: "feriado" as const 
        }
      }

      // Verificar se loja está fechada manualmente
      if (!config.loja_aberta) {
        return { 
          isOpen: false, 
          message: config.mensagem_fechada || "Estamos fechados",
          reason: "fechado" as const 
        }
      }

      // Verificar horário
      const now = new Date()
      const brasiliaOffset = -3 * 60
      const localOffset = now.getTimezoneOffset()
      const brasiliaTime = new Date(now.getTime() + (localOffset + brasiliaOffset) * 60000)
      
      const dayOfWeek = brasiliaTime.getDay()
      const currentHour = brasiliaTime.getHours()
      const currentMinute = brasiliaTime.getMinutes()
      const currentTime = currentHour + currentMinute / 60

      // Pegar horários do config
      let openTime: number, closeTime: number, openStr: string, closeStr: string

      if (dayOfWeek === 0) {
        // Domingo
        openStr = config.horario_dom_abertura || "09:00"
        closeStr = config.horario_dom_fechamento || "14:00"
      } else if (dayOfWeek === 6) {
        // Sábado
        openStr = config.horario_sab_abertura || "09:00"
        closeStr = config.horario_sab_fechamento || "20:00"
      } else {
        // Segunda a Sexta
        openStr = config.horario_seg_sex_abertura || "09:00"
        closeStr = config.horario_seg_sex_fechamento || "20:00"
      }

      openTime = parseTime(openStr)
      closeTime = parseTime(closeStr)

      if (currentTime >= openTime && currentTime < closeTime) {
        return {
          isOpen: true,
          message: `Aberto até ${formatTime(closeStr)}`,
          reason: "horario" as const
        }
      }

      // Calcular próxima abertura
      if (currentTime >= closeTime) {
        // Já fechou, verificar amanhã
        const nextDay = (dayOfWeek + 1) % 7
        let nextOpenStr: string
        if (nextDay === 0) {
          nextOpenStr = config.horario_dom_abertura || "09:00"
        } else if (nextDay === 6) {
          nextOpenStr = config.horario_sab_abertura || "09:00"
        } else {
          nextOpenStr = config.horario_seg_sex_abertura || "09:00"
        }
        return {
          isOpen: false,
          message: `Abre amanhã às ${formatTime(nextOpenStr)}`,
          reason: "horario" as const
        }
      } else {
        // Ainda não abriu hoje
        return {
          isOpen: false,
          message: `Abre hoje às ${formatTime(openStr)}`,
          reason: "horario" as const
        }
      }
    }

    setStatus(checkStatus())
    
    const interval = setInterval(() => {
      setStatus(checkStatus())
    }, 60000)

    return () => clearInterval(interval)
  }, [config])

  if (!status) return null

  const getIcon = () => {
    if (status.reason === "ferias") return <Umbrella className="w-3 h-3" />
    if (status.reason === "feriado") return <Calendar className="w-3 h-3" />
    if (status.reason === "fechado") return <AlertTriangle className="w-3 h-3" />
    return <Clock className="w-3 h-3 text-muted-foreground" />
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${status.isOpen ? "bg-[#00ff88] animate-pulse" : "bg-red-500"}`} />
      <span className={status.isOpen ? "text-[#00ff88]" : "text-red-400"}>
        {status.isOpen ? "Online" : "Offline"}
      </span>
      <span className="text-muted-foreground">•</span>
      {getIcon()}
      <span className="text-muted-foreground">{status.message}</span>
    </div>
  )
}

interface StoreHoursInfoProps {
  config: Configuracoes
}

export function StoreHoursInfo({ config }: StoreHoursInfoProps) {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Horario de Funcionamento</p>
      <p>Segunda a Sexta: {config.horario_seg_sex_abertura || "09:00"} - {config.horario_seg_sex_fechamento || "20:00"}</p>
      <p>Sabado: {config.horario_sab_abertura || "09:00"} - {config.horario_sab_fechamento || "20:00"}</p>
      <p>Domingo: {config.horario_dom_abertura || "09:00"} - {config.horario_dom_fechamento || "14:00"}</p>
    </div>
  )
}
