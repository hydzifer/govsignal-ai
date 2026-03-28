# GovSignal AI

AI policy monitoring tool for B2B customers. Track EU & US AI regulation with daily briefings tailored to your AI product category.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Payments**: Stripe
- **Email**: Resend
- **AI**: Anthropic Claude (classification, impact analysis, summaries)
- **Styling**: Tailwind CSS

## Features

- 15+ government RSS sources monitored automatically
- AI-powered article classification and impact analysis
- Daily digest emails with role-specific briefings
- Watchlist alerts for tracked topics
- Subscription management via Stripe
- Export tools (Markdown, clipboard)

## Setup

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- Clerk account
- Stripe account
- Resend account
- Anthropic API key

### Installation

```bash
git clone <repo-url>
cd govsignal-ai
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Service | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Yes |
| `CLERK_SECRET_KEY` | Clerk | Yes |
| `ANTHROPIC_API_KEY` | Anthropic | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Yes |
| `STRIPE_SECRET_KEY` | Stripe | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Yes |
| `STRIPE_PRICE_ID` | Stripe | Yes |
| `RESEND_API_KEY` | Resend | Yes |
| `TRIGGER_API_KEY` | Trigger.dev | Optional |
| `TRIGGER_API_URL` | Trigger.dev | Optional |

### Database

Run `supabase/schema.sql` in your Supabase SQL Editor to create all tables.

Then add the Stripe columns:

```sql
ALTER TABLE user_preferences
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/ingestion/fetch` | GET | Fetch & classify articles from RSS |
| `/api/onboarding` | POST | Save user preferences |
| `/api/watchlist` | GET/POST/DELETE | Manage watchlists |
| `/api/watchlist/articles` | GET | Articles by topic |
| `/api/settings` | GET/PATCH | User preferences |
| `/api/checkout` | POST | Create Stripe checkout |
| `/api/billing-portal` | POST | Stripe customer portal |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/email/send-digest` | POST | Send daily digest emails |
| `/api/email/send-alerts` | POST | Send watchlist alerts |
| `/api/email/unsubscribe` | GET | One-click unsubscribe |

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Post-deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production URL
2. Configure Stripe webhook: `https://yourdomain.com/api/webhooks/stripe`
3. Verify sending domain in Resend
4. Set up cron for daily digest (7am UTC): `POST /api/email/send-digest`
5. Set up cron for article ingestion (every 4h): `GET /api/ingestion/fetch`
