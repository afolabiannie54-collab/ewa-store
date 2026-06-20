import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
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

    if (order.userId?.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (order.status !== 'Pending') {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
    }

    order.status = 'Cancelled'
    await order.save()

    // Restore stock since the order never shipped
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size },
        { $inc: { 'variants.$.stockQuantity': item.quantity } }
      )
    }

    return NextResponse.json({ message: 'Order cancelled' }, { status: 200 })

  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}