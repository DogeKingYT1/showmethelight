# Supabase Setup Guide

## Quick Overview

This guide walks you through setting up **4 main tables**:
1. **profiles** — user accounts & admin status
2. **articles** — auto-fetched news from RSS feeds
3. **posts** — user-created announcements
4. **sources** — news source configuration (optional, advanced)

---

## Step 1: Access Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query** button (top right)
4. You'll see a blank text editor

---
## Step 2: Create Tables in Supabase SQL Editor

Run these queries **one at a time** (copy, paste, then click "Run" button). Wait for each to complete before running the next.

### 1. Create `profiles` table (stores user account info)

**What this does:** Stores user account data — email, username, and admin status.

**Copy & paste this entire block into SQL Editor:**

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can insert profiles during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

**Then click the blue "Run" button and wait for the success message.**

**What each part does:**
- `id UUID REFERENCES auth.users(id)` — Links to Supabase's built-in user table
- `email TEXT UNIQUE` — User's email (unique)
- `username TEXT UNIQUE` — Display name (unique)
- `is_admin BOOLEAN DEFAULT FALSE` — Admin flag (we'll set this manually)
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — RLS policies restrict who can read/write
- `CREATE POLICY` blocks — Allow users to only see/edit their own profile

---

### 2. Create the auto-signup trigger

**What this does:** When a new user signs up, automatically creates a row in the `profiles` table.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, is_admin)
  VALUES (new.id, new.email, new.email, FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Click "Run" and wait for success.**

**What happens next:**
- Every time someone signs up via `/api/register`, a profile row is auto-created
- They start as `is_admin = FALSE`
- You'll promote them to admin manually (Step 2b below)

---

### 2b. Verify the trigger works (optional test)

After creating a user account via the app, check if it appears in `profiles`:

```sql
SELECT * FROM public.profiles;
```

If you see your user's row, the trigger is working! ✅

---

### 3. Create `articles` table (auto-fetched news)

**What this does:** Stores news articles fetched from RSS feeds by the `npm run fetch-news` command.

```sql
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  canonical TEXT,
  image TEXT,
  excerpt TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX idx_articles_source ON public.articles(source);
CREATE INDEX idx_articles_fingerprint ON public.articles(fingerprint);
```

**Click "Run" and wait for success.**

**What each column does:**
- `fingerprint` — SHA-256 hash of title+content (used for deduplication)
- `title, link, source` — Article metadata
- `published_at` — When the article was published
- `content, excerpt, image` — Article text and thumbnail
- `canonical` — Original URL after redirects
- Indexes — Speed up queries on `published_at`, `source`, and `fingerprint`

---

### 4. Create `posts` table (user announcements)

**What this does:** Stores posts created by users via the admin panel (announcements, stories, etc.).

```sql
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON public.posts(user_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
```

**Click "Run" and wait for success.**

**What each column does:**
- `user_id` — Which user created this post
- `title, content` — Post text
- `tags` — Array of tags (e.g., `['announcement', 'breaking']`)
- Indexes — Speed up lookups by user and by newest-first

---

### (Optional) 5. Create `sources` table (news feed management)

**What this does:** Allows admins to manage which RSS feeds are fetched.

```sql
CREATE TABLE public.sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  feed_url TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sources_active ON public.sources(active);
```

**Click "Run" and wait for success.**

**Example row:**
```sql
INSERT INTO public.sources (name, feed_url, description)
VALUES ('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', 'British news');
```

---

## Step 3: Set Your Admin Account

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email you signed up with.

---

## Step 3: Set Your Admin Account

**After creating a user account** (via the app signup or `/api/register`), promote them to admin:

1. Find your email in the SQL Editor:
```sql
SELECT id, email, is_admin FROM public.profiles;
```

2. Copy your email address, then run:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email.

3. Verify it worked:
```sql
SELECT email, is_admin FROM public.profiles WHERE email = 'your-email@example.com';
```

Should show `is_admin = true` ✅

---

## Step 4: Update Environment Variables

In your project root, make sure `.env.local` contains:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
1. Open your Supabase project
2. Click **Settings** (bottom left)
3. Click **API** tab
4. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 5: Restart Your App

```bash
npm run dev
```

---

## Step 3: Update Environment Variables

Make sure your `.env.local` has:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in: **Supabase Dashboard → Settings → API Keys**

---

## Verification Checklist

- [ ] Created `profiles` table with RLS policies
- [ ] Created `articles` table
- [ ] Created `posts` table  
- [ ] Created `handle_new_user()` trigger
- [ ] Set at least one admin user
- [ ] Environment variables are set
- [ ] App restarted: `npm run dev`

---

## Troubleshooting

**Error: "relation 'public.profiles' does not exist"**
- Make sure you ran the "Create `profiles` table" query first
- Check that the query completed without errors

**Error: "function handle_new_user does not exist"**
- Make sure you created the trigger after the function

**Users not appearing in profiles table**
- Check if the trigger is active: Go to Database → Triggers in Supabase UI
- Try signing up a new user and check if a profile row appears

**Permission denied**
- Make sure you're using the service role key (not anon key) for server-side operations
