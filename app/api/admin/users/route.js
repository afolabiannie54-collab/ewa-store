import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 20

const SORT_MAP = {
  newest: { createdAt: -1 },
  orders: { orderCount: -1, createdAt: -1 },
  spent: { totalSpent: -1, createdAt: -1 },
}

const SENSITIVE_FIELDS = {
  password: 0, addresses: 0, wishlist: 0,
  verificationOTP: 0, verificationOTPExpiry: 0,
  pendingEmail: 0, emailChangeOTP: 0, emailChangeOTPExpiry: 0,
  resetPasswordOTP: 0, resetPasswordOTPExpiry: 0,
}

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const search = searchParams.get('search')?.trim() || ''
    const role = searchParams.get('role') || ''
    const sort = searchParams.get('sort') || 'newest'

    const matchStage = {}
    if (role === 'customer' || role === 'admin') matchStage.role = role
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const sortStage = SORT_MAP[sort] || SORT_MAP.newest

    const basePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $ne: ['$status', 'Cancelled'] }
                  ]
                }
              }
            },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } }
          ],
          as: 'orderStats'
        }
      },
      {
        $addFields: {
          orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.count', 0] }, 0] },
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$orderStats.total', 0] }, 0] }
        }
      },
      { $project: { ...SENSITIVE_FIELDS, orderStats: 0 } }
    ]

    const [countResult, users] = await Promise.all([
      User.aggregate([...basePipeline, { $count: 'total' }]),
      User.aggregate([
        ...basePipeline,
        { $sort: sortStage },
        { $skip: (page - 1) * PAGE_SIZE },
        { $limit: PAGE_SIZE }
      ])
    ])

    const total = countResult[0]?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    return NextResponse.json({ users, total, totalPages, page }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
