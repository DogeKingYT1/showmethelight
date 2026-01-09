import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BiasMeter } from "@/components/bias-meter"
import { Clock, Newspaper } from "lucide-react"
import type { Story, Category } from "@/lib/types"

interface StoryCardProps {
  story: Story & { category?: Category }
  variant?: "default" | "featured" | "compact"
}

export function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const totalSources = story.left_count + story.center_count + story.right_count
  const timeAgo = getTimeAgo(new Date(story.created_at))

  if (variant === "featured") {
    return (
      <Link href={`/story/${story.slug}`}>
        <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-[16/9]">
            <Image
              src={story.image_url || "/placeholder.svg?height=400&width=600&query=news"}
              alt={story.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {story.category && (
                <Badge
                  variant="secondary"
                  className="mb-2"
                  style={{ backgroundColor: story.category.color || undefined }}
                >
                  {story.category.name}
                </Badge>
              )}
              <h2 className="text-2xl font-bold mb-2 line-clamp-2 text-balance">{story.title}</h2>
              <p className="text-sm text-white/80 line-clamp-2 mb-4">{story.summary}</p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Newspaper className="h-4 w-4" />
                  {totalSources} sources
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeAgo}
                </span>
              </div>
              <div className="mt-4">
                <BiasMeter
                  leftCount={story.left_count}
                  centerCount={story.center_count}
                  rightCount={story.right_count}
                  size="sm"
                  showLabels={false}
                />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link href={`/story/${story.slug}`}>
        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={story.image_url || "/placeholder.svg?height=80&width=112&query=news"}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{totalSources} sources</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/story/${story.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[16/10]">
          <Image
            src={story.image_url || "/placeholder.svg?height=200&width=320&query=news"}
            alt={story.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {story.category && (
            <Badge className="absolute top-3 left-3" style={{ backgroundColor: story.category.color || undefined }}>
              {story.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors text-balance">
            {story.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{story.summary}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              {totalSources} sources
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
          <BiasMeter
            leftCount={story.left_count}
            centerCount={story.center_count}
            rightCount={story.right_count}
            size="sm"
          />
        </CardContent>
      </Card>
    </Link>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}
