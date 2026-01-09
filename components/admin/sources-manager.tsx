"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Search, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BIAS_LABELS, BIAS_COLORS } from "@/lib/types"
import type { NewsSource, BiasRating } from "@/lib/types"

interface SourcesManagerProps {
  sources: NewsSource[]
}

export function SourcesManager({ sources }: SourcesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredSources = sources.filter((source) => source.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleActive = async (sourceId: string, currentActive: boolean) => {
    setUpdatingId(sourceId)
    await supabase.from("news_sources").update({ is_active: !currentActive }).eq("id", sourceId)
    router.refresh()
    setUpdatingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Bias Rating</TableHead>
              <TableHead>Reliability</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSources.length > 0 ? (
              filteredSources.map((source) => {
                const biasRating = source.bias_rating as BiasRating | null
                return (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={source.logo_url || "/placeholder.svg?height=32&width=32&query=logo"}
                          alt={source.name}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                        <span className="font-medium">{source.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {biasRating ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: BIAS_COLORS[biasRating],
                            color: BIAS_COLORS[biasRating],
                          }}
                        >
                          {BIAS_LABELS[biasRating]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {source.reliability_score !== null ? (
                        <div className="flex items-center gap-2">
                          <Progress value={source.reliability_score} className="w-20 h-2" />
                          <span className="text-sm">{source.reliability_score}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={source.is_active}
                        onCheckedChange={() => toggleActive(source.id, source.is_active)}
                        disabled={updatingId === source.id}
                      />
                    </TableCell>
                    <TableCell>
                      {source.website_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={source.website_url} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No sources found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
