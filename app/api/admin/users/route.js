import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 20

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const search = searchParams.get('search')?.trim() || ''
    const role = searchParams.get('role') || ''

    const query = {}
    if (role === 'customer' || role === 'admin') query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await User.countDocuments(query)
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const users = await User.find(query)
      .select('name email role isEmailVerified createdAt lastLoginAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()

    const userIds = users.map(u => u._id)

    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: userIds }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      }
    ])

    const statsMap = {}
    for (const stat of orderStats) {
      statsMap[stat._id.toString()] = { orderCount: stat.orderCount, totalSpent: stat.totalSpent }
    }

    const enriched = users.map(u => ({
      ...u,
      orderCount: statsMap[u._id.toString()]?.orderCount || 0,
      totalSpent: statsMap[u._id.toString()]?.totalSpent || 0
    }))

    return NextResponse.json({ users: enriched, total, totalPages, page }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
