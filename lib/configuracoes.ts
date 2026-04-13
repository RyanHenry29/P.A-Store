import { createClient } from "@/lib/supabase/server"

export interface Configuracoes {
  id: string
  nome_loja: string
  slogan: string
  whatsapp: string
  instagram: string
  email: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  horario_seg_sex_abertura: string
  horario_seg_sex_fechamento: string
  horario_sab_abertura: string
  horario_sab_fechamento: string
  horario_dom_abertura: string
  horario_dom_fechamento: string
  taxa_entrega: number
  frete_gratis_acima: number
  tempo_entrega_min: number
  tempo_entrega_max: number
  aceita_pix: boolean
  aceita_dinheiro: boolean
  aceita_cartao: boolean
  chave_pix: string
  alerta_novo_pedido: boolean
  alerta_estoque_baixo: boolean
  estoque_minimo_alerta: number
  loja_aberta: boolean
  mensagem_fechada: string
  modo_ferias: boolean
  msg_ferias: string
  data_volta_ferias: string | null
  feriado_ativo: boolean
  msg_feriado: string
  data_feriado: string | null
  promocao_ativa: boolean
  titulo_promocao: string
  descricao_promocao: string
  desconto_promocao: number
  data_inicio_promocao: string | null
  data_fim_promocao: string | null
  banner_promocao_url: string
  aviso_ativo: boolean
  msg_aviso: string
  cor_aviso: string
  cupom_ativo: boolean
  codigo_cupom: string
  desconto_cupom: number
  tipo_desconto_cupom: string
  pedido_minimo: number
  aceita_retirada: boolean
  aceita_entrega: boolean
  mostrar_estoque: boolean
  mostrar_vendidos: boolean
  produtos_por_pagina: number
  politica_troca: string
  sobre_loja: string
}

export async function getConfiguracoes(): Promise<Configuracoes | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("configuracoes")
    .select("*")
    .limit(1)
    .single()
  
  if (error) {
    console.error("Erro ao buscar configurações:", error)
    return null
  }
  
  return data as Configuracoes
}

// Default values if no config found
export const defaultConfig: Configuracoes = {
  id: "",
  nome_loja: "P.A Store",
  slogan: "OO da Quebrada - Guarulhos",
  whatsapp: "11999999999",
  instagram: "p.a__storee",
  email: "",
  endereco: "Av. José Rangel Filho, 1466",
  bairro: "Jardim Pte. Alta I",
  cidade: "Guarulhos",
  estado: "SP",
  cep: "07179-350",
  horario_seg_sex_abertura: "09:00",
  horario_seg_sex_fechamento: "20:00",
  horario_sab_abertura: "09:00",
  horario_sab_fechamento: "20:00",
  horario_dom_abertura: "09:00",
  horario_dom_fechamento: "14:00",
  taxa_entrega: 0,
  frete_gratis_acima: 0,
  tempo_entrega_min: 30,
  tempo_entrega_max: 60,
  aceita_pix: true,
  aceita_dinheiro: true,
  aceita_cartao: true,
  chave_pix: "",
  alerta_novo_pedido: true,
  alerta_estoque_baixo: true,
  estoque_minimo_alerta: 3,
  loja_aberta: true,
  mensagem_fechada: "Estamos fechados no momento. Volte em breve!",
  modo_ferias: false,
  msg_ferias: "Estamos em recesso! Voltamos em breve.",
  data_volta_ferias: null,
  feriado_ativo: false,
  msg_feriado: "Hoje é feriado! Estamos fechados.",
  data_feriado: null,
  promocao_ativa: false,
  titulo_promocao: "",
  descricao_promocao: "",
  desconto_promocao: 0,
  data_inicio_promocao: null,
  data_fim_promocao: null,
  banner_promocao_url: "",
  aviso_ativo: false,
  msg_aviso: "",
  cor_aviso: "#f59e0b",
  cupom_ativo: false,
  codigo_cupom: "",
  desconto_cupom: 0,
  tipo_desconto_cupom: "percentual",
  pedido_minimo: 0,
  aceita_retirada: true,
  aceita_entrega: true,
  mostrar_estoque: true,
  mostrar_vendidos: false,
  produtos_por_pagina: 12,
  politica_troca: "Aceitamos trocas em até 7 dias após a compra, com etiqueta e sem uso.",
  sobre_loja: "P.A Store - OO da Quebrada. Sua loja de roupas em Guarulhos.",
}
