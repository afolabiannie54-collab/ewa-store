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

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
      }
      review.rating = rating
    }
    if (comment) review.comment = comment

    const wasApproved = review.isApproved
    review.isApproved = false // edited reviews need re-approval

    await review.save()

    // If the review was previously contributing to the product average, recalculate
    if (wasApproved) {
      const Product = (await import('@/models/Product')).default
      const approvedReviews = await Review.find({ productId: review.productId, isApproved: true })
      const reviewCount = approvedReviews.length
      const averageRating = reviewCount > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0
      await Product.findByIdAndUpdate(review.productId, { averageRating, reviewCount })
    }

    return NextResponse.json({ review, message: 'Review updated. It will be re-reviewed before appearing.' }, { status: 200 })

  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { reviewId } = await params
    const review = await Review.findById(reviewId)

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const productId = review.productId
    await Review.findByIdAndDelete(reviewId)

    // Recalculate product rating since a review was removed
    const Product = (await import('@/models/Product')).default
    const approvedReviews = await Review.find({ productId, isApproved: true })
    const reviewCount = approvedReviews.length
    const averageRating = reviewCount > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

    await Product.findByIdAndUpdate(productId, { averageRating, reviewCount })

    return NextResponse.json({ message: 'Review deleted' }, { status: 200 })

  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}