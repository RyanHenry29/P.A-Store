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

// Credenciais do admin padrão
const ADMIN_EMAIL = "admin@pastore.com"
const ADMIN_PASSWORD = "admin123"

export async function POST() {
  try {
    // Verificar se admin já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const adminUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)

    if (adminUser) {
      // Garantir que o profile existe e tem is_admin = true
      await supabaseAdmin
        .from("profiles")
        .upsert({
          id: adminUser.id,
          nome: "Administrador",
          is_admin: true
        }, { onConflict: "id" })

      return NextResponse.json({ 
        success: true, 
        exists: true,
        message: "Admin já existe" 
      })
    }

    // Criar usuário admin sem confirmação de email
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Já confirma o email automaticamente
      user_metadata: {
        nome: "Administrador",
        is_admin: true
      }
    })

    if (createError) {
      throw createError
    }

    // Criar profile com is_admin = true
    if (userData.user) {
      await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userData.user.id,
          nome: "Administrador",
          is_admin: true
        }, { onConflict: "id" })
    }

    return NextResponse.json({ 
      success: true, 
      exists: false,
      message: "Admin criado com sucesso" 
    })

  } catch (error) {
    console.error("Erro no setup:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }, { status: 500 })
  }
}
