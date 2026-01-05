# Social Deliverables Hub + Notion-Style Database

An internal web tool for managing social media deliverables and a collaborative Notion-style database tracker. **No external tools required** - everything works with Next.js + Supabase only.

## Features

### Social Deliverables Hub
- **Intake Form**: Required-field form to create deliverables with comprehensive metadata
- **Standardized Briefs**: Auto-generated, printable brief pages for each deliverable
- **Kanban Board**: Drag-and-drop pipeline board with WIP limits
- **Approvals & Revisions**: Complete approval workflow with version history
- **My Queue**: Personal view of assigned deliverables (Today / This Week / Overdue / Blocked)
- **In-App Notifications**: Notification center with real-time updates
- **Admin Settings**: Manage pipeline stages, WIP limits, and disclaimer library

### Notion-Style Database Tracker
- **Dynamic Columns**: Add, edit, reorder, and customize column types (text, numbers, dates, selects, checkboxes, URLs, email, phone, rich text)
- **Real-Time Collaboration**: Multiple users can edit simultaneously with live updates
- **Persistent Storage**: All data stored in PostgreSQL via Supabase - no data loss
- **Search & Filter**: Search across all columns to find data quickly
- **Mobile Friendly**: Responsive design that works on all devices

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **TailwindCSS** + **shadcn/ui** components
- **Supabase** (Postgres + Storage + Auth) - **NO PRISMA, NO EXTERNAL TOOLS**
- **Zod** validation + **React Hook Form**
- **@dnd-kit** for drag-and-drop Kanban board

## Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Clone and Install

```bash
# Install dependencies
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: No `DATABASE_URL` needed! We use Supabase directly, not Prisma.

### 4. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql` (Social Deliverables Hub)
   - `supabase/migrations/002_notion_database.sql` (Database Tracker)
4. Run the seed file: `supabase/seed.sql`

### 5. Set Up Your First Admin User

After running migrations and creating your first user account:

1. Go to SQL Editor in Supabase
2. Run this query (replace with your email):

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL - update after first deploy)
4. Deploy!

### Update Supabase Auth Redirect URLs

In your Supabase project:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to "Redirect URLs"
3. Add `https://your-vercel-url.vercel.app/auth/callback`

## Database Schema

The application uses Supabase PostgreSQL directly (no Prisma, no ORM):

### Social Deliverables Hub Tables
- `profiles` - User profiles with roles
- `deliverables` - Main deliverable records
- `versions` - Version history for deliverables
- `approvals` - Approval requests and decisions
- `comments` - Comments on deliverables
- `notifications` - In-app notifications
- `pipeline_stages` - Configurable pipeline stages
- `disclaimers` - Reusable disclaimer library
- `activity_log` - Activity feed

### Database Tracker Tables
- `database_tables` - Main database containers
- `database_columns` - Dynamic columns for each table
- `database_rows` - Data entries
- `database_cells` - Cell values (the actual data)

All database operations use Supabase client directly - no migrations tools, no ORM, no external dependencies.

## User Roles

- **Requester**: Can create deliverables, view their own, comment
- **Assignee**: Can update status, add versions, request approval, comment
- **Approver**: Can approve/request changes, comment
- **Admin**: Full access including user management, pipeline configuration, disclaimer library

## Key Features

### Deliverables Intake

- Required fields: title, platform, format, goal, due date, priority, complexity
- Optional fields: campaign, audience, CTA, copy direction, hashtags, notes
- Compliance flags and disclaimer requirements
- HIPAA-sensitive content warning with confirmation

### Kanban Board

- Drag-and-drop between pipeline stages
- WIP limits enforced per stage
- Visual indicators for overdue, blocked, priority
- Real-time updates

### Approvals Flow

- Assignees can request approval
- Approvers can approve or request changes
- Changes requested moves deliverable back to "In Progress"
- Revision round tracking with limit warnings

### Notifications

- Created when deliverables are assigned
- Approval requests and decisions
- Overdue detection (on-demand, no cron)
- Unread count in navbar
- Mark as read / mark all read

### Database Tracker

- Access at `/database` route
- Add columns with different types
- Add, edit, delete rows
- Real-time collaborative editing
- Search across all columns
- Mobile-responsive design

## File Structure

```
├── app/
│   ├── (protected)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── deliverables/
│   │   ├── board/
│   │   ├── my-queue/
│   │   ├── notifications/
│   │   ├── database/         # Database tracker
│   │   └── admin/
│   ├── api/                   # API routes (all use Supabase)
│   ├── auth/                  # Auth callbacks
│   └── login/                 # Login page
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── ...                    # Feature components
├── lib/
│   ├── supabase/              # Supabase clients (NO PRISMA)
│   ├── notifications.ts       # Notification helpers
│   └── types.ts               # TypeScript types
└── supabase/
    ├── migrations/             # SQL migrations (run in Supabase SQL Editor)
    └── seed.sql                # Seed data
```

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Important Notes

- ✅ **No Prisma** - All database operations use Supabase client directly
- ✅ **No DATABASE_URL needed** - Only Supabase environment variables required
- ✅ **No external tools** - Everything works with Next.js + Supabase
- ✅ **No migrations CLI** - Run SQL migrations directly in Supabase SQL Editor
- ✅ **Real-time updates** - Using Supabase real-time subscriptions
- ✅ **File uploads** - Scaffolded for Supabase Storage (requires additional setup)
- ✅ **Overdue detection** - Runs on-demand when loading pages, not via cron

## Troubleshooting

### "DATABASE_URL not found" Error
- This error should not occur - we don't use Prisma
- If you see this, check that you're not importing Prisma anywhere
- All database access is through Supabase client

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify RLS policies are set up correctly (run migrations)

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly
- Check build logs in Vercel dashboard

### Auth Not Working
- Verify Supabase redirect URLs are configured
- Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Ensure Supabase project allows your Vercel domain

## License

MIT
