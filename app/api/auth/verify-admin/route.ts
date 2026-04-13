import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: "User ID required" })
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error verifying admin:", error)
      return NextResponse.json({ isAdmin: false, error: error.message })
    }

    return NextResponse.json({ isAdmin: profile?.is_admin === true })
  } catch (error) {
    console.error("Verify admin error:", error)
    return NextResponse.json({ isAdmin: false, error: "Internal error" })
  }
}
