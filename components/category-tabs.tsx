"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Landmark, Cpu, Briefcase, FlaskConical, Heart, Trophy, Film, Globe, LayoutGrid } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (slug: string | null) => void
}

const iconMap: Record<string, React.ElementType> = {
  landmark: Landmark,
  cpu: Cpu,
  briefcase: Briefcase,
  flask: FlaskConical,
  heart: Heart,
  trophy: Trophy,
  film: Film,
  globe: Globe,
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
          activeCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-muted-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        All
      </button>
      {categories.map((category) => {
        const Icon = iconMap[category.icon || ""] || Globe
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
