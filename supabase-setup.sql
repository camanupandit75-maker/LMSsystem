-- Learning Management System Database Setup
-- Run this script in your Supabase SQL Editor

-- Create videos table
create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  status text default 'uploaded',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table videos enable row level security;

-- Create policies for videos table
-- Users can only see their own videos
create policy "Users can view their own videos"
  on videos for select
  using (auth.uid() = user_id);

-- Users can insert their own videos
create policy "Users can insert their own videos"
  on videos for insert
  with check (auth.uid() = user_id);

-- Users can update their own videos
create policy "Users can update their own videos"
  on videos for update
  using (auth.uid() = user_id);

-- Users can delete their own videos
create policy "Users can delete their own videos"
  on videos for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists videos_user_id_idx on videos(user_id);
create index if not exists videos_created_at_idx on videos(created_at desc);

-- Create storage bucket for videos (run this in Supabase Dashboard > Storage)
-- Note: You'll need to create the bucket manually in the Supabase Dashboard
-- Bucket name: videos
-- Public: Yes (or configure policies as needed)

-- Storage policies (run these after creating the bucket)
-- Allow authenticated users to upload videos
-- create policy "Authenticated users can upload videos"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'videos');

-- Allow users to view their own videos
-- create policy "Users can view their own videos"
--   on storage.objects for select
--   to authenticated
--   using (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own videos
-- create policy "Users can delete their own videos"
--   on storage.objects for delete
--   to authenticated
--   using (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);








