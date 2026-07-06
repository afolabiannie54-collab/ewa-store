import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Nothing to merge' }, { status: 200 })
    }

    let cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      cart = await Cart.create({ userId: user.id, items: [] })
    }

    let quantitiesAdjusted = 0

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.productId)
      if (!product) continue

      const variant = product.variants.find(v => v.size === guestItem.size)
      if (!variant) continue

      const existingItem = cart.items.find(
        item => item.productId.toString() === guestItem.productId && item.size === guestItem.size
      )

      if (existingItem) {
        const combinedQuantity = existingItem.quantity + guestItem.quantity
        const capped = Math.min(combinedQuantity, variant.stockQuantity)
        if (capped < combinedQuantity) quantitiesAdjusted++
        existingItem.quantity = capped
      } else {
        const safeQuantity = Math.min(guestItem.quantity, variant.stockQuantity)
        if (safeQuantity < guestItem.quantity) quantitiesAdjusted++
        if (safeQuantity > 0) {
          cart.items.push({ productId: guestItem.productId, size: guestItem.size, quantity: safeQuantity })
        }
      }
    }

    await cart.save()

    return NextResponse.json({ message: 'Cart merged successfully', quantitiesAdjusted }, { status: 200 })

  } catch (error) {
    console.error('Merge cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}