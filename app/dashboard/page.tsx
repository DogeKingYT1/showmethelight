import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/story-card"
import Link from "next/link"
import { Bookmark, Settings, TrendingUp, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(`
      *,
      story:stories(*, category:categories(*))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4)

  const { data: recentStories } = await supabase
    .from("stories")
    .select(`*, category:categories(*)`)
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.display_name || "Reader"}</h1>
            <p className="text-muted-foreground">Your personalized news dashboard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saved Stories</CardTitle>
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookmarks?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Stories in your reading list</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Stories Read</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "--"}
                </div>
                <p className="text-xs text-muted-foreground">Thank you for being here</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Saved Stories</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/bookmarks">View all</Link>
                </Button>
              </div>
              {bookmarks && bookmarks.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {bookmarks
                    .slice(0, 4)
                    .map(
                      (bookmark) =>
                        bookmark.story && <StoryCard key={bookmark.id} story={bookmark.story} variant="compact" />,
                    )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No saved stories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start saving stories to build your reading list
                    </p>
                    <Button asChild>
                      <Link href="/stories">Browse Stories</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between mt-8">
                <h2 className="text-xl font-semibold">Recent Stories</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/stories">View all</Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {recentStories?.map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/bookmarks">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Saved Stories
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
