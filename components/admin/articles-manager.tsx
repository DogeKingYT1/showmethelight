"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BIAS_LABELS, BIAS_COLORS } from "@/lib/types"
import type { Article, NewsSource, BiasRating } from "@/lib/types"

interface ArticleWithRelations extends Article {
  source?: NewsSource
  story?: { title: string; slug: string }
}

interface ArticlesManagerProps {
  articles: ArticleWithRelations[]
}

export function ArticlesManager({ articles }: ArticlesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Story</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => {
                const biasRating = article.source?.bias_rating as BiasRating | null
                return (
                  <TableRow key={article.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium truncate">{article.title}</p>
                    </TableCell>
                    <TableCell>
                      {article.source ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={article.source.logo_url || "/placeholder.svg?height=20&width=20&query=logo"}
                            alt={article.source.name}
                            width={20}
                            height={20}
                            className="rounded"
                          />
                          <span className="text-sm">{article.source.name}</span>
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
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {article.story ? (
                        <Link
                          href={`/story/${article.story.slug}`}
                          className="text-sm text-primary hover:underline truncate block max-w-[150px]"
                        >
                          {article.story.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={article.url} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No articles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
