import connectDB from '@/lib/mongodb'
import OrderIssue from '@/models/OrderIssue'
import Order from '@/models/Order'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const issues = await OrderIssue.find({ userId: user.id })
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })

    return NextResponse.json({ issues }, { status: 200 })

  } catch (error) {
    console.error('Get issues error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}