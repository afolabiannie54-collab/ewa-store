import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { productId } = await params
    const dbUser = await User.findById(user.id)

    dbUser.wishlist = dbUser.wishlist.filter(id => id.toString() !== productId)
    await dbUser.save()

    return NextResponse.json({ message: 'Removed from wishlist' }, { status: 200 })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}