# Vercel Deployment Guide

Your code has been successfully pushed to GitHub at: https://github.com/draphael123/social-media-project.git

## Deploy to Vercel

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select `draphael123/social-media-project`
5. Click **"Import"**

### Step 2: Configure Project Settings

Vercel will auto-detect Next.js. Keep these settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (root)
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install` (or `npm install`)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

**Important**: Replace with your actual Supabase credentials and your Vercel URL (you'll get this after first deployment).

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://your-app-name.vercel.app`

### Step 5: Update Supabase Auth Settings

After deployment, update your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app` (for development)
4. Add to **Site URL**:
   - `https://your-app-name.vercel.app`

### Step 6: Update Environment Variables (if needed)

If you need to update the `NEXT_PUBLIC_APP_URL` after deployment:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy (or it will auto-redeploy on next push)

## Automatic Deployments

Vercel will automatically deploy:
- Every push to `main` branch
- Pull requests (as preview deployments)

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly
- Check build logs in Vercel dashboard

### Auth Not Working
- Verify Supabase redirect URLs are configured
- Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Ensure Supabase project allows your Vercel domain

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify RLS policies are set up correctly

## Next Steps After Deployment

1. ✅ Set your first user as admin in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. ✅ Test the application:
   - Sign up/login
   - Create a deliverable
   - Test the Kanban board
   - Test approvals flow

3. ✅ Monitor:
   - Check Vercel dashboard for deployment status
   - Monitor Supabase dashboard for database activity
   - Check browser console for any errors

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

