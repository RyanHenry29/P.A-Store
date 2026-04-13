import Link from "next/link"
import { Check, Home, ShoppingBag } from "lucide-react"

interface PedidoConfirmadoPageProps {
  searchParams: Promise<{ codigo?: string }>
}

export default async function PedidoConfirmadoPage({ searchParams }: PedidoConfirmadoPageProps) {
  const { codigo } = await searchParams

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-[#00ff88]" />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Pedido confirmado!
      </h1>

      {codigo && (
        <p className="text-xl text-[#00d4ff] font-bold mb-4">
          #{codigo}
        </p>
      )}

      <p className="text-muted-foreground mb-8">
        Seu pedido foi recebido e está sendo processado. Entraremos em contato em breve para confirmar os detalhes.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold px-6 py-3 rounded-full transition-colors"
        >
          <Home className="w-5 h-5" />
          Voltar ao catálogo
        </Link>
        <Link
          href="/catalogo/meus-pedidos"
          className="inline-flex items-center justify-center gap-2 border border-border hover:bg-muted text-foreground font-semibold px-6 py-3 rounded-full transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          Meus pedidos
        </Link>
      </div>
    </div>
  )
}
