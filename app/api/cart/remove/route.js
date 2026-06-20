import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { productId, size } = await req.json()

    if (!productId || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    )

    await cart.save()

    return NextResponse.json({ message: 'Item removed' }, { status: 200 })

  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}