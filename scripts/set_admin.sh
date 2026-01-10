#!/bin/bash

# Script to toggle admin status for a user in Supabase
# Usage: bash scripts/set_admin.sh <email> <true|false>

if [ $# -ne 2 ]; then
  echo "Usage: bash scripts/set_admin.sh <email> <true|false>"
  echo "Example: bash scripts/set_admin.sh user@example.com true"
  exit 1
fi

EMAIL=$1
IS_ADMIN=$2

if [ "$IS_ADMIN" != "true" ] && [ "$IS_ADMIN" != "false" ]; then
  echo "Error: Second argument must be 'true' or 'false'"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable not set"
  echo "Set it to your Supabase connection string:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/postgres?sslmode=require'"
  exit 1
fi

psql "$DATABASE_URL" << EOF
UPDATE public.profiles
SET is_admin = $IS_ADMIN
WHERE email = '$EMAIL';

SELECT email, is_admin FROM public.profiles WHERE email = '$EMAIL';
EOF
