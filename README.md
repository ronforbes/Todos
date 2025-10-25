# Shared Moments

A mobile-responsive web app that helps couples track experiences they want to share together. Partners maintain synchronized lists across categories, add items with optional deadlines, and capture memories with photos and notes.

## Features

- **Real-time Sync**: Changes appear instantly for both partners
- **Category Management**: Organize items into custom categories
- **Photo Uploads**: Add up to 5 photos per item with automatic compression
- **Memories**: View completed items in a dedicated memories view
- **Mobile-First Design**: Optimized for mobile with responsive layouts
- **Secure**: Row-level security ensures data privacy

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shared-moments
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_storage_setup.sql`
     - `supabase/migrations/003_seed_data.sql`
   - Enable Realtime for the `items` table (Database → Replication)

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key from Project Settings → API

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Usage

1. **Sign up** with email and password
2. **Create or join** a shared space using an invitation code
3. **Add items** to your lists with titles, categories, and optional dates
4. **Complete items** and add photos/notes to capture memories
5. **View memories** in the dedicated Memories tab

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for data mutations
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   └── onboarding/       # Couple pairing flow
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── supabase/         # Supabase client utilities
│   └── utils/            # Helper functions
├── supabase/
│   └── migrations/       # Database schema and policies
└── types/                # TypeScript type definitions
```

## License

MIT

## Contributing

This is a solo MVP project. Feel free to fork and customize for your own use!