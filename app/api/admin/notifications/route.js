import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import OrderIssue from '@/models/OrderIssue'
import Review from '@/models/Review'
import Inquiry from '@/models/Inquiry'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    await connectDB()

    const [pendingOrders, pendingIssues, pendingReviews, unreadInquiries, outOfStockProducts] = await Promise.all([
      Order.countDocuments({ status: 'Pending' }),
      OrderIssue.countDocuments({ status: 'Pending' }),
      Review.countDocuments({ isApproved: false }),
      Inquiry.countDocuments({ status: 'Unread' }),
      // Active products where no variant has inStock: true
      Product.countDocuments({
        status: 'Active',
        variants: { $not: { $elemMatch: { inStock: true } } }
      })
    ])

    return NextResponse.json({ pendingOrders, pendingIssues, pendingReviews, unreadInquiries, outOfStockProducts })
  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Admin notifications error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
