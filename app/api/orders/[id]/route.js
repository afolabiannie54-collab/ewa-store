import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import OrderIssue from '@/models/OrderIssue'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Admins can view any order, customers can only view their own
    if (user.role !== 'admin') {
      const dbUser = await User.findById(user.id)
      const isOwner = order.userId?.toString() === user.id
      const isGuestMatch = dbUser.isEmailVerified && order.guestEmail === dbUser.email

      if (!isOwner && !isGuestMatch) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
    }

    const existingIssue = await OrderIssue.findOne({ orderId: id }).select('_id status adminNote reasonType')

    return NextResponse.json({ order, issue: existingIssue || null }, { status: 200 })

  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}