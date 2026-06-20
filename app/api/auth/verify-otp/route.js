import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Account already verified' }, { status: 400 })
    }

    if (!user.verificationOTP || !user.verificationOTPExpiry) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 })
    }

    if (new Date() > user.verificationOTPExpiry) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    const isValidOTP = await bcrypt.compare(otp, user.verificationOTP)

    if (!isValidOTP) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
    }

    user.isEmailVerified = true
    user.verificationOTP = undefined
    user.verificationOTPExpiry = undefined
    await user.save()

    return NextResponse.json({ message: 'Account verified successfully' }, { status: 200 })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}