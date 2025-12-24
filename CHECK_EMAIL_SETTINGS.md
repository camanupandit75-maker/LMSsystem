# How to Check Why Email Confirmation Isn't Working

## Step-by-Step Diagnosis

### Step 1: Check Supabase Email Settings

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **Authentication** in the left sidebar
   - Click **Settings** (gear icon)

2. **Check Email Auth Settings**
   - Scroll to **"Email Auth"** section
   - Look for **"Enable email confirmations"**
   - **Is it ON or OFF?**
     - If **OFF**: Emails won't be sent (this is why you're not receiving them)
     - If **ON**: Continue to next step

3. **Check SMTP Configuration**
   - Still in Authentication → Settings
   - Scroll to **"SMTP Settings"**
   - **Is SMTP configured?**
     - If **No SMTP**: Supabase uses its built-in email service (limited, may not work)
     - If **Yes SMTP**: Check if credentials are correct

### Step 2: Check Supabase Auth Logs

1. **Go to Logs**
   - In Supabase Dashboard, click **Logs** in left sidebar
   - Click **Auth Logs**

2. **Look for Your Signup Event**
   - Find the log entry when you signed up
   - Look for errors like:
     - "Failed to send email"
     - "Email rate limit exceeded"
     - "SMTP connection failed"
     - "Email template not found"

3. **Check Email Status**
   - Look for entries showing email sending attempts
   - Check if emails were queued or failed

### Step 3: Check User in Database

1. **Go to Authentication → Users**
   - Find your user account (by email)
   - Check these fields:
     - **email_confirmed_at**: Should be NULL if not confirmed
     - **confirmed_at**: Should be NULL if not confirmed
     - **created_at**: When account was created

2. **What This Tells You**
   - If both are NULL: Email confirmation is required but not completed
   - If email_confirmed_at has a date: Email was confirmed
   - If confirmed_at has a date: User is confirmed

### Step 4: Check Browser Console

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Look for logs** when you sign up:
   - "Signup Response:" - Shows user creation status
   - "Email Confirmation Status:" - Shows if email is confirmed
   - Any error messages

### Step 5: Common Issues & Solutions

#### Issue 1: Email Confirmations Disabled
**Symptom**: No emails sent at all
**Solution**: 
- Go to Authentication → Settings → Email Auth
- Toggle ON "Enable email confirmations"
- OR toggle OFF to allow sign-in without email (development)

#### Issue 2: No SMTP Configured
**Symptom**: Emails fail to send
**Solution**:
- Configure SMTP (Gmail, SendGrid, etc.)
- OR disable email confirmation for development

#### Issue 3: Email in Spam
**Symptom**: Email sent but not received
**Solution**:
- Check spam/junk folder
- Check email filters
- Whitelist Supabase emails

#### Issue 4: Rate Limiting
**Symptom**: "Email rate limit exceeded" in logs
**Solution**:
- Wait a few minutes
- Upgrade Supabase plan
- Configure SMTP for higher limits

#### Issue 5: Email Template Missing
**Symptom**: "Email template not found" in logs
**Solution**:
- Go to Authentication → Email Templates
- Ensure "Confirm signup" template exists
- Check template is enabled

## Quick Fix for Development

**To allow sign-in without email confirmation:**

1. Supabase Dashboard
2. Authentication → Settings
3. Email Auth section
4. Toggle OFF "Enable email confirmations"
5. Click Save

**Result**: Users can sign in immediately after signup, no email needed.

## Production Setup

**For production, you should:**

1. **Enable email confirmations** (ON)
2. **Configure SMTP**:
   - Gmail SMTP
   - SendGrid
   - AWS SES
   - Or other SMTP provider
3. **Test email delivery**
4. **Monitor Auth Logs** for email issues

## Check Your Current Status

After signing up, check the browser console for:
- "Signup Response" log
- "Email Confirmation Status" log
- Any error messages

This will tell you exactly what's happening with your email confirmation.

