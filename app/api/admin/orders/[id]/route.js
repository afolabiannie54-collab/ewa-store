import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const order = await Order.findById(id).populate('userId', 'name email')

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}