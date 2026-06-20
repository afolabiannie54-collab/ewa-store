import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const reviews = await Review.find({ productId: id, isApproved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ reviews }, { status: 200 })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const { rating, comment } = await req.json()

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Find a delivered order belonging to this user that contains this product
    const qualifyingOrder = await Order.findOne({
      userId: user.id,
      status: 'Delivered',
      'items.productId': id
    })

    if (!qualifyingOrder) {
      return NextResponse.json({
        error: 'You can only review products from orders that have been delivered to you'
      }, { status: 403 })
    }

    // Check for existing review (one per product per customer)
    const existingReview = await Review.findOne({ productId: id, userId: user.id })
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }

    const review = await Review.create({
      productId: id,
      userId: user.id,
      orderId: qualifyingOrder._id,
      rating,
      comment,
      isApproved: false
    })

    return NextResponse.json({ review, message: 'Review submitted. It will appear once approved.' }, { status: 201 })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}