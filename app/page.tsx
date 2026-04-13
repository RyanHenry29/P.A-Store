"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail, Phone, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type LoginMethod = "email" | "phone"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [method, setMethod] = useState<LoginMethod>("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (method === "email") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          phone,
          password,
        })
        if (error) throw error
      }
      
      router.push("/catalogo")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yqH3dprW1LMnU8DwBPDSBDREOuSHgw.png"
          alt="P.A Store Logo"
          width={120}
          height={120}
          className="rounded-full"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#00d4ff] mb-2">Entrar</h1>
      <p className="text-muted-foreground mb-8">Acesse sua conta P.A Store</p>

      {/* Login Form */}
      <div className="w-full max-w-sm">
        {/* Method Toggle */}
        <div className="flex bg-secondary rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
              method === "email"
                ? "bg-[#00d4ff] text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            E-mail
          </button>
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
              method === "phone"
                ? "bg-[#00d4ff] text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="w-4 h-4" />
            Celular
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email or Phone Input */}
          {method === "email" ? (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Celular
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
            </div>
          )}

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
            <p className="text-destructive text-sm text-center">{error}</p>
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
                Entrar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Create Account Link */}
        <p className="text-center text-muted-foreground mt-6">
          Não tem conta?{" "}
          <Link
            href="/auth/cadastro"
            className="text-[#00d4ff] hover:underline font-medium"
          >
            Criar conta
          </Link>
        </p>

        {/* Admin Access */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/auth/admin-login"
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Acesso Administrativo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
