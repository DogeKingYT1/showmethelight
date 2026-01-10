const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if (!databaseUrl) {
    console.error('ERROR: set DATABASE_URL (your Supabase DB connection string) in the environment')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()

    const scriptsDir = path.join(__dirname)
    const files = ['001_create_tables.sql', '002_seed_data.sql', '003_seed_articles.sql']

    for (const file of files) {
      const filePath = path.join(scriptsDir, file)
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping missing file: ${filePath}`)
        continue
      }
      console.log(`Running ${file}...`)
      const sql = fs.readFileSync(filePath, 'utf8')
      await client.query(sql)
      console.log(`Finished ${file}`)
    }

    console.log('All scripts executed')
  } catch (err) {
    console.error('Error executing scripts:', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
/*
Run this script to execute the SQL files in /scripts against your Postgres database.

Requirements:
- Add your Supabase DB connection string to an environment variable named DATABASE_URL (full postgres://... URL)
- Or set PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT env vars

Usage:

DATABASE_URL="postgres://..." node scripts/run_sql.js

This script will execute files in the following order:
- scripts/001_create_tables.sql
- scripts/002_seed_data.sql
- scripts/003_seed_articles.sql

It will print errors and stop if any SQL execution fails.
*/

import fs from "fs"
import path from "path"
import { Client } from "pg"
import dotenv from "dotenv"

dotenv.config()

const sqlFiles = [
  "001_create_tables.sql",
  "002_seed_data.sql",
  "003_seed_articles.sql",
]

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Set DATABASE_URL to your Postgres connection string.")
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()
    for (const file of sqlFiles) {
      const p = path.join(process.cwd(), "scripts", file)
      if (!fs.existsSync(p)) {
        console.warn(`SQL file not found: ${p} — skipping`)
        continue
      }
      console.log(`Running ${file}...`)
      const sql = fs.readFileSync(p, "utf8")
      // split on semicolon followed by newline to avoid attempting huge multi-statement execution in some cases
      try {
        await client.query(sql)
        console.log(`${file} executed successfully.`)
      } catch (err) {
        console.error(`Error running ${file}:`, err)
        throw err
      }
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
