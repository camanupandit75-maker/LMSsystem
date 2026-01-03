# Supabase Setup Guide

## Quick Setup Steps

### 1. Create a Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: Your project name (e.g., "LMS System")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

### 2. Get Your API Keys (1 minute)

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - **Project URL** → Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public** key → Copy this (long string starting with `eyJ...`)

### 3. Update `.env.local` File

Open `.env.local` in your project root and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # Your Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                # Your anon key
```

### 4. Set Up Database (2 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### 5. Create Storage Bucket (2 minutes)

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name it: `videos`
4. Make it **Public** (toggle ON)
5. Click **"Create bucket"**

### 6. Restart Your Dev Server

Stop your current server (Ctrl+C) and restart:

```bash
npm run dev
```

## ✅ Verification

After setup, you should be able to:

1. ✅ Visit http://localhost:3000 (no errors)
2. ✅ Click "Sign Up" and create an account
3. ✅ Sign in with your account
4. ✅ Upload a video from the Upload page
5. ✅ See your videos in the Dashboard

## 🆘 Troubleshooting

### Error: "Your project's URL and Key are required"
- Make sure `.env.local` exists in the project root
- Check that values don't have quotes around them
- Restart the dev server after changing `.env.local`

### Error: "relation 'videos' does not exist"
- Make sure you ran `supabase-setup.sql` in SQL Editor
- Check that the `videos` table was created (go to Table Editor)

### Error: "Bucket not found" or upload fails
- Make sure the `videos` bucket exists in Storage
- Verify the bucket is set to **Public**
- Check storage policies are set correctly

### Can't sign up/sign in
- Check your Supabase project is active (not paused)
- Verify API keys are correct in `.env.local`
- Check browser console for detailed errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

**Need help?** Check the main [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md) for more details.








