"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Heart, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function FavoritosPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/catalogo"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
          <p className="text-muted-foreground">Produtos que você curtiu</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum favorito ainda</h2>
        <p className="text-muted-foreground mb-6">
          Explore nossos produtos e adicione seus favoritos clicando no coração
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold rounded-full transition-colors"
        >
          Explorar produtos
        </Link>
      </div>
    </div>
  )
}
