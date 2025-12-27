# ⚡ QUICK FIX - Create .env.local File

## The Problem
Your app is showing: "Your project's URL and Key are required to create a Supabase client!"

This means the `.env.local` file is missing.

## The Solution - Copy & Paste This:

### Step 1: Open Terminal in VS Code
Press `` Ctrl+` `` (or View → Terminal)

### Step 2: Run This Exact Command:

```bash
echo 'NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key' > .env.local
```

### Step 3: Verify It Was Created:

```bash
cat .env.local
```

You should see the placeholder values.

### Step 4: Get Your Real Supabase Credentials

1. **Go to:** https://supabase.com/dashboard
2. **Click:** "New Project" (or select existing)
3. **Fill in:** Project name and password
4. **Wait:** 2-3 minutes for project to initialize
5. **Go to:** Settings → API (left sidebar)
6. **Copy:**
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Edit .env.local

Open `.env.local` in VS Code and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Use your ACTUAL values from Supabase!

### Step 6: Restart Server

Stop server (Ctrl+C) and run:
```bash
npm run dev
```

## ✅ Done!

Your app should now work. If you still see errors, make sure:
- ✅ `.env.local` exists in project root
- ✅ Values don't have quotes around them
- ✅ No extra spaces before/after values
- ✅ You restarted the server after creating the file

---

**Need help?** See `SETUP_SUPABASE.md` for detailed database setup.





