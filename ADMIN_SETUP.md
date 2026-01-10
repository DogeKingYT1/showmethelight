# Admin Setup Guide

## Setting Admin Permissions via CLI

You can quickly set a user as admin using the provided script:

```bash
export DATABASE_URL='postgresql://user:password@host:5432/postgres?sslmode=require'
bash scripts/set_admin.sh user@example.com true
```

Replace:
- `user@example.com` with the target user's email
- `true` with `false` to revoke admin status
- `DATABASE_URL` with your Supabase connection string (find it in Supabase → Settings → Database)

## Setting Admin Permissions via Supabase SQL Editor

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'user@example.com';
```

## Admin Panel

Once a user has admin status, they can:
- Access `/admin` to manage users, sources, stories, and articles
- Upload and manage news sources
- Create/edit news stories and articles
- Toggle admin status for other users

## Verifying Account Creation

After a user signs up:
1. Check the `auth.users` table in Supabase (shows all authenticated users)
2. Check the `public.profiles` table (should have a row for each user created by the trigger)
3. Confirm `is_admin` is `FALSE` by default
