# Learning Management System (LMS)

A modern Learning Management System built with Next.js 14, Supabase, TailwindCSS, and Shadcn/UI. Upload, manage, and watch educational videos with a beautiful, responsive interface.

## 🚀 Features

- **Authentication**: Secure sign up, sign in, and logout with Supabase Auth
- **Video Upload**: Drag & drop video uploads with progress tracking
- **Video Management**: Dashboard to view and manage all uploaded videos
- **Video Player**: Built-in video player with controls
- **Protected Routes**: Middleware-based route protection
- **Dark Mode**: Full dark/light mode support
- **Responsive Design**: Mobile-first, works on all devices
- **AI Ready**: Placeholder functions for transcription, summaries, and quizzes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database & Auth**: Supabase
- **Styling**: TailwindCSS + Shadcn/UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account (free tier works)
- Git (optional)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Navigate to project directory
cd "LMS system"

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your `Project URL` and `anon public` key
4. Go to Storage and create a new bucket named `videos` (make it public)
5. Go to SQL Editor and run the SQL script from `supabase-setup.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin operations)
OPENAI_API_KEY=your_openai_key (optional, for future AI features)
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Landing page
├── globals.css            # Global styles
├── auth/
│   ├── signin/page.tsx    # Sign in page
│   └── signup/page.tsx    # Sign up page
├── dashboard/page.tsx     # Protected dashboard
├── upload/page.tsx        # Protected upload page
└── video/[id]/page.tsx    # Video player page

components/
├── Navbar.tsx             # Navigation bar
├── VideoCard.tsx          # Video card component
├── UploadForm.tsx         # Upload form with drag & drop
├── VideoPlayer.tsx        # Video player component
├── ThemeProvider.tsx      # Theme provider
└── ui/                    # Shadcn/UI components

lib/
├── utils.ts               # Utility functions
├── supabase/
│   ├── client.ts          # Browser Supabase client
│   └── server.ts          # Server Supabase client
└── ai/
    ├── transcription.ts   # AI transcription placeholder
    ├── summary.ts         # AI summary placeholder
    └── quiz.ts           # AI quiz placeholder

middleware.ts              # Auth protection middleware
```

## 🗄️ Database Schema

The `videos` table has the following structure:

- `id` (uuid): Primary key
- `user_id` (uuid): Foreign key to auth.users
- `title` (text): Video title
- `description` (text): Video description (optional)
- `video_url` (text): Public URL to video file
- `thumbnail_url` (text): Thumbnail image URL (optional)
- `status` (text): Video status (default: 'uploaded')
- `created_at` (timestamp): Creation timestamp

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own videos
- Protected routes via middleware
- Secure file uploads with validation

## 🎨 Customization

### Themes

The app uses CSS variables for theming. Modify `app/globals.css` to customize colors.

### Components

All UI components are in `components/ui/` and can be customized as needed.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤖 AI Integration

The project includes placeholder functions for AI features:

- **Transcription**: `lib/ai/transcription.ts` - Ready for OpenAI Whisper
- **Summary**: `lib/ai/summary.ts` - Ready for OpenAI GPT
- **Quiz Generation**: `lib/ai/quiz.ts` - Ready for LLM integration

See the individual files for implementation details.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Videos not uploading

- Check that the `videos` bucket exists in Supabase Storage
- Verify storage policies are set correctly
- Check file size limits (default: 500MB)

### Authentication issues

- Verify environment variables are set correctly
- Check Supabase project settings
- Ensure RLS policies are enabled

### Build errors

- Make sure all dependencies are installed
- Check Node.js version (18+)
- Clear `.next` folder and rebuild

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)








