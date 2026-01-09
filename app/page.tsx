import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Eye, Shield } from "lucide-react"
import Link from "next/link"
import { HomeContent } from "@/components/home-content"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredStories } = await supabase
    .from("stories")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4)

  const { data: recentStories } = await supabase
    .from("stories")
    .select(`
      *,
      category:categories(*)
    `)
    .order("created_at", { ascending: false })
    .limit(8)

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Trusted by 500,000+ readers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">See the Full Picture</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Compare news coverage across the political spectrum. Understand media bias and make informed decisions
              about the stories that matter.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/stories">
                  Explore Stories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/methodology">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Bias Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  See how left, center, and right-leaning sources cover each story
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Coverage Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Discover stories that are over or under-reported by different outlets
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Source Reliability</h3>
                <p className="text-sm text-muted-foreground">
                  Access reliability scores and detailed source information
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <HomeContent
          featuredStories={featuredStories || []}
          recentStories={recentStories || []}
          categories={categories || []}
        />
      </main>
      <Footer />
    </div>
  )
}
