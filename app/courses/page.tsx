import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Star } from 'lucide-react'

interface SearchParams {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  sort?: string
}

export default async function CourseCatalogPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:user_profiles!courses_instructor_id_fkey(full_name, avatar_url),
      category:course_categories(id, name, slug, icon)
    `)
    .eq('status', 'published')

  // Search (if search_vector column exists, use textSearch, otherwise use ilike)
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  // Category filter
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  // Price range
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }

  // Rating filter
  if (searchParams.rating) {
    query = query.gte('rating', parseFloat(searchParams.rating))
  }

  // Sort
  switch (searchParams.sort) {
    case 'popular':
      query = query.order('enrollment_count', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'price_low':
      query = query.order('price', { ascending: true })
      break
    case 'price_high':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: courses } = await query

  // Get all categories for filter
  const { data: categories } = await supabase
    .from('course_categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Browse Courses <span className="text-gradient">📚</span>
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing courses from expert instructors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters categories={categories || []} />
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {courses && courses.length > 0 ? (
              <>
                <div className="mb-6 text-sm text-gray-600">
                  Found {courses.length} course{courses.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course: any) => (
                    <Card 
                      key={course.id} 
                      className="overflow-hidden hover:shadow-xl transition-all border-0 shadow-lg rounded-2xl bg-white"
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
                        
                        {/* Rating */}
                        {course.rating && course.rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                            {course.review_count > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.review_count} {course.review_count === 1 ? 'review' : 'reviews'})
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4 text-xs">
                          {course.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <span>{course.category.icon || '📂'}</span>
                              <span>{course.category.name}</span>
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
                          <Button className="w-full gradient-primary text-white font-semibold rounded-xl">
                            View Course
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-xl rounded-2xl bg-white">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-3xl font-bold mb-2">No courses found</h2>
                  <p className="text-lg text-gray-600 max-w-md mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Link href="/courses">
                    <Button className="gradient-primary text-white font-semibold rounded-xl">
                      Clear Filters
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
