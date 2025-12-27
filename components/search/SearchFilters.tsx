'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon?: string
}

interface SearchFiltersProps {
  categories: Category[]
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const rating = searchParams.get('rating') || ''
  const sort = searchParams.get('sort') || 'newest'

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page when filters change
    router.push(`/courses?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/courses')
  }

  const hasActiveFilters = q || category || minPrice || maxPrice || rating || sort !== 'newest'

  return (
    <div className="space-y-6 sticky top-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search" className="text-sm font-semibold mb-2 block">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search courses..."
              value={q}
              onChange={(e) => updateFilters('q', e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <Label htmlFor="category" className="text-sm font-semibold mb-2 block">
            Category
          </Label>
          <select
            id="category"
            value={category}
            onChange={(e) => updateFilters('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <Label className="text-sm font-semibold mb-2 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
                className="rounded-xl"
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                className="rounded-xl"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="mb-6">
          <Label htmlFor="rating" className="text-sm font-semibold mb-2 block">
            Minimum Rating
          </Label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => updateFilters('rating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sort" className="text-sm font-semibold mb-2 block">
            Sort By
          </Label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )
}


