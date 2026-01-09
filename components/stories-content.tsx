"use client"

import { useState } from "react"
import { StoryCard } from "@/components/story-card"
import { CategoryTabs } from "@/components/category-tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Story, Category } from "@/lib/types"

interface StoriesContentProps {
  stories: (Story & { category?: Category })[]
  categories: Category[]
}

export function StoriesContent({ stories, categories }: StoriesContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStories = stories.filter((story) => {
    const matchesCategory = !activeCategory || story.category?.slug === activeCategory
    const matchesSearch =
      !searchQuery ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => <StoryCard key={story.id} story={story} />)
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No stories found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
