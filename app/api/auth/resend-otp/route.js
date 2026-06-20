import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Account already verified' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOTP = await bcrypt.hash(otp, 12)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    user.verificationOTP = hashedOTP
    user.verificationOTPExpiry = otpExpiry
    await user.save()

    await sendOTPEmail(user.email, user.name, otp)

    return NextResponse.json({ message: 'A new code has been sent to your email' }, { status: 200 })

  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}