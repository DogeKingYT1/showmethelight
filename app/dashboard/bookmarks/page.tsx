import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoryCard } from "@/components/story-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import Link from "next/link"

export default async function BookmarksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(`
      *,
      story:stories(*, category:categories(*))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Saved Stories</h1>
          <p className="text-muted-foreground mb-8">Your personal reading list</p>

          {bookmarks && bookmarks.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarks.map((bookmark) => bookmark.story && <StoryCard key={bookmark.id} story={bookmark.story} />)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved stories yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  When you find stories you want to read later, save them here by clicking the bookmark button.
                </p>
                <Button asChild>
                  <Link href="/stories">Browse Stories</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
