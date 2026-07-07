import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`reset:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
    }

    const { email, otp, password } = await req.json()

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user || !user.resetPasswordOTP) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      return NextResponse.json({ error: 'Code has expired — request a new one' }, { status: 400 })
    }

    const isValidOtp = await bcrypt.compare(otp, user.resetPasswordOTP)
    if (!isValidOtp) {
      return NextResponse.json({ error: 'Incorrect code' }, { status: 400 })
    }

    user.password = await bcrypt.hash(password, 12)
    user.resetPasswordOTP = undefined
    user.resetPasswordOTPExpiry = undefined
    await user.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
