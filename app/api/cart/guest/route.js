import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const { items } = await req.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const enrichedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) continue

      const variant = product.variants.find(v => v.size === item.size)
      if (!variant) continue

      enrichedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0],
        size: item.size,
        price: variant.price,
        availableStock: variant.stockQuantity,
        quantity: Math.min(item.quantity, variant.stockQuantity)
      })
    }

    return NextResponse.json({ items: enrichedItems }, { status: 200 })

  } catch (error) {
    console.error('Get guest cart error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}