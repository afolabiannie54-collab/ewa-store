import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params

    const user = await User.findById(id)
      .select('name email role isEmailVerified createdAt lastLoginAt addresses wishlist')
      .lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const orders = await Order.find({ userId: id })
      .select('orderNumber status total createdAt items promoCode shippingAddress')
      .sort({ createdAt: -1 })
      .lean()

    const totalSpent = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0)

    return NextResponse.json({ user, orders, totalSpent }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Admin user detail error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
