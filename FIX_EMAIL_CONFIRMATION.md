# Fix: "Error sending confirmation email"

## Quick Fix Options

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Find **"Enable email confirmations"**
5. **Toggle it OFF**
6. Click **Save**

This allows users to sign up without email confirmation.

### Option 2: Configure Email Templates (For Production)

1. Go to **Authentication** → **Email Templates**
2. Configure your email provider:
   - Use Supabase's built-in email (limited)
   - Or configure SMTP (recommended for production)

### Option 3: Use Magic Link (Alternative)

Update signup to use magic link instead of password:
```typescript
await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

## What I Fixed

I've updated the signup flow to:
- ✅ Continue even if email sending fails (user is still created)
- ✅ Show a more helpful error message
- ✅ Still create the user profile and subscription
- ✅ Allow login even if email confirmation failed

## Testing

After disabling email confirmation:
1. Try signing up again
2. You should be redirected to the dashboard immediately
3. No email confirmation needed

## Production Setup

For production, you should:
1. Enable email confirmation
2. Configure SMTP email provider
3. Set up proper email templates
4. Test email delivery







