# Shared Moments - Setup Guide

## Supabase Setup

1. **Create a new Supabase project** at https://supabase.com

2. **Run the database migrations** in the SQL Editor (in order):
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_storage_setup.sql`
   - Execute `supabase/migrations/003_seed_data.sql`
   - **IMPORTANT**: Execute `supabase/migrations/006_fix_rls_public_schema.sql` (fixes infinite recursion - creates function in public schema)
   - Note: Skip migrations 004 and 005 - use 006 instead as it's the correct fix

3. **Enable Realtime** for the `items` table:
   - Go to Database → Replication
   - Enable replication for the `items` table

4. **Get your project credentials**:
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

5. **Create `.env.local` file** in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The app is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables
4. Deploy

## Features

- Email/password authentication
- Couple pairing via invitation codes
- Real-time synchronized lists
- Category management
- Photo uploads with compression
- Active lists and memories views
