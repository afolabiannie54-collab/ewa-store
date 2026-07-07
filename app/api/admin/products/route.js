import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import { uploadImage } from '@/lib/cloudinary'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const LIMIT = 15

    const query = {}
    if (statusFilter) query.status = statusFilter
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.name = { $regex: escaped, $options: 'i' }
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * LIMIT).limit(LIMIT),
      Product.countDocuments(query)
    ])

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / LIMIT) }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get admin products error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const {
      name, slug, description, category, skinType, skinConcern,
      ingredients, keyActives, howToUse, usageTime,
      images, variants, status, isFeatured
    } = body

    if (!name || !slug || !description || !category || !variants || variants.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validCategory = await Category.findOne({ name: category, active: true })
    if (!validCategory) {
      return NextResponse.json({ error: 'Selected category does not exist or is inactive.' }, { status: 400 })
    }

    const existingSlug = await Product.findOne({ slug })
    if (existingSlug) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }

 
    const uploadedImages = []
    for (const img of images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img)
        uploadedImages.push(url)
      } else {
        uploadedImages.push(img)
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category,
      skinType: skinType || [],
      skinConcern: skinConcern || [],
      ingredients,
      keyActives: keyActives || [],
      howToUse,
      usageTime,
      images: uploadedImages,
      variants,
      status: status || 'Draft',
      isFeatured: isFeatured || false
    })

    return NextResponse.json({ product }, { status: 201 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}