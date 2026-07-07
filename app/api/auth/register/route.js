import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`register:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
    }

    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOTP = await bcrypt.hash(otp, 12)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      isEmailVerified: false,
      verificationOTP: hashedOTP,
      verificationOTPExpiry: otpExpiry
    })

    await sendOTPEmail(newUser.email, newUser.name, otp)

    return NextResponse.json({
      message: 'Account created. Please check your email for a verification code.',
      email: newUser.email
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}