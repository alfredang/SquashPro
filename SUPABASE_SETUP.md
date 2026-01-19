# Supabase Setup Guide

This guide walks you through setting up Supabase for the SquashPro application.

## Prerequisites

- A Google account (for signing up to Supabase and Google OAuth)
- GitHub account (recommended for Supabase sign-up)

## Step 1: Create Supabase Account

1. Visit [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with **GitHub** (recommended) or email

## Step 2: Create New Project

1. Once logged in, click **"New Project"**
2. Select your organization (or create a new one if this is your first project)
3. Configure your project:
   - **Name**: `squashpro` (or your preference)
   - **Database Password**: Click "Generate a password" and **SAVE THIS PASSWORD** securely
   - **Region**: Select **Southeast Asia (Singapore)** for best performance
   - **Pricing Plan**: **Free** (sufficient for development and small-scale production)
4. Click **"Create new project"**
5. Wait 1-2 minutes for your project to be provisioned

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) in the sidebar
2. Navigate to **API** section
3. Copy the following values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon** **public** key (long string starting with `eyJ...`)

## Step 4: Run Database Migrations

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New query"**
3. Run the migrations in this order:

### 4.1 Create Schema

1. Open `supabase/schema.sql` from your project
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
5. Verify success message appears

### 4.2 Set Up Row Level Security

1. Click **"New query"** again
2. Open `supabase/rls_policies.sql`
3. Copy and paste contents into SQL Editor
4. Click **"Run"**
5. Verify success

### 4.3 Seed Initial Data

1. Click **"New query"** again
2. Open `supabase/seed.sql`
3. Copy and paste contents into SQL Editor
4. Click **"Run"**
5. Verify courts were created by navigating to **Table Editor** → **courts** table

## Step 5: Configure Google OAuth

### 5.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one:
   - Click project dropdown at the top
   - Click **"New Project"**
   - Name: `squashpro-auth`
   - Click **"Create"**
3. Enable Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click and press **"Enable"**
4. Create OAuth Consent Screen:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** user type
   - Click **"Create"**
   - Fill in:
     - **App name**: `SquashPro`
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"Save and Continue"** through the remaining steps
5. Create OAuth Client ID:
   - Go to **APIs & Services** → **Credentials**
   - Click **"+ Create Credentials"** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `SquashPro Web Client`
   - **Authorized redirect URIs**: Add the callback URL from Supabase (see next section)
   - Click **"Create"**
   - **SAVE** your **Client ID** and **Client Secret**

### 5.2 Get Supabase Redirect URI

1. Go back to your Supabase project
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. The redirect URL is shown at the top: `https://[your-project-ref].supabase.co/auth/v1/callback`
5. **Copy this URL** and add it to Google OAuth settings (step 5.1, Authorized redirect URIs)

### 5.3 Configure Google Provider in Supabase

1. In Supabase, still in **Authentication** → **Providers** → **Google**
2. Toggle **"Enable Sign in with Google"** to ON
3. Paste your **Client ID** from Google
4. Paste your **Client Secret** from Google
5. Click **"Save"**

## Step 6: Configure Local Environment

1. In your project root, create a file named `.env.local`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

3. Replace the values with your actual Project URL and anon key from Step 3
4. **Important**: Never commit `.env.local` to git (already in `.gitignore`)

## Step 7: Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. Verify you see these tables:
   - `profiles`
   - `courts`
   - `bookings`
   - `booking_invitations`
   - `player_reviews`
3. Click on **courts** table and verify 3 Singapore courts are listed
4. Go to **Authentication** → **Policies** and verify RLS policies are active

## Step 8: Enable Realtime (Optional but Recommended)

1. In Supabase, navigate to **Database** → **Replication**
2. Find **supabase_realtime** publication
3. Verify that `bookings` and `booking_invitations` tables are listed
4. If not, they were already added by the seed script

## Next Steps

Your Supabase backend is now fully configured! Next:

1. Install the Supabase client in your frontend project
2. Integrate authentication and data fetching

See the main README for development instructions.

## Troubleshooting

### Issue: SQL queries fail to run

- **Solution**: Make sure to run migrations in order (schema → policies → seed)
- Check for any error messages in the SQL Editor

### Issue: Google OAuth not working

- **Solution**: Double-check redirect URI matches exactly between Google Cloud Console and Supabase
- Ensure Google+ API is enabled in Google Cloud Console
- Verify OAuth consent screen is published (not in testing mode with restricted users)

### Issue: Can't see tables in Table Editor

- **Solution**: Refresh the page, tables may take a moment to appear
- Verify schema.sql ran successfully without errors

### Issue: RLS policies blocking all access

- **Solution**: Check that you're authenticated when testing
- Use the SQL Editor to temporarily disable RLS for debugging: `alter table [table_name] disable row level security;`
- Re-enable after debugging: `alter table [table_name] enable row level security;`
