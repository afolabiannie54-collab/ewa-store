import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { sendEmailChangeOTP } from '@/lib/email'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const dbUser = await User.findById(user.id).select('-password -verificationOTP -verificationOTPExpiry -emailChangeOTP -emailChangeOTPExpiry')

    return NextResponse.json({ user: dbUser }, { status: 200 })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { name: rawName, email: rawEmail, currentPassword } = await req.json()
    const name = rawName?.trim()
    const email = rawEmail?.trim()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const dbUser = await User.findById(user.id)
    const emailChanged = email && email.toLowerCase().trim() !== dbUser.email

    if (emailChanged) {
      if (!dbUser.password) {
        return NextResponse.json({ error: 'Email cannot be changed on Google-linked accounts' }, { status: 400 })
      }

      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change your email' }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, dbUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
      }

      const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user.id } })
      if (existingEmail) {
        return NextResponse.json({ error: 'This email is already in use' }, { status: 409 })
      }

      // Don't change the email yet — store as pending and send OTP to the NEW address
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const hashedOTP = await bcrypt.hash(otp, 12)

      dbUser.pendingEmail = email.toLowerCase()
      dbUser.emailChangeOTP = hashedOTP
      dbUser.emailChangeOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
      dbUser.name = name
      await dbUser.save()

      await sendEmailChangeOTP(email.toLowerCase(), name, otp)

      return NextResponse.json({
        message: 'Verification code sent to your new email address. Please confirm to complete the change.',
        emailChangePending: true
      }, { status: 200 })
    }

    dbUser.name = name
    await dbUser.save()

    return NextResponse.json({ message: 'Profile updated', user: { name: dbUser.name, email: dbUser.email } }, { status: 200 })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}