"use client"

import { useState } from "react"
import { StoryCard } from "@/components/story-card"
import { CategoryTabs } from "@/components/category-tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Story, Category } from "@/lib/types"

interface HomeContentProps {
  featuredStories: (Story & { category?: Category })[]
  recentStories: (Story & { category?: Category })[]
  categories: Category[]
}

export function HomeContent({ featuredStories, recentStories, categories }: HomeContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredStories = activeCategory
    ? recentStories.filter((story) => story.category?.slug === activeCategory)
    : recentStories

  return (
    <>
      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Stories</h2>
              <Button variant="ghost" asChild>
                <Link href="/stories?featured=true">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredStories.slice(0, 2).map((story) => (
                <StoryCard key={story.id} story={story} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Stories with Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Stories</h2>
            <Button variant="ghost" asChild>
              <Link href="/stories">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => <StoryCard key={story.id} story={story} />)
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No stories found in this category yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Informed, Stay Balanced</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Create a free account to save stories, customize your feed, and get personalized insights about your news
            consumption.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
