"use client"

import { X, Tag, AlertTriangle, Umbrella, Calendar, Gift } from "lucide-react"
import { useState } from "react"
import type { Configuracoes } from "@/lib/configuracoes"

interface BannerAvisosProps {
  config: Configuracoes
}

export function BannerAvisos({ config }: BannerAvisosProps) {
  const [fechouAviso, setFechouAviso] = useState(false)
  const [fechouPromo, setFechouPromo] = useState(false)
  const [fechouFerias, setFechouFerias] = useState(false)
  const [fechouFeriado, setFechouFeriado] = useState(false)

  // Verificar se a promoção está válida
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataInicio = config.data_inicio_promocao ? new Date(config.data_inicio_promocao + "T00:00:00") : null
  const dataFim = config.data_fim_promocao ? new Date(config.data_fim_promocao + "T23:59:59") : null
  
  const promocaoValida = config.promocao_ativa && 
    config.titulo_promocao && // Precisa ter título
    (!dataInicio || dataInicio <= new Date()) &&
    (!dataFim || dataFim >= new Date())

  // Verificar se hoje é feriado
  const hojeStr = new Date().toISOString().split('T')[0]
  const feriodoHoje = config.feriado_ativo && config.data_feriado === hojeStr

  return (
    <div className="w-full">
      {/* Banner de Férias */}
      {config.modo_ferias && !fechouFerias && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <Umbrella className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium text-center">
              {config.msg_ferias}
              {config.data_volta_ferias && (
                <span className="ml-2 opacity-90">
                  Voltamos em {new Date(config.data_volta_ferias).toLocaleDateString("pt-BR")}
                </span>
              )}
            </p>
            <button
              onClick={() => setFechouFerias(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Banner de Feriado */}
      {feriodoHoje && !fechouFeriado && !config.modo_ferias && (
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium text-center">
              {config.msg_feriado}
            </p>
            <button
              onClick={() => setFechouFeriado(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Banner de Loja Fechada Manual */}
      {!config.loja_aberta && !config.modo_ferias && !feriodoHoje && (
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium text-center">
              {config.mensagem_fechada}
            </p>
          </div>
        </div>
      )}

      {/* Banner de Promoção */}
      {promocaoValida && !fechouPromo && (
        <div className="bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <Gift className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div className="text-center">
              <span className="font-bold">{config.titulo_promocao}</span>
              {config.desconto_promocao > 0 && (
                <span className="ml-2 bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  -{config.desconto_promocao}%
                </span>
              )}
              {config.descricao_promocao && (
                <span className="ml-2 text-sm opacity-80">{config.descricao_promocao}</span>
              )}
            </div>
            <button
              onClick={() => setFechouPromo(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cupom de Desconto */}
      {config.cupom_ativo && config.codigo_cupom && !fechouPromo && (
        <div className="bg-[#f59e0b] text-black py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <Tag className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              Use o cupom <span className="font-bold bg-black text-white px-2 py-0.5 rounded">{config.codigo_cupom}</span> e ganhe{" "}
              {config.tipo_desconto_cupom === "percentual" 
                ? `${config.desconto_cupom}% de desconto` 
                : `R$ ${config.desconto_cupom.toFixed(2)} de desconto`
              }
            </p>
          </div>
        </div>
      )}

      {/* Aviso Personalizado */}
      {config.aviso_ativo && config.msg_aviso && !fechouAviso && (
        <div 
          className="py-3 px-4 relative"
          style={{ backgroundColor: config.cor_aviso }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-black" />
            <p className="text-sm font-medium text-center text-black">
              {config.msg_aviso}
            </p>
            <button
              onClick={() => setFechouAviso(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
