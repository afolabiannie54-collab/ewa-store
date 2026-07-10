import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/Product'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'pending' | 'approved' | ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20

    const query = {}
    if (status === 'approved') query.isApproved = true
    if (status === 'pending') query.isApproved = false

    const total = await Review.countDocuments(query)
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const reviews = await Review.find(query)
      .populate('productId', 'name slug')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({ reviews, total, totalPages, page }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}