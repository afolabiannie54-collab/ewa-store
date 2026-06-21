import connectDB from '@/lib/mongodb'
import Inquiry from '@/models/Inquiry'
import { sendOrderEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      message,
      status: 'Unread'
    })

    // Confirm receipt to the customer
    await sendOrderEmail(
      email,
      'We received your message',
      'Thanks for reaching out',
      `Hi ${name}, we've received your message and will get back to you as soon as possible.`
    ).catch(err => console.error('Email send failed:', err))

    return NextResponse.json({ message: 'Inquiry submitted', inquiry }, { status: 201 })

  } catch (error) {
    console.error('Submit inquiry error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}