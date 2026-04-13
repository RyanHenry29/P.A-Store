"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Plus,
  Bell
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface AdminSidebarProps {
  profile: Profile
}

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos", badge: true },
  { href: "/admin/estoque", icon: Package, label: "Estoque" },
  { href: "/admin/produtos", icon: FolderOpen, label: "Produtos" },
  { href: "/admin/clientes", icon: Users, label: "Clientes" },
  { href: "/admin/notificacoes", icon: Bell, label: "Notificações" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/admin-login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yqH3dprW1LMnU8DwBPDSBDREOuSHgw.png"
          alt="P.A Store"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">P.A STORE</span>
          <span className="bg-[#00d4ff] text-black text-[10px] font-bold px-2 py-0.5 rounded">
            ADM
          </span>
        </div>
      </div>

      {/* Quick Action - Novo Produto */}
      <div className="px-3 mb-2">
        <Link
          href="/admin/produtos?novo=true"
          className="flex items-center justify-center gap-2 w-full bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto w-2 h-2 bg-[#ff4d4d] rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-full flex items-center justify-center">
            <span className="text-[#00d4ff] font-bold">
              {profile.nome?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.nome || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
