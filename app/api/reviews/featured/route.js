import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await connectDB()

    const reviews = await Review.find({ isApproved: true, rating: { $gte: 4 } })
      .populate('productId', 'name slug')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(3)

    return NextResponse.json({ reviews }, { status: 200 })

  } catch (error) {
    console.error('Get featured reviews error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
