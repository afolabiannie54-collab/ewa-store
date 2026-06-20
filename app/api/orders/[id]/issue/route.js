import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import OrderIssue from '@/models/OrderIssue'
import { uploadImage } from '@/lib/cloudinary'
import { sendOrderEmail } from '@/lib/email'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

const IMAGE_REQUIRED = {
  'Wrong Item Received': true,
  'Damaged Item Received': true,
  'Missing Item': false
}

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const { reasonType, details, images } = await req.json()

    if (!reasonType || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (IMAGE_REQUIRED[reasonType] && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'A photo is required for this issue type' }, { status: 400 })
    }

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId?.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (order.status !== 'Delivered') {
      return NextResponse.json({ error: 'Issues can only be reported for delivered orders' }, { status: 400 })
    }

    // Upload images to Cloudinary
    const uploadedImages = []
    for (const img of images || []) {
      const url = await uploadImage(img, 'ewa-issues')
      uploadedImages.push(url)
    }

    const issue = await OrderIssue.create({
      orderId: order._id,
      userId: user.id,
      reasonType,
      details,
      images: uploadedImages,
      status: 'Pending'
    })

    await sendOrderEmail(
      user.email,
      'We received your report',
      'Issue Report Received',
      `We've received your report regarding order ${order.orderNumber}. Our team will review it and get back to you soon.`
    ).catch(err => console.error('Email send failed:', err))

    return NextResponse.json({ issue }, { status: 201 })

  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}