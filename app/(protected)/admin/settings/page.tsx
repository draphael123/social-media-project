import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSettings } from "@/components/admin-settings"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .order("order_index", { ascending: true })

  const { data: disclaimers } = await supabase
    .from("disclaimers")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage pipeline stages, WIP limits, and disclaimers</p>
      </div>
      <AdminSettings stages={stages || []} disclaimers={disclaimers || []} />
    </div>
  )
}

