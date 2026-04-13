"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, Package } from "lucide-react"
import { useCart, CartItem as CartItemType } from "./cart-context"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex gap-4 bg-card border border-border rounded-xl p-4">
      {/* Image */}
      <div className="w-20 h-20 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
        {item.produtoImagem ? (
          <Image
            src={item.produtoImagem}
            alt={item.produtoNome}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{item.produtoNome}</h3>
        <p className="text-sm text-muted-foreground">
          {item.tamanho && `Tam: ${item.tamanho}`}
          {item.tamanho && item.cor && " | "}
          {item.cor && `Cor: ${item.cor}`}
        </p>
        <p className="text-[#00d4ff] font-bold mt-1">
          {formatCurrency(item.preco)}
        </p>
      </div>

      {/* Quantity & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.varianteId)}
          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.varianteId, item.quantidade - 1)}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium text-foreground">
            {item.quantidade}
          </span>
          <button
            onClick={() => updateQuantity(item.varianteId, item.quantidade + 1)}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
