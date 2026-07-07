import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const dbUser = await User.findById(user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Match orders by userId OR by guestEmail if the account's email is verified
    // This is our locked architecture: guest orders are never rewritten,
    // they're surfaced via this query-time join instead
    const base = dbUser.isEmailVerified
      ? { $or: [{ userId: user.id }, { guestEmail: dbUser.email }] }
      : { userId: user.id }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const LIMIT = 10

    const query = statusFilter ? { ...base, status: statusFilter } : base

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * LIMIT).limit(LIMIT),
      Order.countDocuments(query)
    ])

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / LIMIT) }, { status: 200 })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}