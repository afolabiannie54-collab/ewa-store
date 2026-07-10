import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const dbUser = await User.findById(user.id).select('wishlist')

    return NextResponse.json({ ids: dbUser?.wishlist || [] }, { status: 200 })

  } catch (error) {
    console.error('Wishlist IDs error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
