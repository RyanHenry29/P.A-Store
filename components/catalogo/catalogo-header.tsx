"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, User, LogOut, Search, Settings, MapPin, Heart, Package, Shield } from "lucide-react"
import { useCart } from "./cart-context"
import { StoreStatus } from "./store-status"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Profile } from "@/lib/types"
import type { Configuracoes } from "@/lib/configuracoes"

interface CatalogoHeaderProps {
  profile: Profile | null
  config: Configuracoes
}

export function CatalogoHeader({ profile, config }: CatalogoHeaderProps) {
  const { itemCount } = useCart()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      {/* Status Bar */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
          <StoreStatus config={config} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/catalogo" className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yqH3dprW1LMnU8DwBPDSBDREOuSHgw.png"
            alt={config.nome_loja}
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-bold text-foreground hidden sm:block">{config.nome_loja.toUpperCase()}</span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full bg-secondary border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/catalogo/carrinho"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00d4ff] text-black text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-8 h-8 bg-[#00d4ff]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#00d4ff] font-bold text-sm">
                    {profile.nome?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <>
                  {/* Overlay para fechar o menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    {/* Header do menu com info do usuário */}
                    <div className="p-4 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#00d4ff] font-bold">
                            {profile.nome?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{profile.nome || "Usuário"}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email || "cliente"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Link Admin - só aparece para admins */}
                    {profile.is_admin && (
                      <div className="py-2 border-b border-border">
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors font-medium"
                        >
                          <Shield className="w-4 h-4" />
                          Painel Administrativo
                        </Link>
                      </div>
                    )}
                    
                    {/* Links do menu */}
                    <div className="py-2">
                      <Link
                        href="/catalogo/meus-pedidos"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        Meus Pedidos
                      </Link>
                      <Link
                        href="/catalogo/favoritos"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Favoritos
                      </Link>
                      <Link
                        href="/catalogo/minha-conta"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Minha Conta
                      </Link>
                      <Link
                        href="/catalogo/enderecos"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Endereços
                      </Link>
                    </div>
                    
                    {/* Botão de sair */}
                    <div className="border-t border-border py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-medium rounded-full text-sm transition-colors"
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
