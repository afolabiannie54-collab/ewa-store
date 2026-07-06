import connectDB from '@/lib/mongodb'
import User from '@/models/User'
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

    const dbUser = await User.findById(user.id).populate('wishlist')

    return NextResponse.json({ wishlist: dbUser.wishlist }, { status: 200 })

  } catch (error) {
    console.error('Get wishlist error:', error)
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

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const dbUser = await User.findById(user.id)

    if (!dbUser.wishlist.some(id => id.toString() === productId)) {
      dbUser.wishlist.push(productId)
      await dbUser.save()
    }

    return NextResponse.json({ message: 'Added to wishlist' }, { status: 200 })

  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}