# ResumeAI — Build Your Perfect Resume

> AI-powered resume builder with ATS optimization, beautiful templates, and intelligent career insights.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

---

## Features

| Feature | Description |
|---|---|
| **Resume Builder** | Drag-and-drop editor, 6+ templates, real-time preview |
| **AI Autofill** | Gemini-powered content generation and improvement |
| **ATS Analysis** | Score your resume against job descriptions |
| **Resume Import** | Upload PDF, DOCX, TXT or JSON and convert instantly |
| **Cover Letters** | AI-generated, tone-matched cover letters |
| **Career Intelligence** | Salary ranges, skill gaps, learning roadmap |
| **Interview Prep** | AI-generated question sets per role |
| **Analytics** | View counts, downloads, share link performance |
| **PDF / DOCX Export** | High-fidelity one-click export |
| **Dark Mode** | Full system/manual dark mode support |

<img width="1280" height="720" alt="17831799398824751706160592746534" src="https://github.com/user-attachments/assets/a93efe90-e441-4f21-adcd-52633d4dbbbd" />
<img width="1280" height="720" alt="17831799645353934490582315865487" src="https://github.com/user-attachments/assets/c31b08f1-2bd8-42eb-ac90-c94a37cdd091" />
<img width="1280" height="720" alt="17831799953323199151599915476132" src="https://github.com/user-attachments/assets/d9d187f9-3004-4eba-949f-3616dbd1f16c" />
<img width="1280" height="720" alt="17831800212186828716270617262540" src="https://github.com/user-attachments/assets/adc5e3f8-a382-40fe-b2bf-0bc33af30cc1" />

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: better-auth (email + Google + GitHub OAuth)
- **AI**: Google Gemini 2.5 Flash
- **Storage**: Cloudinary (images)
- **Styling**: Tailwind CSS + Radix UI
- **Animations**: Framer Motion

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Google Gemini API key
- Cloudinary account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/resumeai.git
cd resumeai

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your .env.local values (see Environment Variables section)

# 5. Generate Prisma client and push schema
pnpm exec prisma generate
pnpm exec prisma db push

# 6. Start the development server
pnpm dev
```

The app runs on [http://localhost:5000](http://localhost:5000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in every value. See the file for descriptions.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | 32+ char secret (generate with `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | ✅ | Your app's public URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Same as above (public) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | ☑️ | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | ☑️ | Google OAuth (optional) |
| `GITHUB_CLIENT_ID` | ☑️ | GitHub OAuth (optional) |
| `GITHUB_CLIENT_SECRET` | ☑️ | GitHub OAuth (optional) |

---

## Database

```bash
# Push schema to database
pnpm exec prisma db push

# Open Prisma Studio (database browser)
pnpm exec prisma studio

# Generate client after schema changes
pnpm exec prisma generate
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set all environment variables in Vercel dashboard
4. Deploy

> **Important**: Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `pnpm exec prisma db push` against the production database

### Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Find your credentials in the Dashboard
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (dashboard)/     # All authenticated pages
│   ├── api/             # API routes
│   ├── r/               # Public resume share pages
│   ├── layout.tsx       # Root layout + metadata
│   ├── sitemap.ts       # Dynamic sitemap
│   ├── robots.ts        # Robots.txt
│   └── manifest.ts      # PWA manifest
├── components/
│   ├── editor/          # Resume editor panels
│   ├── import/          # Import flow components
│   ├── layout/          # Shell, sidebar, nav
│   ├── recovery/        # Autosave recovery dialog
│   ├── resume/          # Resume preview + templates
│   ├── search/          # Global search
│   └── ui/              # Design system components
├── hooks/               # React hooks
├── lib/
│   ├── ai/              # Gemini integration + prompts
│   ├── auth.ts          # better-auth config
│   ├── db.ts            # Prisma client
│   ├── rate-limit.ts    # In-memory rate limiter
│   ├── resume-parser.ts # PDF/DOCX/TXT/JSON parser
│   └── virus-scan.ts    # Virus scan architecture stub
└── types/               # Shared TypeScript types
```

---

## Scripts

```bash
pnpm dev          # Start development server (port 5000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint check
pnpm db:push      # Push Prisma schema to database
pnpm db:generate  # Regenerate Prisma client
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
