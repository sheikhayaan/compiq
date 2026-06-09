# CompIQ — Compensation Intelligence Platform

> Real compensation data across levels, roles, and companies.
> Know your worth, down to the level.

🔗 Live Demo: https://compiq-three.vercel.app

## What is CompIQ?

CompIQ is a compensation intelligence platform built as an
alternative to levels.fyi for the global market. Unlike generic
salary websites that compare by job title, CompIQ compares by
**level** — because a Google L5 and Amazon L6 are the same
seniority, but most platforms don't show that.

## Core Features

- 🔍 **Salary Intelligence** — Browse 300+ verified salary entries
  filtered by company, role, level, location, experience
- 🏢 **Company Profiles** — Deep dive into compensation at any company
  with level progression ladders and comp breakdowns
- ⚖️ **Side-by-side Comparison** — Compare Google L5 vs Meta E5 vs
  Amazon L6 with median TC, base, bonus, equity breakdown
- 📊 **Level Taxonomy** — See how levels map across companies
  (Google L5 = Meta E5 = Amazon L6 = Microsoft 63)
- ✉️ **Salary Submission** — Submit your own salary anonymously
  with duplicate detection and validation
- 🔐 **Google Authentication** — Secure login with NextAuth

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, TailwindCSS |
| Backend | Next.js API Routes, TypeScript |
| Database | PostgreSQL (Neon) + Prisma ORM 7 |
| Auth | NextAuth.js + Google OAuth |
| Deployment | Vercel |

## Architecture Decisions

### Why level-based comparison?
Most platforms compare by title ("Senior Engineer") but titles
vary wildly across companies. Levels are standardized within
companies and map to real seniority. CompIQ normalizes all levels
to Junior/Mid/Senior/Staff/Principal for cross-company comparison.

### Why Prisma + Neon?
Neon provides serverless PostgreSQL that scales to zero — perfect
for a demo platform. Prisma gives type-safe DB access and easy
migrations.

### Company Normalization
"google inc", "Google LLC", "alphabet" all resolve to "Google"
via an aliases system. This prevents duplicate company entries
from user submissions.

### Total Compensation Calculation
TC = Base Salary + Annual Bonus + Annual Equity (RSU vesting)
Missing bonus/equity defaults to 0, never null.

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | /api/salaries | Filter/search salaries |
| POST | /api/salaries | Submit new salary (auth required) |
| GET | /api/companies | List all companies with stats |
| GET | /api/companies/[slug] | Company detail + level breakdown |
| GET | /api/compare | Side-by-side comparison data |
| GET | /api/levels | Level taxonomy |
| GET | /api/stats | Platform statistics |

## Database Schema

Key models:
- **Company** — name, slug, aliases[], industry
- **Salary** — companyId, role, level, normalizedLevel,
  levelOrder, baseSalary, bonus, equity, totalComp,
  location, country, currency, yearsExp
- **LevelMap** — company, rawLevel, normalizedLevel, levelOrder
- **User** — NextAuth user with Google OAuth

## Local Development

```bash
git clone https://github.com/sheikhayaan/compiq
cd compiq
npm install
cp .env.example .env.local
# Add your DATABASE_URL, NEXTAUTH_SECRET, GOOGLE credentials
npx prisma db push
npx prisma db seed
npm run dev
```

## Edge Cases Handled

- Negative salary values → rejected with 400
- Duplicate submission within 30 days → 409 Conflict
- Unknown company names → normalized via aliases
- Missing bonus/equity → defaults to 0
- Invalid level for company → mapped to closest normalized level
- Unauthenticated submission → 401 Unauthorized

## Research

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | CompIQ |
|---|---|---|---|---|---|
| Level-based comp | ✅ | ❌ | ❌ | ❌ | ✅ |
| Total comp breakdown | ✅ | ⚠️ | ❌ | ⚠️ | ✅ |
| Company normalization | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Level equivalency map | ✅ | ❌ | ❌ | ❌ | ✅ |
| India market data | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Multi-country support | ⚠️ | ❌ | ❌ | ✅ | ✅ |
| Anonymous submission | ✅ | ✅ | ❌ | ✅ | ✅ |
| Google OAuth | ❌ | ❌ | ❌ | ❌ | ✅ |

Built for the CompIQ internship assignment — Full Stack Engineer, Track C.
