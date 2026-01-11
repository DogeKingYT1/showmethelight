# Complete Supabase SQL Setup - Ground News Style

## How to Use This File

1. Open your Supabase project → **SQL Editor** → **New Query**
2. **Copy the entire SQL code block below** (all at once)
3. **Paste it into the SQL Editor**
4. Click the blue **"Run"** button
5. Wait for all queries to complete successfully

---

## Complete SQL Code - Copy Everything Below

```sql
-- ============================================================================
-- SUPABASE COMPLETE SETUP - GROUND NEWS STYLE
-- Automated news aggregation platform with user comments & likes
-- Copy everything from this line to the end and paste into SQL Editor
-- ============================================================================

-- 1. CREATE PROFILES TABLE (User accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can insert profiles during signup" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can insert profiles during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. CREATE TRIGGER FOR AUTO-SIGNUP
-- When a user signs up via auth, automatically create their profile
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, is_admin)
  VALUES (new.id, new.email, new.email, FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. CREATE SOURCES TABLE (News feed management)
-- Admin-managed RSS feeds with political leaning labels
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  feed_url TEXT NOT NULL UNIQUE,
  description TEXT,
  leaning TEXT CHECK (leaning IN ('left', 'center', 'right', 'independent')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_active ON public.sources(active);
CREATE INDEX IF NOT EXISTS idx_sources_leaning ON public.sources(leaning);

-- ============================================================================
-- 4. CREATE ARTICLES TABLE (Auto-fetched news)
-- Stores articles fetched from RSS feeds with bias tags
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  source_name TEXT,
  leaning TEXT CHECK (leaning IN ('left', 'center', 'right', 'independent')),
  published_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  canonical TEXT,
  image TEXT,
  excerpt TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT articles_fingerprint_key UNIQUE (fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON public.articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_leaning ON public.articles(leaning);
CREATE INDEX IF NOT EXISTS idx_articles_fingerprint ON public.articles(fingerprint);

-- ============================================================================
-- 5. CREATE LIKES TABLE
-- Users can like articles to save/bookmark them
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article ON public.likes(article_id);

-- ============================================================================
-- 6. CREATE COMMENTS TABLE
-- Users can comment on articles (like Ground News)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  flagged_as_spam BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_article ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(approved);

-- ============================================================================
-- 7. CREATE COMMENT_LIKES TABLE
-- Users can like comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);

-- ============================================================================
-- SETUP COMPLETE
-- All tables created successfully!
-- ============================================================================
```

---

## Next Steps After Running SQL

### 1. Create Your First User Account

Via the app at `http://localhost:3000/admin`:
- Click **Create Account**
- Enter username and password
- This will auto-create a row in the `profiles` table

### 2. Promote Yourself to Admin

Run this query in SQL Editor (replace with your email):

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### 3. Add News Sources (Admin)

Go to `/admin` and add RSS feeds with political leanings:

```sql
INSERT INTO public.sources (name, feed_url, leaning, description)
VALUES 
  ('CNN', 'https://rss.cnn.com/rss/cnn_topstories.rss', 'center', 'CNN Top Stories'),
  ('MSNBC', 'https://feeds.nbcnews.com/nbcnews/public/news', 'left', 'NBC News'),
  ('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', 'center', 'BBC World News'),
  ('Fox News', 'https://feeds.foxnews.com/foxnews/latest', 'right', 'Fox News'),
  ('NPR', 'https://feeds.npr.org/1001/rss.xml', 'center-left', 'NPR Top Stories');
```

### 4. Test the News Fetcher

```bash
npm run fetch-news
```

This will:
- Fetch articles from all active sources
- Auto-tag them with the source's political leaning
- Deduplicate by fingerprint
- Store in the `articles` table

### 5. Verify Everything Works

Check articles were fetched:

```sql
SELECT id, title, leaning, source_name FROM public.articles LIMIT 10;
```

---

## Table Descriptions

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **profiles** | User accounts | id, email, username, is_admin |
| **sources** | RSS feeds | name, feed_url, leaning (left/center/right/independent) |
| **articles** | Auto-fetched news | id, fingerprint, title, link, leaning, published_at |
| **likes** | Article bookmarks | user_id, article_id |
| **comments** | Article discussions | article_id, user_id, content, approved |
| **comment_likes** | Comment reactions | user_id, comment_id |

---

## Troubleshooting

**Error: "already exists"**
- The tables already exist. That's okay! The `IF NOT EXISTS` clause prevents errors.

**Error: "relation does not exist"**
- Make sure you ran the entire SQL block at once, not parts separately.

**Users not appearing in profiles?**
- Check if trigger is active: Settings → Triggers
- Try creating a new user via the app

**Can't see articles?**
- Run `npm run fetch-news` to import articles from RSS feeds

