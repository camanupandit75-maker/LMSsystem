# Quick Start Guide

Get your LMS up and running in 10 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd "LMS system"
npm install
```

## Step 2: Set Up Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait for project to be ready

2. **Get API Keys**
   - Go to Project Settings > API
   - Copy `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Create Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Click "New bucket"
   - Name it `videos`
   - Make it **Public**
   - Click "Create bucket"

4. **Set Up Database**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase-setup.sql`
   - Click "Run"
   - Verify the `videos` table was created

## Step 3: Configure Environment (1 minute)

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run the App (2 minutes)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test It Out!

1. **Sign Up**: Click "Sign Up" and create an account
2. **Upload**: Go to "Upload" and drag & drop a video
3. **View**: Check your dashboard to see your videos
4. **Watch**: Click on a video to play it

## ✅ You're Done!

Your LMS is now running locally. To deploy:

1. Push to GitHub
2. Deploy to Vercel (or your preferred platform)
3. Add environment variables in deployment settings
4. Deploy!

## 🆘 Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Verify all environment variables are set correctly
- Make sure the Supabase bucket is public
- Check browser console for errors

## 🎯 Next Steps

- Customize the theme in `app/globals.css`
- Add your OpenAI API key for AI features
- Deploy to production
- Add more features!

Happy coding! 🚀

