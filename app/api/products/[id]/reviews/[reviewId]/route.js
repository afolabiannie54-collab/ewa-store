import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { reviewId } = await params
    const { rating, comment } = await req.json()

    const review = await Review.findById(reviewId)

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (rating) review.rating = rating
    if (comment) review.comment = comment
    review.isApproved = false // edited reviews need re-approval

    await review.save()

    return NextResponse.json({ review, message: 'Review updated. It will be re-reviewed before appearing.' }, { status: 200 })

  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}