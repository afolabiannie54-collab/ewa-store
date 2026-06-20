import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { productId, size, quantity } = await req.json()

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    const product = await Product.findById(productId)
    const variant = product?.variants.find(v => v.size === size)

    if (!variant) {
      return NextResponse.json({ error: 'Product or size not found' }, { status: 404 })
    }

    if (quantity > variant.stockQuantity) {
      return NextResponse.json({ error: `Only ${variant.stockQuantity} left in stock` }, { status: 400 })
    }

    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    const item = cart.items.find(
      i => i.productId.toString() === productId && i.size === size
    )

    if (!item) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 })
    }

    item.quantity = quantity
    await cart.save()

    return NextResponse.json({ message: 'Cart updated' }, { status: 200 })

  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}