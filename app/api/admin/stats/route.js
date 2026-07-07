import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import OrderIssue from '@/models/OrderIssue'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const totalOrders = await Order.countDocuments()

    const [revenueAgg] = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const totalRevenue = revenueAgg?.total || 0

    const [oosAgg] = await Product.aggregate([
      { $match: { status: 'Active' } },
      { $addFields: { hasStock: { $anyElementTrue: { $map: { input: '$variants', as: 'v', in: { $gt: ['$$v.stockQuantity', 0] } } } } } },
      { $group: { _id: null, outOfStock: { $sum: { $cond: [{ $not: '$hasStock' }, 1, 0] } } } }
    ])

    const pendingOrders = await Order.countDocuments({ status: 'Pending' })
    const openIssues = await OrderIssue.countDocuments({ status: 'Pending' })
    const totalProducts = await Product.countDocuments({ status: 'Active' })
    const outOfStockProducts = oosAgg?.outOfStock || 0

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      openIssues,
      totalProducts,
      outOfStockProducts
    }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}