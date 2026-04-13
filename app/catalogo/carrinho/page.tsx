"use client"

import { useState } from "react"
import { useCart } from "@/components/catalogo/cart-context"
import { CartItem } from "@/components/catalogo/cart-item"
import { CheckoutForm } from "@/components/catalogo/checkout-form"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CarrinhoPage() {
  const { items, total, clearCart } = useCart()
  const [desconto, setDesconto] = useState(0)
  const [cupomInfo, setCupomInfo] = useState<{codigo: string, desconto: number, tipo: string} | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Callback para receber info do cupom do CheckoutForm
  const handleCupomChange = (info: {codigo: string, desconto: number, tipo: string} | null) => {
    setCupomInfo(info)
    if (info) {
      if (info.tipo === "percentual") {
        setDesconto(total * (info.desconto / 100))
      } else {
        setDesconto(info.desconto)
      }
    } else {
      setDesconto(0)
    }
  }

  const totalComDesconto = total - desconto

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Seu carrinho está vazio
          </h1>
          <p className="text-muted-foreground mb-6">
            Adicione produtos para continuar
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Carrinho</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.varianteId} item={item} />
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpar carrinho
            </button>
            <Link
              href="/catalogo"
              className="text-sm text-[#00d4ff] hover:underline"
            >
              Continuar comprando
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">Resumo</h2>

            <div className="space-y-3 pb-4 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega</span>
                <span className="text-foreground">A combinar</span>
              </div>
              {cupomInfo && desconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#00ff88]">
                    Cupom {cupomInfo.codigo} ({cupomInfo.tipo === "percentual" ? `${cupomInfo.desconto}%` : formatCurrency(cupomInfo.desconto)})
                  </span>
                  <span className="text-[#00ff88]">-{formatCurrency(desconto)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between py-4">
              <span className="text-lg font-bold text-foreground">Total</span>
              <div className="text-right">
                {desconto > 0 && (
                  <span className="text-sm text-muted-foreground line-through block">
                    {formatCurrency(total)}
                  </span>
                )}
                <span className="text-lg font-bold text-[#00d4ff]">
                  {formatCurrency(totalComDesconto)}
                </span>
              </div>
            </div>

            <CheckoutForm onCupomChange={handleCupomChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
