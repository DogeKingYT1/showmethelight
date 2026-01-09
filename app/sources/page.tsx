import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { BIAS_LABELS, BIAS_COLORS } from "@/lib/types"
import type { BiasRating } from "@/lib/types"

export default async function SourcesPage() {
  const supabase = await createClient()

  const { data: sources } = await supabase.from("news_sources").select("*").eq("is_active", true).order("name")

  const groupedSources = {
    left: sources?.filter((s) => ["far_left", "left", "center_left"].includes(s.bias_rating || "")) || [],
    center: sources?.filter((s) => s.bias_rating === "center") || [],
    right: sources?.filter((s) => ["center_right", "right", "far_right"].includes(s.bias_rating || "")) || [],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">News Sources</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              We track coverage from sources across the political spectrum. Each source is rated for political bias and
              factual reliability.
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Left-Leaning ({groupedSources.left.length})
                </h2>
                <div className="space-y-4">
                  {groupedSources.left.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  Center ({groupedSources.center.length})
                </h2>
                <div className="space-y-4">
                  {groupedSources.center.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  Right-Leaning ({groupedSources.right.length})
                </h2>
                <div className="space-y-4">
                  {groupedSources.right.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function SourceCard({
  source,
}: {
  source: {
    id: string
    name: string
    logo_url: string | null
    website_url: string | null
    bias_rating: string | null
    reliability_score: number | null
    description: string | null
  }
}) {
  const biasRating = source.bias_rating as BiasRating | null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Image
            src={source.logo_url || "/placeholder.svg?height=40&width=40&query=news logo"}
            alt={source.name}
            width={40}
            height={40}
            className="rounded"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{source.name}</h3>
              {source.website_url && (
                <Link
                  href={source.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            {biasRating && (
              <Badge
                variant="outline"
                className="text-xs mb-2"
                style={{
                  borderColor: BIAS_COLORS[biasRating],
                  color: BIAS_COLORS[biasRating],
                }}
              >
                {BIAS_LABELS[biasRating]}
              </Badge>
            )}
            {source.reliability_score !== null && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Reliability</span>
                  <span>{source.reliability_score}%</span>
                </div>
                <Progress value={source.reliability_score} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
