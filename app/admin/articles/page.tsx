import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArticlesManager } from "@/components/admin/articles-manager"

export default async function AdminArticlesPage() {
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

  const { data: articles } = await supabase
    .from("articles")
    .select(`
      *,
      source:news_sources(*),
      story:stories(title, slug)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage individual articles and their sources</p>
        </div>
        <ArticlesManager articles={articles || []} />
      </div>
    </AdminLayout>
  )
}
