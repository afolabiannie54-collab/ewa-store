import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const cart = await Cart.findOne({ userId: user.id }).populate('items.productId')

    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    // Build enriched response with live product/variant data
    const enrichedItems = cart.items.map(item => {
      const product = item.productId
      const variant = product?.variants.find(v => v.size === item.size)

      return {
        productId: product?._id,
        name: product?.name,
        slug: product?.slug,
        image: product?.images?.[0],
        size: item.size,
        price: variant?.price || 0,
        availableStock: variant?.stockQuantity || 0,
        quantity: item.quantity
      }
    })

    return NextResponse.json({ items: enrichedItems }, { status: 200 })

  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { productId, size, quantity } = await req.json()

    if (!productId || !size || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const variant = product.variants.find(v => v.size === size)
    if (!variant) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 })
    }

    if (variant.stockQuantity < quantity) {
      return NextResponse.json({ error: `Only ${variant.stockQuantity} left in stock` }, { status: 400 })
    }

    let cart = await Cart.findOne({ userId: user.id })

    if (!cart) {
      cart = await Cart.create({ userId: user.id, items: [] })
    }

    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.size === size
    )

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > variant.stockQuantity) {
        return NextResponse.json({ error: `Only ${variant.stockQuantity} left in stock` }, { status: 400 })
      }
      existingItem.quantity = newQuantity
    } else {
      cart.items.push({ productId, size, quantity })
    }

    await cart.save()

    return NextResponse.json({ message: 'Added to cart' }, { status: 200 })

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}