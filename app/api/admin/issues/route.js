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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20

    const query = status ? { status } : {}

    const total = await OrderIssue.countDocuments(query)
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const issues = await OrderIssue.find(query)
      .populate('orderId', 'orderNumber items')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({ issues, total, totalPages, page }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get issues error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
