# Supabase Configuration Checklist

Use this checklist to verify your Supabase setup and diagnose email issues.

## ✅ Quick Checklist

### 1. Environment Variables
- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Values don't have quotes around them
- [ ] No extra spaces before/after values

### 2. Database Tables
- [ ] `user_profiles` table exists
- [ ] `instructor_subscriptions` table exists
- [ ] `courses` table exists
- [ ] `course_videos` table exists
- [ ] `enrollments` table exists
- [ ] `transactions` table exists
- [ ] `transaction_splits` table exists

### 3. Authentication Settings
- [ ] Go to: **Authentication → Settings**
- [ ] Check **"Enable email confirmations"**:
  - [ ] **ON** = Emails will be sent (requires email provider)
  - [ ] **OFF** = No emails sent, immediate sign-in (development)
- [ ] Check **SMTP Settings**:
  - [ ] Configured (for production)
  - [ ] Not configured (uses Supabase's limited email service)

### 4. Email Templates
- [ ] Go to: **Authentication → Email Templates**
- [ ] **"Confirm signup"** template exists
- [ ] Templates are enabled
- [ ] No errors in template configuration

### 5. Storage Bucket
- [ ] Go to: **Storage**
- [ ] `videos` bucket exists
- [ ] Bucket is set to **Public**
- [ ] Storage policies are configured

### 6. Row Level Security (RLS)
- [ ] RLS is enabled on all tables
- [ ] Policies are created for:
  - [ ] `user_profiles`
  - [ ] `instructor_subscriptions`
  - [ ] `courses`
  - [ ] `course_videos`
  - [ ] `enrollments`
  - [ ] `transactions`
  - [ ] `transaction_splits`

## 🔍 How to Check Each Item

### Check Environment Variables
```bash
# In your terminal, run:
cat .env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Check Database Tables
1. Go to **Supabase Dashboard → Table Editor**
2. You should see all tables listed
3. If missing, run `supabase-setup.sql` in SQL Editor

### Check Authentication Settings
1. **Authentication → Settings → Email Auth**
   - **Enable email confirmations**: Check if ON/OFF
   - **Secure email change**: Optional
   - **Double confirm email changes**: Optional

2. **Authentication → Settings → SMTP Settings**
   - Check if SMTP is configured
   - If not, Supabase uses built-in email (limited)

### Check Auth Logs
1. Go to **Logs → Auth Logs**
2. Look for entries when you signed up
3. Check for errors:
   - "Failed to send email"
   - "Email rate limit exceeded"
   - "SMTP connection failed"

### Check Email Templates
1. Go to **Authentication → Email Templates**
2. Verify these templates exist:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## 🐛 Common Issues & Fixes

### Issue: "Enable email confirmations" is OFF
**Symptom**: No emails sent, account created but can't sign in
**Fix**: 
- Toggle ON if you want email confirmation
- OR keep OFF for development (allows immediate sign-in)

### Issue: No SMTP Configured
**Symptom**: Emails fail to send
**Fix**: 
- Configure SMTP (Gmail, SendGrid, etc.)
- OR disable email confirmation for development

### Issue: Email in Spam
**Symptom**: Email sent but not in inbox
**Fix**: 
- Check spam/junk folder
- Whitelist Supabase emails

### Issue: Rate Limiting
**Symptom**: "Email rate limit exceeded" in logs
**Fix**: 
- Wait a few minutes
- Configure SMTP for higher limits

## 🚀 Quick Fix for Development

**To allow sign-in without email confirmation:**

1. Supabase Dashboard
2. **Authentication → Settings**
3. Scroll to **Email Auth** section
4. Toggle **OFF** "Enable email confirmations"
5. Click **Save**

**Result**: Users can sign in immediately after signup.

## 📊 Run Diagnostic Script

You can also run the diagnostic script:

```bash
# Install tsx if needed
npm install -g tsx

# Run the checker
npx tsx scripts/check-supabase-config.ts
```

This will check:
- ✅ Supabase connection
- ✅ Database tables
- ✅ Authentication status
- ⚠️  Manual checks needed

## 📝 Next Steps

After checking all items:

1. **If email confirmations are OFF**: 
   - Sign up should work immediately
   - You can sign in right away

2. **If email confirmations are ON**:
   - Check Auth Logs for email errors
   - Configure SMTP if needed
   - Or disable for development

3. **If tables are missing**:
   - Run `supabase-setup.sql` in SQL Editor
   - Verify all tables are created

4. **If RLS policies are missing**:
   - Check `supabase-setup.sql` for policy creation
   - Run the SQL script again if needed

