"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/catalogo"
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        
        router.push(redirect)
        router.refresh()
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome,
              telefone,
            },
          },
        })

        if (error) throw error

        // Create profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email,
              nome,
              telefone,
              is_admin: false,
            })
          
          if (profileError) {
            console.error("Profile error:", profileError)
          }
        }

        setSuccess("Conta criada com sucesso! Você já pode fazer login.")
        setIsLogin(true)
        setPassword("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back Link */}
      <Link
        href="/catalogo"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao catálogo
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

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {isLogin ? "Entrar na sua conta" : "Criar conta"}
      </h1>
      <p className="text-muted-foreground mb-8">
        {isLogin ? "Acesse sua conta para continuar" : "Preencha seus dados para se cadastrar"}
      </p>

      {/* Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome (only for register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
              <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Telefone (only for register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Telefone (WhatsApp)
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
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
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pl-11 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
                minLength={6}
              />
              <Lock className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
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

          {/* Success Message */}
          {success && (
            <div className="bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg p-3">
              <p className="text-[#00ff88] text-sm text-center">{success}</p>
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
                {isLogin ? "Entrar" : "Criar conta"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setSuccess(null)
              }}
              className="ml-2 text-[#00d4ff] hover:underline font-medium"
            >
              {isLogin ? "Cadastre-se" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
