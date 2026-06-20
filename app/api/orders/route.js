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

    // Match orders by userId OR by guestEmail if the account's email is verified
    // This is our locked architecture: guest orders are never rewritten,
    // they're surfaced via this query-time join instead
    const query = dbUser.isEmailVerified
      ? { $or: [{ userId: user.id }, { guestEmail: dbUser.email }] }
      : { userId: user.id }

    const orders = await Order.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ orders }, { status: 200 })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}