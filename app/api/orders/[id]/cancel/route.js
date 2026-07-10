import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { sendOrderEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const dbUser = await User.findById(user.id)

    // Atomically find-and-update only if the order is still Pending and belongs to this user
    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        status: 'Pending',
        $or: [
          { userId: user.id },
          { guestEmail: dbUser?.isEmailVerified ? dbUser.email : null }
        ]
      },
      { $set: { status: 'Cancelled' } },
      { new: true }
    )

    if (!order) {
      // Check if order exists at all to give the right error message
      const exists = await Order.findById(id)
      if (!exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (exists.status !== 'Pending') return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Restore stock and sync inStock flag
    for (const item of order.items) {
      const product = await Product.findOne({ _id: item.productId, 'variants.size': item.size })
      const variant = product?.variants.find(v => v.size === item.size)
      if (variant) {
        const newQty = variant.stockQuantity + item.quantity
        await Product.updateOne(
          { _id: item.productId, 'variants.size': item.size },
          { $set: { 'variants.$.stockQuantity': newQty, 'variants.$.inStock': newQty > 0 } }
        )
      }
    }

    const recipientEmail = order.guestEmail || dbUser?.email
    if (recipientEmail) {
      await sendOrderEmail(
        recipientEmail,
        'Your EWA order has been cancelled',
        'Order Cancelled',
        `Your order ${order.orderNumber} has been successfully cancelled. If you paid online, your refund will be processed within 3–5 business days.`
      ).catch(err => console.error('Cancel email failed:', err))
    }

    return NextResponse.json({ message: 'Order cancelled' }, { status: 200 })

  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}