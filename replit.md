# ResumeAI

AI-powered resume builder — Next.js 14, PostgreSQL, Google Gemini.

## How to run

```bash
pnpm install
pnpm exec prisma generate
pnpm dev          # starts on port 5000
```

## Required secrets

Set these in Replit Secrets before running:

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `BETTER_AUTH_SECRET` | Auth signing secret — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your Replit dev domain, e.g. `https://xxx.replit.dev` |
| `NEXT_PUBLIC_APP_URL` | Same as above |
| `GEMINI_API_KEY` | Google Gemini API key from aistudio.google.com |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` for OAuth.

## Architecture

- **Framework**: Next.js 14 App Router
- **Database**: PostgreSQL + Prisma ORM (`prisma/schema.prisma`)
- **Auth**: better-auth (`src/lib/auth.ts`)
- **AI**: Google Gemini 2.5 Flash (`src/lib/ai/`)
- **Storage**: Cloudinary (`src/lib/cloudinary.ts`)
- **Rate limiting**: In-memory fixed-window (`src/lib/rate-limit.ts`) — swap for Redis in production
- **Virus scan**: Architecture stub (`src/lib/virus-scan.ts`) — wire provider before enabling

## User preferences

- Strict TypeScript — no `any` casts, no `@ts-ignore`
- Zero ESLint warnings
- Zero build errors before marking tasks complete
- Production-ready code only — no placeholders or fake data
- Run `prisma generate` after any schema change
