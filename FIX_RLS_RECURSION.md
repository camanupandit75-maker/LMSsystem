# Fix: Infinite Recursion in RLS Policies

## Problem
You're seeing: **"infinite recursion detected in policy for relation 'user_profiles'"**

This happens when RLS policies create a circular reference.

## Solution

### Step 1: Run the Fixed SQL Script

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New query"**
3. Copy and paste the **ENTIRE** contents of `supabase-setup-fixed.sql`
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

This will:
- ✅ Drop the problematic policies
- ✅ Create correct RLS policies (no recursion)
- ✅ Set up all required tables
- ✅ Create indexes and triggers

### Step 2: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Name: `videos`
4. Make it **Public** (toggle ON)
5. Click **"Create bucket"**

### Step 3: Verify Fix

1. Go back to: `http://localhost:3000/admin/check-supabase`
2. Click **"Run Checks Again"**
3. All errors should be resolved!

## What Was Fixed

### Before (Causing Recursion):
- Policies on `user_profiles` might have been checking something that required querying `user_profiles` again
- This created an infinite loop

### After (Fixed):
- Simple, direct policies that don't reference `user_profiles` in a circular way
- Users can view their own profile: `auth.uid() = id` (no recursion)
- Users can view public profiles: `true` (allows viewing other users' names/roles)
- All other tables have proper, non-recursive policies

## Key Changes

1. **user_profiles policies**:
   - Simple `auth.uid() = id` check (no recursion)
   - Public profile viewing allowed (for showing instructor names)

2. **All other tables**:
   - Policies check `auth.uid()` directly or use EXISTS with courses table
   - No circular references

3. **Proper foreign keys**:
   - All relationships properly defined
   - Cascade deletes configured

## After Running the Fix

You should see:
- ✅ All tables exist
- ✅ No recursion errors
- ✅ Can query user_profiles
- ✅ Can create accounts
- ✅ Can sign in

## If Issues Persist

1. **Check Supabase Logs**:
   - Go to **Logs → Postgres Logs**
   - Look for any errors

2. **Verify Policies**:
   - Go to **Authentication → Policies**
   - Check that policies are created correctly

3. **Test Connection**:
   - Refresh the check page
   - All checks should pass


