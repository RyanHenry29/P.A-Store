"use client"

import { useState } from "react"
import { Search, MessageCircle, User, ShoppingBag, ExternalLink } from "lucide-react"
import type { Profile } from "@/lib/types"

interface ClienteWithStats extends Profile {
  totalGasto: number
  totalPedidos: number
  ultimoPedido: string | null
}

interface ClientesTableProps {
  clientes: ClienteWithStats[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [search, setSearch] = useState("")

  const filteredClientes = clientes.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone?.includes(search)
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatWhatsAppLink = (phone: string | null) => {
    if (!phone) return null
    // Remove tudo que não é número
    const cleanPhone = phone.replace(/\D/g, "")
    // Adiciona código do Brasil se não tiver
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
    return `https://wa.me/${fullPhone}`
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{clientes.length}</p>
          <p className="text-sm text-muted-foreground">Total de clientes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00d4ff]">
            {clientes.filter(c => c.telefone).length}
          </p>
          <p className="text-sm text-muted-foreground">Com WhatsApp</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00ff88]">
            {formatCurrency(clientes.reduce((sum, c) => sum + c.totalGasto, 0))}
          </p>
          <p className="text-sm text-muted-foreground">Total em vendas</p>
        </div>
      </div>

      {filteredClientes.length === 0 ? (
        <div className="p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Gasto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Último Pedido
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClientes.map((cliente) => {
                const whatsappLink = formatWhatsAppLink(cliente.telefone)
                
                return (
                  <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00d4ff] font-bold">
                            {cliente.nome?.charAt(0).toUpperCase() || "C"}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {cliente.nome || "Cliente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {cliente.telefone && (
                          <p className="text-foreground font-medium">{cliente.telefone}</p>
                        )}
                        {cliente.email && (
                          <p className="text-muted-foreground text-sm">{cliente.email}</p>
                        )}
                        {!cliente.telefone && !cliente.email && (
                          <p className="text-muted-foreground text-sm">Sem contato</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{cliente.totalPedidos}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#00ff88] font-medium">
                        {formatCurrency(cliente.totalGasto)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {cliente.ultimoPedido 
                        ? formatDate(cliente.ultimoPedido) 
                        : "-"
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {whatsappLink && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
