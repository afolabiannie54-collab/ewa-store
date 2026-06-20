import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await connectDB()

    const products = await Product.find({ status: 'Active', isFeatured: true }).limit(8)

    return NextResponse.json({ products }, { status: 200 })

  } catch (error) {
    console.error('Get featured products error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}