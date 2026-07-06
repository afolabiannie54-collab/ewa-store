import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { sendPasswordResetEmail } from '@/lib/email'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (user && user.password) {
      const otp = generateOTP()
      user.resetPasswordOTP = await bcrypt.hash(otp, 10)
      user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await user.save()
      await sendPasswordResetEmail(user.email, user.name, otp)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
