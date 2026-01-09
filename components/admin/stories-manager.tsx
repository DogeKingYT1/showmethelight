"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Search, Star, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Story, Category } from "@/lib/types"

interface StoriesManagerProps {
  stories: (Story & { category?: Category })[]
  categories: Category[]
}

export function StoriesManager({ stories }: StoriesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredStories = stories.filter((story) => story.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFeatured = async (storyId: string, currentFeatured: boolean) => {
    setUpdatingId(storyId)
    await supabase.from("stories").update({ is_featured: !currentFeatured }).eq("id", storyId)
    router.refresh()
    setUpdatingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium max-w-xs truncate">{story.title}</TableCell>
                  <TableCell>
                    {story.category ? (
                      <Badge variant="outline" style={{ borderColor: story.category.color || undefined }}>
                        {story.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-blue-500">{story.left_count}L</span>
                      <span className="text-gray-500">{story.center_count}C</span>
                      <span className="text-red-500">{story.right_count}R</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={story.is_featured}
                        onCheckedChange={() => toggleFeatured(story.id, story.is_featured)}
                        disabled={updatingId === story.id}
                      />
                      {story.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(story.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/story/${story.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No stories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
