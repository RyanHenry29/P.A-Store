import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { CatalogoHeader } from "@/components/catalogo/catalogo-header"
import { CatalogoNav } from "@/components/catalogo/catalogo-nav"
import { CartProvider } from "@/components/catalogo/cart-context"
import { CatalogoFooter } from "@/components/catalogo/catalogo-footer"
import { BannerAvisos } from "@/components/catalogo/banner-avisos"
import { getConfiguracoes, defaultConfig } from "@/lib/configuracoes"

export default async function CatalogoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // Use service role to bypass RLS for fetching profile
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  
  let profile = null
  if (user) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  const { data: categorias } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .order("ordem")

  // Buscar configurações da loja
  const config = await getConfiguracoes() || defaultConfig

  return (
    <CartProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <BannerAvisos config={config} />
        <CatalogoHeader profile={profile} config={config} />
        <CatalogoNav categorias={categorias || []} />
        <main className="flex-1">
          {children}
        </main>
        <CatalogoFooter config={config} />
      </div>
    </CartProvider>
  )
}
