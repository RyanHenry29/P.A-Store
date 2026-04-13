import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// API Admin para criar usuário sem confirmação de email
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email, password, phone, nome } = await request.json()

    // Validação básica
    if (!password || (!email && !phone)) {
      return NextResponse.json({ 
        success: false, 
        error: "Email ou telefone e senha são obrigatórios" 
      }, { status: 400 })
    }

    // Criar usuário sem confirmação de email
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email || undefined,
      phone: phone || undefined,
      password: password,
      email_confirm: true, // Já confirma automaticamente
      phone_confirm: true,
      user_metadata: {
        nome: nome || "Cliente",
        is_admin: false
      }
    })

    if (createError) {
      // Verificar se é erro de usuário já existente
      if (createError.message?.includes("already") || createError.message?.includes("exists")) {
        return NextResponse.json({ 
          success: false, 
          error: "Este email ou telefone já está cadastrado" 
        }, { status: 400 })
      }
      throw createError
    }

    // Criar profile
    if (userData.user) {
      await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userData.user.id,
          nome: nome || "Cliente",
          telefone: phone || null,
          is_admin: false
        }, { onConflict: "id" })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Conta criada com sucesso!",
      userId: userData.user?.id
    })

  } catch (error) {
    console.error("Erro no signup:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao criar conta" 
    }, { status: 500 })
  }
}
