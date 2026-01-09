import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoriesContent } from "@/components/stories-content"

export default async function StoriesPage() {
  const supabase = await createClient()

  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      category:categories(*)
    `)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">All Stories</h1>
            <p className="text-muted-foreground mb-8">Browse news stories from across the political spectrum</p>
            <StoriesContent stories={stories || []} categories={categories || []} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
