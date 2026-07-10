import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 12

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const skinType = searchParams.get('skinType')
    const skinConcern = searchParams.get('skinConcern')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

    const query = { status: 'Active' }

    if (category) {
      query.category = category
    }

    if (skinType) {
      query.skinType = skinType
    }

    if (skinConcern) {
      query.skinConcern = skinConcern
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ]
    }

    let products = await Product.find(query)

    // Price filtering happens after fetch since price lives inside variants array
    if (minPrice || maxPrice) {
      products = products.filter(product => {
        const lowestPrice = Math.min(...product.variants.map(v => v.price))
        if (minPrice && lowestPrice < Number(minPrice)) return false
        if (maxPrice && lowestPrice > Number(maxPrice)) return false
        return true
      })
    }

    // Sorting
    if (sort === 'price-low') {
      products.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)))
    } else if (sort === 'price-high') {
      products.sort((a, b) => Math.min(...b.variants.map(v => v.price)) - Math.min(...a.variants.map(v => v.price)))
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sort === 'rating') {
      products.sort((a, b) => b.averageRating - a.averageRating)
    }

    const total = products.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return NextResponse.json({ products: paginated, total, totalPages, page }, { status: 200 })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}