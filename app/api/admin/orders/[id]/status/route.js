import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { sendOrderEmail } from '@/lib/email'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

const VALID_TRANSITIONS = {
  Pending: 'Confirmed',
  Confirmed: 'Shipped',
  Shipped: 'Delivered'
}

const EMAIL_CONTENT = {
  Confirmed: {
    subject: 'Your EWA order has been confirmed',
    heading: 'Order Confirmed',
    message: 'Great news! Your order has been confirmed and is being prepared for shipment.'
  },
  Shipped: {
    subject: 'Your EWA order has shipped',
    heading: 'Order Shipped',
    message: 'Your order is on its way! You will receive it soon.'
  },
  Delivered: {
    subject: 'Your EWA order has been delivered',
    heading: 'Order Delivered',
    message: 'Your order has been delivered. We hope you love your new skincare! If anything was wrong with your order, you can report an issue from your order page.'
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { status } = await req.json()

    const order = await Order.findById(id).populate('userId', 'email')

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (VALID_TRANSITIONS[order.status] !== status) {
      return NextResponse.json({ error: `Cannot move from ${order.status} to ${status}` }, { status: 400 })
    }

    order.status = status

    if (status === 'Confirmed') order.confirmedAt = new Date()
    if (status === 'Shipped') order.shippedAt = new Date()
    if (status === 'Delivered') order.deliveredAt = new Date()

    await order.save()

    const recipientEmail = order.guestEmail || order.userId?.email
    const emailContent = EMAIL_CONTENT[status]

    if (recipientEmail && emailContent) {
      await sendOrderEmail(
        recipientEmail,
        emailContent.subject,
        emailContent.heading,
        `${emailContent.message} Order number: ${order.orderNumber}.`
      ).catch(err => console.error('Email send failed:', err))
    }

    return NextResponse.json({ order }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update order status error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}