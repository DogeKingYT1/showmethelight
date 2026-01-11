# Getting News Sources & Articles Working

This guide walks you through adding news sources to Supabase and populating your feed with articles.

---

## Step 1: Add Sources to Supabase

### Option A: Using SQL (Recommended)

1. Open [Supabase Dashboard](https://app.supabase.com) → Select your project
2. Go to **SQL Editor** → Click **New Query**
3. Copy the SQL from [SQL_NEWS_SOURCES.md](SQL_NEWS_SOURCES.md) (the entire `-- LEFT-LEANING SOURCES` through `-- INDEPENDENT SOURCES` section)
4. Paste it into the SQL Editor
5. Click **Run**

You should see:
```
Query successful: 40 rows affected
```

### Option B: Using Admin Panel

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/sources`
3. Log in with your admin credentials
4. Use the "Add Source" form to manually add sources
5. Select leaning (left, center, right, independent)
6. Paste the RSS feed URL

---

## Step 2: Verify Sources Were Added

1. Open Supabase Dashboard → **Table Editor**
2. Click the `sources` table
3. You should see 40 sources with columns: `name`, `feed_url`, `leaning`, `active`
4. Or visit `http://localhost:3000/sources` to see them visually organized by leaning

---

## Step 3: Fetch Articles from Sources

### Prerequisites
Ensure your `.env.local` has these variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run the Fetcher

In your terminal, run:
```bash
npm run fetch-news
```

This will:
1. Query all active sources from Supabase
2. Fetch articles from each RSS feed
3. Extract article content (title, description, image, text)
4. Deduplicate using SHA-256 fingerprinting
5. Save articles to the `articles` table with their leaning labels
6. Log progress to console

**Expected output:**
```
Fetching from 40 sources...
MSNBC: 10 articles fetched
CNN: 8 articles fetched
...
Total: 250+ articles saved to Supabase
```

---

## Step 4: View Your News Feed

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/feed`
3. You should see articles grouped by source with images and descriptions
4. Click the leaning buttons to filter: **All**, **← Left**, **Center**, **Right →**, **Independent**

---

## Step 5: Explore Features

### Public Pages
- **`/feed`** — Main news feed with bias filtering
- **`/sources`** — View all sources organized by leaning
- **`/articles/[id]`** — Read full article with comments and likes

### Admin Panel
- **`/admin`** — Login and manage announcements, view all posts and users
- **`/admin/sources`** — Add/edit/delete RSS feeds (admin only)

### User Features
- **`/blindspot`** — Personalized page showing articles from opposite leaning (requires login)

---

## Step 6: Set Up Automatic Fetching (Optional)

To fetch news automatically on a schedule, create a GitHub Actions workflow.

### Create `.github/workflows/fetch-news.yml`

```yaml
name: Fetch News

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run fetch-news
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Add Secrets to GitHub

1. Go to **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   - `SUPABASE_URL` = Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key (from Supabase)

The workflow will then automatically fetch news every 6 hours.

---

## Troubleshooting

### "No sources found" error when running fetcher

**Solution:** Make sure you've completed **Step 1** (added sources to Supabase).

### Articles not showing on `/feed`

**Solution:** 
1. Check that articles were saved to Supabase: `SELECT COUNT(*) FROM articles;`
2. Verify the fetcher ran successfully (check terminal output)
3. Refresh the page in your browser

### RSS feeds returning errors

Some feeds may have changed URLs or stopped working. You can:
1. Disable the source: `UPDATE sources SET active = false WHERE name = 'Source Name';`
2. Add a new source with a different URL

### Want to add more sources?

Add them via:
- Admin panel at `/admin/sources`
- Or SQL: `INSERT INTO sources (name, feed_url, leaning, description, active) VALUES (...)`

---

## Next Steps

1. ✅ Add sources to Supabase
2. ✅ Run `npm run fetch-news` to populate articles
3. ✅ Visit `/feed` to browse articles
4. ⏳ Share the `/sources` page with users
5. ⏳ Set up GitHub Actions for automatic fetching
6. ⏳ Deploy to production (Netlify)

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Fetch news from all active sources
npm run fetch-news

# Install dependencies (if you haven't yet)
npm install
```

---

## API Endpoints

These endpoints power your news feed:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sources` | GET | List all active sources |
| `/api/articles` | GET | Fetch articles with optional leaning filter |
| `/api/comments` | GET/POST | Get/add comments on articles |
| `/api/likes` | GET/POST | Like/unlike articles |

---

## Architecture

```
Sources (Supabase) → Fetcher Script → Articles (Supabase) → Feed UI
                              ↓
                         RSS Parser
                         ↓
                    Content Extraction
                    ↓
                  Deduplication
                  ↓
               Fingerprinting
```

- **Sources:** 40 news outlets across political spectrum
- **Articles:** Extracted with title, content, image, canonical URL
- **Deduplication:** SHA-256 fingerprint of (title + content + link)
- **Bias Labels:** Inherited from source leaning

---

Done! Your news aggregation platform is ready to use. 🚀
