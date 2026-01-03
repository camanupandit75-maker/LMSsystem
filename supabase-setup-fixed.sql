-- ============================================
-- FIXED: LMS Database Setup (No Recursion)
-- ============================================
-- Run this in Supabase SQL Editor to fix RLS issues
-- This replaces the old setup and fixes infinite recursion

-- ============================================
-- STEP 1: Drop existing problematic policies
-- ============================================

-- Drop all existing policies on user_profiles to fix recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- ============================================
-- STEP 2: Create user_profiles table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  bank_account_name text,
  bank_account_number text,
  bank_routing_number text,
  bank_account_verified boolean DEFAULT false,
  commission_rate numeric DEFAULT 70,
  enrolled_courses_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create FIXED RLS policies (no recursion)
-- ============================================

-- Users can view their own profile (simple, no recursion)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view other users' profiles (for public info like name, role)
-- This allows the app to show instructor names, etc.
CREATE POLICY "Users can view public profiles"
  ON user_profiles FOR SELECT
  USING (true); -- Allow all authenticated users to view profiles

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: Create instructor_subscriptions table
-- ============================================

CREATE TABLE IF NOT EXISTS instructor_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium')),
  max_courses integer NOT NULL DEFAULT 1,
  used_courses integer NOT NULL DEFAULT 0,
  price_paid numeric DEFAULT 0,
  subscription_start_date timestamp with time zone DEFAULT now(),
  subscription_end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(instructor_id, is_active) WHERE is_active = true
);

ALTER TABLE instructor_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own subscription"
  ON instructor_subscriptions FOR SELECT
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can insert own subscription"
  ON instructor_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own subscription"
  ON instructor_subscriptions FOR UPDATE
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- ============================================
-- STEP 5: Create courses table
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  category text,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  total_videos integer DEFAULT 0,
  total_duration_minutes integer DEFAULT 0,
  enrollment_count integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  slug text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Instructors can manage their own courses
CREATE POLICY "Instructors can manage own courses"
  ON courses FOR ALL
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published');

-- ============================================
-- STEP 6: Create course_videos table
-- ============================================

CREATE TABLE IF NOT EXISTS course_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  google_drive_url text NOT NULL,
  google_drive_file_id text,
  section_name text,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  is_preview boolean DEFAULT false,
  transcript text,
  summary text,
  quiz_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;

-- Instructors can manage videos in their courses
CREATE POLICY "Instructors can manage course videos"
  ON course_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_videos.course_id 
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_videos.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Students can view videos in enrolled courses
CREATE POLICY "Students can view enrolled course videos"
  ON course_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = course_videos.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_videos.course_id
      AND courses.status = 'published'
      AND course_videos.is_preview = true
    )
  );

-- ============================================
-- STEP 7: Create enrollments table
-- ============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamp with time zone DEFAULT now(),
  amount_paid numeric NOT NULL DEFAULT 0,
  progress_percentage numeric DEFAULT 0,
  last_watched_video_id uuid REFERENCES course_videos(id),
  last_accessed_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  certificate_issued boolean DEFAULT false,
  certificate_url text,
  access_expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own enrollments"
  ON enrollments FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================
-- STEP 8: Create transactions table
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('enrollment', 'payout', 'refund')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_payout_id text,
  description text,
  metadata jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = instructor_id);

-- ============================================
-- STEP 9: Create transaction_splits table
-- ============================================

CREATE TABLE IF NOT EXISTS transaction_splits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  instructor_amount numeric NOT NULL,
  platform_amount numeric NOT NULL,
  instructor_percentage numeric NOT NULL DEFAULT 70,
  platform_percentage numeric NOT NULL DEFAULT 30,
  instructor_paid boolean DEFAULT false,
  instructor_payout_date timestamp with time zone,
  instructor_payout_reference text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own splits"
  ON transaction_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_splits.transaction_id
      AND transactions.instructor_id = auth.uid()
    )
  );

-- ============================================
-- STEP 10: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);
CREATE INDEX IF NOT EXISTS instructor_subscriptions_instructor_id_idx ON instructor_subscriptions(instructor_id);
CREATE INDEX IF NOT EXISTS courses_instructor_id_idx ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS course_videos_course_id_idx ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS enrollments_student_id_idx ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS transactions_student_id_idx ON transactions(student_id);
CREATE INDEX IF NOT EXISTS transactions_instructor_id_idx ON transactions(instructor_id);

-- ============================================
-- STEP 11: Create function to update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructor_subscriptions_updated_at BEFORE UPDATE ON instructor_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_videos_updated_at BEFORE UPDATE ON course_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 12: Create view for instructor earnings
-- ============================================

CREATE OR REPLACE VIEW instructor_earnings_summary AS
SELECT 
  ts.transaction_id,
  t.instructor_id,
  SUM(t.amount) as total_revenue,
  SUM(ts.instructor_amount) as instructor_earnings,
  SUM(ts.platform_amount) as platform_fee,
  SUM(CASE WHEN ts.instructor_paid = false THEN ts.instructor_amount ELSE 0 END) as pending_payout,
  SUM(CASE WHEN ts.instructor_paid = true THEN ts.instructor_amount ELSE 0 END) as paid_out,
  COUNT(DISTINCT t.enrollment_id) as total_enrollments
FROM transactions t
JOIN transaction_splits ts ON t.id = ts.transaction_id
WHERE t.type = 'enrollment' AND t.status = 'completed'
GROUP BY ts.transaction_id, t.instructor_id;

-- Grant access to the view
GRANT SELECT ON instructor_earnings_summary TO authenticated;

-- ============================================
-- STEP 13: Create trigger for automatic transaction splits
-- ============================================

CREATE OR REPLACE FUNCTION create_transaction_split()
RETURNS TRIGGER AS $$
DECLARE
  instructor_commission numeric;
  platform_commission numeric;
BEGIN
  -- Only create split for enrollment transactions
  IF NEW.type = 'enrollment' AND NEW.status = 'completed' THEN
    -- Get instructor commission rate (default 70%)
    SELECT COALESCE(commission_rate, 70) INTO instructor_commission
    FROM user_profiles
    WHERE id = NEW.instructor_id;
    
    -- Calculate splits
    instructor_commission := COALESCE(instructor_commission, 70);
    platform_commission := 100 - instructor_commission;
    
    -- Create split
    INSERT INTO transaction_splits (
      transaction_id,
      instructor_amount,
      platform_amount,
      instructor_percentage,
      platform_percentage
    ) VALUES (
      NEW.id,
      NEW.amount * (instructor_commission / 100),
      NEW.amount * (platform_commission / 100),
      instructor_commission,
      platform_commission
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_create_transaction_split
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.type = 'enrollment' AND NEW.status = 'completed')
  EXECUTE FUNCTION create_transaction_split();

-- ============================================
-- DONE! 
-- ============================================
-- Now create the 'videos' storage bucket manually:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "videos"
-- 4. Make it Public
-- 5. Click "Create bucket"







