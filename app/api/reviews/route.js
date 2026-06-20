import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const reviews = await Review.find({ userId: user.id })
      .populate('productId', 'name slug')
      .sort({ createdAt: -1 })

    return NextResponse.json({ reviews }, { status: 200 })

  } catch (error) {
    console.error('Get my reviews error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}