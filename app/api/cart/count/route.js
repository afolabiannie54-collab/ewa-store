import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    await connectDB()

    const cart = await Cart.findOne({ userId: user.id }).select('items.quantity')

    if (!cart) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    const count = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)

    return NextResponse.json({ count }, { status: 200 })

  } catch (error) {
    console.error('Cart count error:', error)
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
