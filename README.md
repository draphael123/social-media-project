# Social Deliverables Hub

An internal web tool for managing social media deliverables, reducing overwhelm by standardizing intake, auto-generating briefs, tracking work in a pipeline, and centralizing approvals.

## Features

- **Intake Form**: Required-field form to create deliverables with comprehensive metadata
- **Standardized Briefs**: Auto-generated, printable brief pages for each deliverable
- **Kanban Board**: Drag-and-drop pipeline board with WIP limits
- **Approvals & Revisions**: Complete approval workflow with version history
- **My Queue**: Personal view of assigned deliverables (Today / This Week / Overdue / Blocked)
- **In-App Notifications**: Notification center with real-time updates
- **Admin Settings**: Manage pipeline stages, WIP limits, and disclaimer library

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **TailwindCSS** + **shadcn/ui** components
- **Supabase** (Postgres + Storage + Auth)
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

### 4. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
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
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Deploy!

### Update Supabase Auth Redirect URLs

In your Supabase project:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to "Redirect URLs"
3. Add `https://your-vercel-url.vercel.app/auth/callback`

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles with roles
- `deliverables` - Main deliverable records
- `versions` - Version history for deliverables
- `approvals` - Approval requests and decisions
- `comments` - Comments on deliverables
- `notifications` - In-app notifications
- `pipeline_stages` - Configurable pipeline stages
- `disclaimers` - Reusable disclaimer library
- `activity_log` - Activity feed

See `supabase/migrations/001_initial_schema.sql` for the complete schema with RLS policies.

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

## File Structure

```
├── app/
│   ├── (protected)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── deliverables/
│   │   ├── board/
│   │   ├── my-queue/
│   │   ├── notifications/
│   │   └── admin/
│   ├── api/                   # API routes
│   ├── auth/                  # Auth callbacks
│   └── login/                 # Login page
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── ...                    # Feature components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── notifications.ts       # Notification helpers
│   └── types.ts               # TypeScript types
└── supabase/
    ├── migrations/             # Database migrations
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

## Notes

- File uploads via Supabase Storage are scaffolded but require additional setup
- User assignment in quick actions uses text input; in production, use a user selector dropdown
- Overdue detection runs on-demand when loading pages, not via cron
- All authentication and authorization handled via Supabase RLS policies

## License

MIT

