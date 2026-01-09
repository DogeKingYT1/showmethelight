import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StoriesManager } from "@/components/admin/stories-manager"

export default async function AdminStoriesPage() {
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

  const { data: stories } = await supabase
    .from("stories")
    .select(`*, category:categories(*)`)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stories</h1>
          <p className="text-muted-foreground">Manage news stories and their settings</p>
        </div>
        <StoriesManager stories={stories || []} categories={categories || []} />
      </div>
    </AdminLayout>
  )
}
