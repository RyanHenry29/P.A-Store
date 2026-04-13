"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail, Phone, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type SignupMethod = "email" | "phone"

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [method, setMethod] = useState<SignupMethod>("email")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      // Usar API admin para criar usuário sem confirmação de email
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "email" ? email : undefined,
          phone: method === "phone" ? phone.replace(/\D/g, "") : undefined,
          password,
          nome,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Erro ao criar conta")
      }
      
      // Fazer login automaticamente após criar a conta
      const loginData = method === "email" 
        ? { email, password }
        : { phone: phone.replace(/\D/g, ""), password }

      const { error: loginError } = await supabase.auth.signInWithPassword(loginData)
      
      if (loginError) {
        // Se não conseguiu fazer login automático, redireciona para login
        setSuccess(true)
      } else {
        // Login bem sucedido, redireciona para o catálogo
        router.push("/catalogo")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
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

  if (success) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-[#00ff88]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Conta criada com sucesso!
          </h1>
          <p className="text-muted-foreground mb-8">
            Agora você pode fazer login com suas credenciais.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#00d4ff] hover:bg-[#00a3cc] text-black font-semibold px-6 py-3 rounded-full transition-all"
          >
            Fazer Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
      <h1 className="text-2xl font-bold text-[#00d4ff] mb-2">Criar Conta</h1>
      <p className="text-muted-foreground mb-6">Junte-se à P.A Store</p>

      {/* Signup Form */}
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

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Nome completo
            </label>
            <div className="relative">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
                required
              />
              <User className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
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

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Confirmar senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent transition-all"
              required
            />
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
                Criar conta
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link
            href="/"
            className="text-[#00d4ff] hover:underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
