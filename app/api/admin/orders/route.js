import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 })

    return NextResponse.json({ orders }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get admin orders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}