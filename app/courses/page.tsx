import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default async function CourseCatalogPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:user_profiles!courses_instructor_id_fkey(full_name, avatar_url)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Browse Courses 📚
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing courses from expert instructors
          </p>
        </div>
        
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Card 
                key={course.id} 
                className="overflow-hidden hover:shadow-xl transition-all hover:scale-105 border-0 shadow-lg rounded-2xl"
              >
                {course.thumbnail_url && (
                  <div className="relative w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500">
                    <Image 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {!course.thumbnail_url && (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg line-clamp-2 flex-1">{course.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {course.category && (
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        📂 {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                        🎯 {course.level}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                      📹 {course.total_videos} videos
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {course.instructor?.avatar_url ? (
                        <Image
                          src={course.instructor.avatar_url}
                          alt={course.instructor.full_name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs">
                          {course.instructor?.full_name?.charAt(0) || 'I'}
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {course.instructor?.full_name || 'Instructor'}
                      </span>
                    </div>
                    <span className="font-bold text-xl text-green-600">
                      ${course.price}
                    </span>
                  </div>

                  <Link href={`/courses/${course.slug || course.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-bold mb-2">No courses available yet</h2>
              <p className="text-lg text-gray-600 max-w-md">
                Check back soon for new courses from our instructors!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

