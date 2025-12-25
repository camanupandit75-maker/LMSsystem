# Diagnosing Email Confirmation Issue

## Why Emails Aren't Being Received

### Common Causes:

1. **Email Confirmation Disabled in Supabase**
   - Check: Authentication → Settings → Email Auth
   - If "Enable email confirmations" is OFF, emails won't be sent

2. **No Email Provider Configured**
   - Supabase needs an email provider to send emails
   - Default: Uses Supabase's built-in email (very limited)
   - Production: Should use SMTP or SendGrid

3. **Email Going to Spam**
   - Check spam/junk folder
   - Supabase emails often get filtered

4. **Email Rate Limits**
   - Free tier has email sending limits
   - May be throttled if too many requests

5. **Email Templates Not Configured**
   - Check: Authentication → Email Templates
   - Default templates should work, but custom ones might have issues

## How to Check Supabase Email Settings

### Step 1: Check Email Confirmation Setting
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Check if **"Enable email confirmations"** is ON or OFF

### Step 2: Check Email Provider
1. Still in **Authentication** → **Settings**
2. Scroll to **SMTP Settings** (if using custom SMTP)
3. Or check if using Supabase's default email service

### Step 3: Check Email Templates
1. Go to **Authentication** → **Email Templates**
2. Verify **Confirm signup** template exists
3. Check if templates are enabled

### Step 4: Check Supabase Logs
1. Go to **Logs** → **Auth Logs**
2. Look for email sending errors
3. Check for rate limiting messages

## Testing Email Delivery

### Option 1: Check Supabase Auth Logs
1. Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for entries when you signed up
3. Check for errors like:
   - "Failed to send email"
   - "Email rate limit exceeded"
   - "SMTP configuration error"

### Option 2: Test with Supabase CLI
```bash
# Check auth configuration
supabase status
```

### Option 3: Check User in Database
1. Go to **Authentication** → **Users**
2. Find your user account
3. Check:
   - Is `email_confirmed_at` NULL? (means email not confirmed)
   - Is `confirmed_at` NULL? (means not confirmed)
   - What's the `created_at` timestamp?

## Solutions

### Solution 1: Disable Email Confirmation (Development)
**Best for development/testing:**
1. Authentication → Settings → Email Auth
2. Toggle OFF "Enable email confirmations"
3. Users can sign in immediately without email

### Solution 2: Configure SMTP (Production)
**Best for production:**
1. Get SMTP credentials (Gmail, SendGrid, etc.)
2. Authentication → Settings → SMTP Settings
3. Enter SMTP configuration
4. Test email sending

### Solution 3: Use Supabase's Built-in Email
**Limited but works:**
- Supabase provides basic email service
- Check if it's enabled in your project
- May have rate limits on free tier

## Code to Check Email Status

Add this to your signup page to debug:

```typescript
// After signup
console.log('Auth data:', authData)
console.log('User email confirmed:', authData?.user?.email_confirmed_at)
console.log('User confirmed:', authData?.user?.confirmed_at)
```

## Quick Fix for Development

**Disable email confirmation:**
1. Supabase Dashboard
2. Authentication → Settings
3. Email Auth section
4. Toggle OFF "Enable email confirmations"
5. Save

This allows immediate sign-in without email verification.



