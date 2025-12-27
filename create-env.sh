#!/bin/bash

# Script to create .env.local file for LMS System

echo "Creating .env.local file..."
cat > .env.local << 'ENVFILE'
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ENVFILE

echo "✅ Created .env.local file!"
echo ""
echo "⚠️  IMPORTANT: You need to update it with your actual Supabase credentials:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Create/select a project"
echo "3. Go to: Settings → API"
echo "4. Copy your Project URL and anon key"
echo "5. Edit .env.local and replace the placeholder values"
echo ""
echo "Then restart your dev server: npm run dev"





