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

    const paidOrders = await Order.find({ paymentStatus: 'Paid' })
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)

    const pendingOrders = await Order.countDocuments({ status: 'Pending' })
    const openIssues = await OrderIssue.countDocuments({ status: 'Pending' })
    const totalProducts = await Product.countDocuments({ status: 'Active' })
    const outOfStockProducts = await Product.find({ status: 'Active' }).then(products =>
      products.filter(p => !p.variants.some(v => v.stockQuantity > 0)).length
    )

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