export type UserRole = 'admin' | 'instructor' | 'student';
export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type TransactionType = 'enrollment' | 'payout' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  pan_number?: string;
  gstn?: string;
  business_name?: string;
  pan_verified: boolean;
  gstn_verified: boolean;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  bank_account_verified: boolean;
  commission_rate: number;
  enrolled_courses_count: number;
  created_at: string;
  updated_at: string;
}

export interface InstructorSubscription {
  id: string;
  instructor_id: string;
  tier: SubscriptionTier;
  max_courses: number;
  bonus_courses?: number;
  bonus_granted_by?: string;
  bonus_granted_at?: string;
  bonus_reason?: string;
  used_courses: number;
  price_paid: number;
  subscription_start_date: string;
  subscription_end_date?: string;
  is_active: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category_id?: string;
  category?: string; // Legacy field, kept for backward compatibility
  level?: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  currency: string;
  status: CourseStatus;
  total_videos: number;
  total_duration_minutes: number;
  enrollment_count: number;
  total_revenue: number;
  rating: number;
  review_count: number;
  slug?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseVideo {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  google_drive_url: string;
  google_drive_file_id?: string;
  video_source?: 'google_drive' | 'youtube';
  section_name?: string;
  order_index: number;
  duration_minutes?: number;
  is_preview: boolean;
  is_approved?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  moderated_by?: string;
  moderated_at?: string;
  transcript?: string;
  summary?: string;
  quiz_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  amount_paid: number;
  progress_percentage: number;
  last_watched_video_id?: string;
  last_accessed_at: string;
  completed_at?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  access_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  student_id?: string;
  instructor_id?: string;
  course_id?: string;
  enrollment_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_payout_id?: string;
  description?: string;
  metadata?: any;
  processed_at?: string;
  created_at: string;
}

export interface TransactionSplit {
  id: string;
  transaction_id: string;
  instructor_amount: number;
  platform_amount: number;
  instructor_percentage: number;
  platform_percentage: number;
  instructor_paid: boolean;
  instructor_payout_date?: string;
  instructor_payout_reference?: string;
  created_at: string;
}

export interface InstructorEarningsSummary {
  instructor_id: string;
  total_revenue: number;
  instructor_earnings: number;
  platform_fee: number;
  pending_payout: number;
  paid_out: number;
  total_enrollments: number;
}



