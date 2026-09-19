# Supabase Blogs Database Wireup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up Supabase Postgres as the app's database via Prisma, with `blogs` and `blog_posts` tables, accessed only from server-side code.

**Architecture:** Prisma ORM connects directly to Supabase's Postgres instance (pooled URL at runtime, direct URL for migrations). A single `PrismaClient` singleton in `lib/prisma.ts` is imported by server-side code (API routes). No public Supabase client, no RLS — the browser never talks to Postgres directly.

**Tech Stack:** Next.js 12 (pages router), TypeScript, Prisma 7 (`prisma` CLI + `@prisma/client`), Supabase Postgres, yarn.

**Spec:** [docs/superpowers/specs/2026-09-19-supabase-blogs-design.md](../specs/2026-09-19-supabase-blogs-design.md)

## Global Constraints

- Postgres tables/columns are `snake_case`; Prisma models/fields are `PascalCase`/`camelCase`, mapped via `@@map`/`@map` — from spec's Schema section.
- No RLS policies — access is server-only via Prisma, bypassing PostgREST — from spec's Access Pattern section.
- `blogs.url` and `blog_posts.url` are unique; `blog_posts.blog_id` is a foreign key to `blogs.id` with `ON DELETE CASCADE` — from spec's Constraints section.
- Both tables use `uuid` primary keys (`gen_random_uuid()`/`uuid()` default) plus `created_at`/`updated_at` timestamps (`updated_at` auto-managed by Prisma) — from spec's Constraints section.
- `summary` and `thumbnail` on `blog_posts` are nullable; all other listed fields are required — from spec's Schema section.
- Real credentials go only in `.env` (gitignored); `.env.example` documents the variable names — from spec's Environment Variables section.
- This plan only wires up the database layer — no CRUD API routes or UI beyond a minimal connectivity-check endpoint — from spec's Out of Scope section.

---

## Prerequisite (manual, outside this plan's tasks)

Before Task 5 can be verified end-to-end, you need a real Supabase project:

1. Create a project at https://supabase.com (or use an existing one).
2. In the Supabase dashboard, go to Project Settings → Database → Connection string.
3. Copy the **Connection pooling** URI (port 6543, `?pgbouncer=true`) — this is `DATABASE_URL`.
4. Copy the **Direct connection** URI (port 5432) — this is `DIRECT_URL`.
5. Create `.env` in the repo root (it's gitignored) with both values, following `.env.example` from Task 4.

**Note on `prisma migrate dev`:** it creates and drops a temporary "shadow database" against `DIRECT_URL` to detect schema drift. If your Supabase project's database role lacks permission to create databases, this fails with error `P3014`. If that happens, either grant the role that permission, or fall back to `npx prisma migrate diff` (to generate the SQL) followed by `npx prisma migrate deploy` (which applies migrations without needing a shadow database).

Tasks 1-4 don't require real credentials (schema authoring, validation, and type-checking work with placeholder values). Task 5's migration step does.

---

### Task 1: Add Prisma dependencies and scaffold the datasource

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `.env` (local only, placeholder values — already covered by `.gitignore`'s `.env.local` pattern, see Task 4 for the `.env` entry itself)

**Interfaces:**
- Produces: `prisma/schema.prisma` with a `datasource db` block reading `DATABASE_URL`/`DIRECT_URL` and a `generator client` block. Task 2 appends models to this same file.

- [ ] **Step 1: Add Prisma packages to `package.json`**

Edit `package.json` so `dependencies` and `devDependencies` include Prisma, and add a `postinstall` script so the client regenerates after every install:

```json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": "14.x"
  },
  "dependencies": {
    "@prisma/client": "^7.10.0",
    "next": "latest",
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "@types/react": "^17.0.20",
    "autoprefixer": "^10.2.6",
    "eslint": "^7.32.0",
    "postcss": "^8.3.5",
    "prisma": "^7.10.0",
    "tailwindcss": "^2.2.4",
    "typescript": "^4.4.2"
  }
}
```

- [ ] **Step 2: Install**

Run: `yarn install`
Expected: installs `prisma` and `@prisma/client`; `postinstall` runs `prisma generate` (it will warn/no-op gracefully since no schema exists yet — that's fine, Step 3 creates it before we rely on generation).

- [ ] **Step 3: Create `prisma/schema.prisma` with the datasource only**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- [ ] **Step 4: Create a placeholder `.env` so schema validation can resolve env vars**

```
DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
```

- [ ] **Step 5: Validate the schema**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock prisma/schema.prisma
git commit -m "Add Prisma dependencies and datasource scaffold"
```

(`.env` is not committed — verify `git status` shows it as untracked/ignored before staging; if it shows as untracked because `.env` isn't yet in `.gitignore`, don't `git add` it. Task 4 adds the ignore rule.)

---

### Task 2: Define the `Blog` and `BlogPost` models

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: the `datasource`/`generator` blocks from Task 1 (same file).
- Produces: `Blog` and `BlogPost` Prisma models, mapped to `blogs`/`blog_posts` tables, with fields `Blog.{id, url, name, author, authorEmail, createdAt, updatedAt, posts}` and `BlogPost.{id, blogId, blog, postTitle, url, timestamp, summary, thumbnail, createdAt, updatedAt}` — later tasks (Task 5's API route) import `PrismaClient` and call `prisma.blog.count()` / `prisma.blogPost` using these exact field names.

- [ ] **Step 1: Append the models to `prisma/schema.prisma`**

Full file contents after this step:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Blog {
  id          String     @id @default(uuid()) @db.Uuid
  url         String     @unique
  name        String
  author      String
  authorEmail String     @map("author_email")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  posts       BlogPost[]

  @@map("blogs")
}

model BlogPost {
  id        String   @id @default(uuid()) @db.Uuid
  blogId    String   @map("blog_id") @db.Uuid
  blog      Blog     @relation(fields: [blogId], references: [id], onDelete: Cascade)
  postTitle String   @map("post_title")
  url       String   @unique
  timestamp DateTime
  summary   String?
  thumbnail String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("blog_posts")
}
```

- [ ] **Step 2: Format and validate**

Run: `npx prisma format && npx prisma validate`
Expected: format rewrites the file in canonical style with no diff to the intent above; validate prints `The schema at prisma/schema.prisma is valid 🚀`.

- [ ] **Step 3: Generate the client against the new models**

Run: `npx prisma generate`
Expected: `Generated Prisma Client ... to ./node_modules/@prisma/client` with no errors — confirms the schema compiles into a valid client even though we can't yet connect to a real database.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "Define Blog and BlogPost Prisma models"
```

---

### Task 3: Add the Prisma client singleton

**Files:**
- Create: `lib/prisma.ts`

**Interfaces:**
- Consumes: `PrismaClient` generated in Task 2.
- Produces: default export `prisma: PrismaClient` — Task 5's API route imports this as `import prisma from '../../lib/prisma'`.

- [ ] **Step 1: Create `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/prisma.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/prisma.ts
git commit -m "Add Prisma client singleton"
```

---

### Task 4: Document env vars and ignore real secrets

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `DATABASE_URL`, `DIRECT_URL` variable names from Task 1's datasource block.
- Produces: none consumed by later tasks (documentation-only).

- [ ] **Step 1: Create `.env.example`**

```
# Supabase connection pooler (pgbouncer, port 6543) — used by the app at runtime.
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase direct connection (port 5432) — used by `prisma migrate` to run DDL.
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

- [ ] **Step 2: Add `.env` to `.gitignore`**

Add this line under the existing "local env files" section of `.gitignore` (which currently only lists `.env.local` and friends):

```
.env
```

- [ ] **Step 3: Verify `.env` is now ignored**

Run: `git check-ignore -v .env`
Expected: prints a match against the `.gitignore` line just added (exit code 0).

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "Document Supabase env vars and ignore .env"
```

---

### Task 5: Run the migration and add a connectivity-check API route

**Files:**
- Create: `prisma/migrations/` (generated by the CLI)
- Create: `pages/api/db-health.ts`
- Test: manual `curl` against the dev server (no test framework exists in this repo)

**Interfaces:**
- Consumes: `prisma` singleton from Task 3 (`lib/prisma.ts`), `Blog`/`BlogPost` models from Task 2.
- Produces: `GET /api/db-health` returning `{ ok: true, blogCount: number, blogPostCount: number }` — a manual smoke test for this plan, not consumed by other tasks.

**Before starting:** complete the Prerequisite section above — replace the placeholder values in `.env` with your real Supabase `DATABASE_URL`/`DIRECT_URL`.

- [ ] **Step 1: Generate and apply the migration**

Run: `npx prisma migrate dev --name init_blogs`
Expected: creates `prisma/migrations/<timestamp>_init_blogs/migration.sql`, applies it to Supabase, and prints `Your database is now in sync with your schema.`

- [ ] **Step 2: Confirm the tables exist**

Run: `npx prisma db pull --print`
Expected: output includes `model Blog` and `model BlogPost` matching Task 2's schema (confirming Supabase actually has the tables, not just that the local migration ran).

- [ ] **Step 3: Create `pages/api/db-health.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [blogCount, blogPostCount] = await Promise.all([
    prisma.blog.count(),
    prisma.blogPost.count(),
  ])

  res.status(200).json({ ok: true, blogCount, blogPostCount })
}
```

- [ ] **Step 4: Verify against the running dev server**

Run: `yarn dev &` then, once it's up, `curl -s http://localhost:3000/api/db-health`
Expected: `{"ok":true,"blogCount":0,"blogPostCount":0}`. Stop the dev server afterward (`kill %1` or `fg` then Ctrl-C).

- [ ] **Step 5: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/migrations pages/api/db-health.ts
git commit -m "Apply initial migration and add DB connectivity check"
```

---

## Self-Review Notes

- **Spec coverage:** access pattern (server-only, no RLS) → Task 3/5; schema (both models, all fields, mappings) → Task 2; constraints (unique urls, FK cascade, uuid PKs, timestamps) → Task 2; migration workflow (env vars, `prisma migrate dev`) → Tasks 1, 4, 5; verification (migrate succeeds, tables confirmed, tsc passes) → Task 5. Out-of-scope items (CRUD/UI, RLS, prod secrets) intentionally have no task.
- **Placeholder scan:** none found — every step has literal file contents or an exact command with expected output.
- **Type consistency:** `Blog`/`BlogPost` field names (`authorEmail`, `blogId`, `postTitle`, etc.) are identical between Task 2's schema and Task 5's `prisma.blog.count()`/`prisma.blogPost.count()` usage; the singleton's export name (`prisma`, default export) matches the import in Task 5.
