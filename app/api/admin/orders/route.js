import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const LIMIT = 15

    const query = {}
    if (statusFilter) query.status = statusFilter
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { orderNumber: { $regex: escaped, $options: 'i' } },
        { guestEmail: { $regex: escaped, $options: 'i' } },
        { guestName: { $regex: escaped, $options: 'i' } }
      ]
    }

    const [orders, total] = await Promise.all([
      Order.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip((page - 1) * LIMIT).limit(LIMIT),
      Order.countDocuments(query)
    ])

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / LIMIT) }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get admin orders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}