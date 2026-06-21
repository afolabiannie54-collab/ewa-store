import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { otp } = await req.json()

    if (!otp) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const dbUser = await User.findById(user.id)

    if (!dbUser.pendingEmail || !dbUser.emailChangeOTP || !dbUser.emailChangeOTPExpiry) {
      return NextResponse.json({ error: 'No pending email change found' }, { status: 400 })
    }

    if (new Date() > dbUser.emailChangeOTPExpiry) {
      return NextResponse.json({ error: 'Code expired. Please request the change again.' }, { status: 400 })
    }

    const isValidOTP = await bcrypt.compare(otp, dbUser.emailChangeOTP)
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    dbUser.email = dbUser.pendingEmail
    dbUser.pendingEmail = undefined
    dbUser.emailChangeOTP = undefined
    dbUser.emailChangeOTPExpiry = undefined
    await dbUser.save()

    return NextResponse.json({ message: 'Email updated successfully', user: dbUser }, { status: 200 })

  } catch (error) {
    console.error('Confirm email change error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}