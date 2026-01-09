"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BookmarkButtonProps {
  storyId?: string
  articleId?: string
}

export function BookmarkButton({ storyId, articleId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkBookmark() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const query = supabase.from("bookmarks").select("id").eq("user_id", user.id)

      if (storyId) {
        query.eq("story_id", storyId)
      } else if (articleId) {
        query.eq("article_id", articleId)
      }

      const { data } = await query.single()
      setIsBookmarked(!!data)
      setIsLoading(false)
    }
    checkBookmark()
  }, [supabase, storyId, articleId])

  const handleToggleBookmark = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    if (isBookmarked) {
      const query = supabase.from("bookmarks").delete().eq("user_id", userId)

      if (storyId) {
        await query.eq("story_id", storyId)
      } else if (articleId) {
        await query.eq("article_id", articleId)
      }
      setIsBookmarked(false)
    } else {
      await supabase.from("bookmarks").insert({
        user_id: userId,
        story_id: storyId || null,
        article_id: articleId || null,
      })
      setIsBookmarked(true)
    }

    setIsLoading(false)
  }

  return (
    <Button variant={isBookmarked ? "default" : "outline"} onClick={handleToggleBookmark} disabled={isLoading}>
      {isBookmarked ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          Save
        </>
      )}
    </Button>
  )
}
