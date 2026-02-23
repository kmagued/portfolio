# Sport × Code — Portfolio

Personal portfolio for Khaled Magued, built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

### Portfolio (Public)
- Hero, About, Projects, Tech Stack, Contact sections
- Interactive quote request form (saves to Supabase)
- Project mockups for Clash, Beachamp, and FL
- Scroll reveal animations, fully responsive

### Admin Dashboard (`/admin`)
- **Quotes Management** — View and update status of incoming quote requests
- **Projects Tracking** — Track active projects, budgets, and payment status
- **Financial Overview** — Income vs expenses, net profit tracking
- **Auth** — Supabase Auth (email/password login)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run: `supabase/migrations/001_initial.sql`
3. Go to **Authentication > Users** and create your admin user

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key from **Settings > API**.

### 4. Run
```bash
npm run dev
```
- Portfolio: http://localhost:3000
- Admin: http://localhost:3000/admin

## Database Tables
| Table | Purpose |
|---|---|
| `quotes` | Quote requests from portfolio form |
| `projects` | Project tracking |
| `expenses` | Expense tracking |
| `income` | Revenue tracking |

## Deploy to Vercel
```bash
vercel --prod
```
Add env variables in Vercel dashboard.
