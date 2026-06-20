import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  await connectDB()
  const { id } = await params
  const product = await Product.findById(id)

  if (!product) {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  return NextResponse.redirect(new URL(`/shop/${product.slug}#reviews`, req.url))
}