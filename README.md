# SquashPro Match Finder

A comprehensive web application for squash players to book courts, find matches, rate opponents, and get AI-powered coaching tips.

## Features

- **Court Booking**: Book squash courts with an interactive map
- **Find Match**: Discover and join open matches with other players
- **Player Profiles**: View player ratings and skill levels
- **Google OAuth**: Secure authentication via Google
- **AI Coach**: Get personalized coaching tips powered by Google Gemini
- **Real-time Updates**: Live match and booking updates via Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Build Tool**: Vite
- **Maps**: Leaflet
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account
- A [Google Cloud](https://console.cloud.google.com) account (for OAuth)
- A [Vercel](https://vercel.com) account (for deployment)

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/alfredang/SquashPro.git
cd SquashPro
npm install
```

### 2. Supabase Setup

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Configure:
   - **Name**: `squashpro`
   - **Database Password**: Generate and save securely
   - **Region**: Choose closest to your users (e.g., Singapore)
4. Click **Create new project** and wait for provisioning

#### 2.2 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query** and run these files in order:

**Step 1: Schema** - Copy contents of `supabase/schema.sql` and run

**Step 2: RLS Policies** - Copy contents of `supabase/rls_policies.sql` and run

**Step 3: Seed Data** - Copy contents of `supabase/seed.sql` and run

#### 2.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...` or `sb_publishable_...`)

### 3. Google OAuth Setup

#### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add **Authorized redirect URI**:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   (Get this URL from Supabase → Authentication → Providers → Google)
7. Save your **Client ID** and **Client Secret**

#### 3.2 Enable Google Provider in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your Google **Client ID** and **Client Secret**
4. Click **Save**

### 4. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Google Gemini API (optional, for AI coaching tips)
GEMINI_API_KEY=your-gemini-api-key
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vercel Deployment

### 1. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Add Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `GEMINI_API_KEY` = your Gemini API key (optional)
4. Redeploy for changes to take effect:
   ```bash
   vercel --prod
   ```

### 3. Configure Supabase for Production

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g., `https://squashpro.vercel.app`)
3. Add your Vercel URL to **Redirect URLs**

---

## Project Structure

```
SquashPro/
├── App.tsx                 # Main application component
├── index.tsx              # React entry point
├── index.html             # HTML template
├── types.ts               # TypeScript interfaces
├── components/
│   ├── MapContainer.tsx   # Leaflet map component
│   └── Rating.tsx         # Star rating component
├── contexts/
│   └── AuthContext.tsx    # Supabase auth context
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── services/
│   └── geminiService.ts   # Google Gemini API integration
└── supabase/
    ├── schema.sql         # Database table definitions
    ├── rls_policies.sql   # Row Level Security policies
    └── seed.sql           # Initial seed data
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `courts` | Squash court locations |
| `bookings` | Match bookings |
| `booking_invitations` | Match invitation system |
| `player_reviews` | Player ratings and reviews |

---

## Troubleshooting

### Blank page on load
- Check browser console for errors
- Verify `.env.local` has correct Supabase credentials
- Ensure `index.html` has the script tag: `<script type="module" src="/index.tsx"></script>`

### Google OAuth not working
- Verify redirect URI matches exactly in Google Cloud Console and Supabase
- Check that Google provider is enabled in Supabase
- Ensure Site URL and Redirect URLs are configured in Supabase Auth settings

### Database errors
- Run migrations in order: schema → rls_policies → seed
- Check RLS policies are enabled on all tables

---

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
