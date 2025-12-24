/**
 * Supabase Configuration Checker
 * Checks your Supabase setup and configuration
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Supabase Configuration...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('\nMake sure .env.local has:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

console.log('✅ Environment variables found')
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabase() {
  const results = {
    connection: false,
    tables: {},
    auth: {},
    storage: {},
  }

  // 1. Test Connection
  console.log('1️⃣  Testing Supabase Connection...')
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    if (error && !error.message.includes('does not exist') && error.code !== 'PGRST116') {
      console.log(`   ❌ Connection failed: ${error.message}`)
      results.connection = false
    } else {
      console.log('   ✅ Connected to Supabase successfully')
      results.connection = true
    }
  } catch (err) {
    console.log(`   ❌ Connection error: ${err.message}`)
    results.connection = false
  }

  // 2. Check Database Tables
  console.log('\n2️⃣  Checking Database Tables...')
  const tables = [
    'user_profiles',
    'instructor_subscriptions', 
    'courses',
    'course_videos',
    'enrollments',
    'transactions',
    'transaction_splits',
    'videos' // Legacy table
  ]

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`   ⚠️  Table "${table}" does NOT exist`)
          results.tables[table] = false
        } else if (error.code === '42501') {
          console.log(`   ⚠️  Table "${table}" exists but no access (RLS issue)`)
          results.tables[table] = 'no_access'
        } else {
          console.log(`   ❌ Error checking "${table}": ${error.message}`)
          results.tables[table] = false
        }
      } else {
        console.log(`   ✅ Table "${table}" exists and accessible`)
        results.tables[table] = true
      }
    } catch (err) {
      console.log(`   ❌ Error checking "${table}": ${err.message}`)
      results.tables[table] = false
    }
  }

  // 3. Check Storage
  console.log('\n3️⃣  Checking Storage Buckets...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.log(`   ⚠️  Could not list buckets: ${error.message}`)
    } else {
      const videosBucket = buckets?.find(b => b.name === 'videos')
      if (videosBucket) {
        console.log(`   ✅ "videos" bucket exists`)
        console.log(`      Public: ${videosBucket.public ? 'Yes' : 'No'}`)
        results.storage.videos = true
        results.storage.videosPublic = videosBucket.public
      } else {
        console.log(`   ⚠️  "videos" bucket does NOT exist`)
        results.storage.videos = false
      }
    }
  } catch (err) {
    console.log(`   ⚠️  Could not check storage: ${err.message}`)
  }

  // 4. Check Recent Users
  console.log('\n4️⃣  Checking User Accounts...')
  try {
    // We can't directly query auth.users, but we can check user_profiles
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, role, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.log(`   ⚠️  Could not check users: ${error.message}`)
    } else if (profiles && profiles.length > 0) {
      console.log(`   ✅ Found ${profiles.length} user profile(s):`)
      profiles.forEach((profile, i) => {
        console.log(`      ${i + 1}. ${profile.full_name || 'No name'} (${profile.role}) - Created: ${new Date(profile.created_at).toLocaleDateString()}`)
      })
      results.auth.userCount = profiles.length
    } else {
      console.log(`   ℹ️  No user profiles found yet`)
      results.auth.userCount = 0
    }
  } catch (err) {
    console.log(`   ⚠️  Could not check users: ${err.message}`)
  }

  // 5. Summary and Recommendations
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  
  const missingTables = Object.entries(results.tables).filter(([_, exists]) => exists === false).map(([name]) => name)
  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing Tables: ${missingTables.join(', ')}`)
    console.log('   → Run supabase-setup.sql in Supabase SQL Editor')
  }

  if (!results.storage.videos) {
    console.log(`\n⚠️  Storage bucket "videos" is missing`)
    console.log('   → Create it in Supabase Dashboard → Storage')
  }

  console.log('\n📋 MANUAL CHECKS REQUIRED (in Supabase Dashboard):')
  console.log('\n5️⃣  Email Configuration:')
  console.log('   → Go to: Authentication → Settings → Email Auth')
  console.log('   → Check "Enable email confirmations" (ON/OFF)')
  console.log('   → Check SMTP Settings (configured or not)')
  
  console.log('\n6️⃣  Auth Logs:')
  console.log('   → Go to: Logs → Auth Logs')
  console.log('   → Look for email sending errors')
  console.log('   → Check for "Failed to send email" messages')
  
  console.log('\n7️⃣  Email Templates:')
  console.log('   → Go to: Authentication → Email Templates')
  console.log('   → Verify "Confirm signup" template exists')
  
  console.log('\n💡 QUICK FIX:')
  console.log('   To allow sign-in without email confirmation:')
  console.log('   → Authentication → Settings → Email Auth')
  console.log('   → Toggle OFF "Enable email confirmations"')
  console.log('   → Save')
  
  console.log('\n✅ Check complete!')
}

checkSupabase().catch(console.error)

