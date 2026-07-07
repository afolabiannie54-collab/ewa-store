import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const { reference } = await req.json()

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const order = await Order.findOne(
      { paymentReference: reference },
      { _id: 1, orderNumber: 1, status: 1, paymentStatus: 1 }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found yet' }, { status: 404 })
    }

    return NextResponse.json({ order }, { status: 200 })

  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}