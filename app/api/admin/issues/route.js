import connectDB from '@/lib/mongodb'
import OrderIssue from '@/models/OrderIssue'
import Order from '@/models/Order'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const issues = await OrderIssue.find()
      .populate('orderId', 'orderNumber items')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    return NextResponse.json({ issues }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get issues error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
