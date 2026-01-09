export type BiasRating = "far_left" | "left" | "center_left" | "center" | "center_right" | "right" | "far_right"

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface NewsSource {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website_url: string | null
  bias_rating: BiasRating | null
  reliability_score: number | null
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  created_at: string
}

export interface Article {
  id: string
  title: string
  description: string | null
  content: string | null
  url: string
  image_url: string | null
  source_id: string | null
  category_id: string | null
  story_id: string | null
  published_at: string | null
  created_at: string
  source?: NewsSource
  category?: Category
}

export interface Story {
  id: string
  title: string
  slug: string
  summary: string | null
  image_url: string | null
  category_id: string | null
  coverage_score: number
  left_count: number
  center_count: number
  right_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: Category
  articles?: Article[]
}

export interface Bookmark {
  id: string
  user_id: string
  article_id: string | null
  story_id: string | null
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_categories: string[]
  hidden_sources: string[]
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export const BIAS_LABELS: Record<BiasRating, string> = {
  far_left: "Far Left",
  left: "Left",
  center_left: "Lean Left",
  center: "Center",
  center_right: "Lean Right",
  right: "Right",
  far_right: "Far Right",
}

export const BIAS_COLORS: Record<BiasRating, string> = {
  far_left: "#1d4ed8",
  left: "#3b82f6",
  center_left: "#60a5fa",
  center: "#6b7280",
  center_right: "#f87171",
  right: "#ef4444",
  far_right: "#b91c1c",
}

export function getBiasCategory(rating: BiasRating | null): "left" | "center" | "right" {
  if (!rating) return "center"
  if (["far_left", "left", "center_left"].includes(rating)) return "left"
  if (["far_right", "right", "center_right"].includes(rating)) return "right"
  return "center"
}
