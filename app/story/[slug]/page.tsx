import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BiasMeter } from "@/components/bias-meter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkButton } from "@/components/bookmark-button"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink, Clock, Newspaper } from "lucide-react"
import { BIAS_LABELS, BIAS_COLORS, getBiasCategory } from "@/lib/types"
import type { Article, NewsSource, BiasRating } from "@/lib/types"

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: story } = await supabase
    .from("stories")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("slug", slug)
    .single()

  if (!story) {
    notFound()
  }

  const { data: articles } = await supabase
    .from("articles")
    .select(`
      *,
      source:news_sources(*)
    `)
    .eq("story_id", story.id)
    .order("published_at", { ascending: false })

  const leftArticles = articles?.filter((a) => getBiasCategory((a.source as NewsSource)?.bias_rating) === "left") || []
  const centerArticles =
    articles?.filter((a) => getBiasCategory((a.source as NewsSource)?.bias_rating) === "center") || []
  const rightArticles =
    articles?.filter((a) => getBiasCategory((a.source as NewsSource)?.bias_rating) === "right") || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 h-[400px]">
            <Image
              src={story.image_url || "/placeholder.svg?height=400&width=1200&query=news"}
              alt={story.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>

          <div className="relative container mx-auto px-4 pt-32 pb-12">
            <div className="max-w-3xl">
              {story.category && (
                <Badge className="mb-4" style={{ backgroundColor: story.category.color || undefined }}>
                  {story.category.name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{story.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{story.summary}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Newspaper className="h-4 w-4" />
                  {articles?.length || 0} sources
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(story.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <BookmarkButton storyId={story.id} />
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bias Overview */}
        <section className="border-y bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold mb-4">Coverage Breakdown</h2>
            <div className="max-w-2xl">
              <BiasMeter
                leftCount={story.left_count}
                centerCount={story.center_count}
                rightCount={story.right_count}
                size="lg"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-500">{leftArticles.length}</div>
                  <div className="text-sm text-muted-foreground">Left-leaning sources</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-500">{centerArticles.length}</div>
                  <div className="text-sm text-muted-foreground">Center sources</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-500">{rightArticles.length}</div>
                  <div className="text-sm text-muted-foreground">Right-leaning sources</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Articles by Bias */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Sources ({articles?.length || 0})</TabsTrigger>
                <TabsTrigger value="left">Left ({leftArticles.length})</TabsTrigger>
                <TabsTrigger value="center">Center ({centerArticles.length})</TabsTrigger>
                <TabsTrigger value="right">Right ({rightArticles.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ArticleGrid articles={articles || []} />
              </TabsContent>
              <TabsContent value="left">
                <ArticleGrid articles={leftArticles} emptyMessage="No left-leaning sources covering this story yet." />
              </TabsContent>
              <TabsContent value="center">
                <ArticleGrid articles={centerArticles} emptyMessage="No center sources covering this story yet." />
              </TabsContent>
              <TabsContent value="right">
                <ArticleGrid
                  articles={rightArticles}
                  emptyMessage="No right-leaning sources covering this story yet."
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ArticleGrid({
  articles,
  emptyMessage = "No articles found.",
}: {
  articles: (Article & { source?: NewsSource })[]
  emptyMessage?: string
}) {
  if (articles.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

function ArticleCard({ article }: { article: Article & { source?: NewsSource } }) {
  const biasRating = article.source?.bias_rating as BiasRating | null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[16/10]">
        <Image
          src={article.image_url || "/placeholder.svg?height=200&width=320&query=news article"}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {article.source && (
            <>
              <Image
                src={article.source.logo_url || "/placeholder.svg?height=24&width=24&query=logo"}
                alt={article.source.name}
                width={24}
                height={24}
                className="rounded"
              />
              <span className="text-sm font-medium">{article.source.name}</span>
              {biasRating && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: BIAS_COLORS[biasRating],
                    color: BIAS_COLORS[biasRating],
                  }}
                >
                  {BIAS_LABELS[biasRating]}
                </Badge>
              )}
            </>
          )}
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.description}</p>
        <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
          <Link href={article.url} target="_blank" rel="noopener noreferrer">
            Read Article
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
