"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, Shield, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin using API (bypasses RLS)
      const verifyRes = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id }),
      })
      
      const verifyData = await verifyRes.json()

      if (!verifyData.isAdmin) {
        await supabase.auth.signOut()
        throw new Error("Acesso negado. Você não tem permissão de administrador.")
      }
      
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Logo */}
      <div className="mb-6">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yqH3dprW1LMnU8DwBPDSBDREOuSHgw.png"
          alt="P.A Store Logo"
          width={100}
          height={100}
          className="rounded-full"
          priority
        />
      </div>

      {/* Admin Badge */}
      <div className="flex items-center gap-2 bg-[#00d4ff]/10 text-[#00d4ff] px-4 py-1.5 rounded-full mb-4">
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">ADMIN</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-2">Painel Administrativo</h1>
      <p className="text-muted-foreground mb-8">Acesso restrito para administradores</p>

      {/* Login Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              E-mail do administrador
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pastore.com"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
              <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Acessar painel
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
