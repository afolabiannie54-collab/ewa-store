import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const { orderNumber, email } = await req.json()

    if (!orderNumber || !email) {
      return NextResponse.json({ error: 'Order number and email are required' }, { status: 400 })
    }

    const order = await Order.findOne({ orderNumber }).populate('userId')

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderEmail = order.guestEmail || order.userId?.email

    if (!orderEmail || orderEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { paymentReference, ...safeOrder } = order.toObject()
    return NextResponse.json({ order: safeOrder }, { status: 200 })

  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
