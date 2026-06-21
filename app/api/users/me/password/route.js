import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const dbUser = await User.findById(user.id)

    if (!dbUser.password) {
      return NextResponse.json({ error: 'This account uses Google sign-in and has no password to change' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    dbUser.password = await bcrypt.hash(newPassword, 12)
    await dbUser.save()

    return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}