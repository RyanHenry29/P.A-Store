"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  varianteId: string
  produtoNome: string
  produtoImagem: string | null
  tamanho: string | null
  cor: string | null
  preco: number
  quantidade: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantidade">) => void
  removeItem: (varianteId: string) => void
  updateQuantity: (varianteId: string, quantidade: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("pastore_cart")
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        localStorage.removeItem("pastore_cart")
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("pastore_cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (newItem: Omit<CartItem, "quantidade">) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.varianteId === newItem.varianteId)
      if (existing) {
        return prev.map((item) =>
          item.varianteId === newItem.varianteId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prev, { ...newItem, quantidade: 1 }]
    })
  }

  const removeItem = (varianteId: string) => {
    setItems((prev) => prev.filter((item) => item.varianteId !== varianteId))
  }

  const updateQuantity = (varianteId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(varianteId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.varianteId === varianteId ? { ...item, quantidade } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantidade, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
