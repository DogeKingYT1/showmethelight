import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { SourcesManager } from "@/components/admin/sources-manager"

export default async function AdminSourcesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  const { data: sources } = await supabase.from("news_sources").select("*").order("name")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">News Sources</h1>
          <p className="text-muted-foreground">Manage news sources and their bias ratings</p>
        </div>
        <SourcesManager sources={sources || []} />
      </div>
    </AdminLayout>
  )
}
