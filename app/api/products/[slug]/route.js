import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await connectDB()

    const { slug } = await params
    const product = await Product.findOne({ slug, status: 'Active' })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product }, { status: 200 })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}