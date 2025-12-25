/**
 * Supabase Configuration Checker
 * Run this to diagnose email confirmation issues
 * 
 * Usage: npx tsx scripts/check-supabase-config.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Make sure .env.local has:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseConfig() {
  console.log('🔍 Checking Supabase Configuration...\n')

  // Check connection
  console.log('1. Testing Supabase Connection...')
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected)
      console.error('   ❌ Connection failed:', error.message)
    } else {
      console.log('   ✅ Connected to Supabase')
    }
  } catch (err: any) {
    console.error('   ❌ Connection error:', err.message)
  }

  // Check if tables exist
  console.log('\n2. Checking Database Tables...')
  const tables = ['user_profiles', 'instructor_subscriptions', 'courses', 'course_videos', 'enrollments']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`   ⚠️  Table "${table}" does not exist`)
        } else {
          console.log(`   ✅ Table "${table}" exists`)
        }
      } else {
        console.log(`   ✅ Table "${table}" exists`)
      }
    } catch (err: any) {
      console.log(`   ❌ Error checking "${table}":`, err.message)
    }
  }

  // Check auth users
  console.log('\n3. Checking Authentication...')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('   ℹ️  Not authenticated (this is normal if not logged in)')
    } else if (user) {
      console.log(`   ✅ Authenticated as: ${user.email}`)
      console.log(`   📧 Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   ✅ User confirmed: ${user.confirmed_at ? 'Yes' : 'No'}`)
    }
  } catch (err: any) {
    console.log('   ⚠️  Could not check auth status')
  }

  console.log('\n📋 Manual Checks Required:')
  console.log('\n4. Check Supabase Dashboard Settings:')
  console.log('   → Go to: https://supabase.com/dashboard/project/_/auth/settings')
  console.log('   → Check "Enable email confirmations" setting')
  console.log('   → Check SMTP configuration (if using custom SMTP)')
  
  console.log('\n5. Check Auth Logs:')
  console.log('   → Go to: https://supabase.com/dashboard/project/_/logs/auth')
  console.log('   → Look for email sending errors')
  console.log('   → Check for rate limiting messages')

  console.log('\n6. Check Email Templates:')
  console.log('   → Go to: https://supabase.com/dashboard/project/_/auth/templates')
  console.log('   → Verify "Confirm signup" template exists')
  console.log('   → Check if templates are enabled')

  console.log('\n✅ Configuration check complete!')
  console.log('\n💡 Tip: For development, disable email confirmation in Supabase settings')
  console.log('   This allows immediate sign-in without email verification.')
}

checkSupabaseConfig().catch(console.error)



