# Kateb - Arabic Content Generation Platform

AI-powered Arabic content generation with Firebase Authentication and Supabase PostgreSQL.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Firebase Authentication
- Supabase (PostgreSQL)
- Tailwind CSS
- Anthropic Claude AI

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI (Optional)
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified TIMESTAMP,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'FREE',
  usage_count INT DEFAULT 0,
  usage_limit INT DEFAULT 10,
  dialect_preference TEXT DEFAULT 'EGYPTIAN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER',
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected pages
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # UI components
├── lib/
│   ├── firebase/         # Firebase config & auth
│   ├── db/               # Supabase client
│   └── validations/      # Zod schemas
└── types/                # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## License

MIT
