import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function recalculateProductRating(productId) {
  const approvedReviews = await Review.find({ productId, isApproved: true })

  const reviewCount = approvedReviews.length
  const averageRating = reviewCount > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  await Product.findByIdAndUpdate(productId, { averageRating, reviewCount })
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { isApproved } = await req.json()

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    review.isApproved = isApproved
    await review.save()

    await recalculateProductRating(review.productId)

    return NextResponse.json({ review }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const productId = review.productId
    await Review.findByIdAndDelete(id)
    await recalculateProductRating(productId)

    return NextResponse.json({ message: 'Review deleted' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Delete review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}