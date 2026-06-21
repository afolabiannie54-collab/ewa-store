import connectDB from '@/lib/mongodb'
import Inquiry from '@/models/Inquiry'
import { sendInquiryReply } from '@/lib/email'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { message } = await req.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 })
    }

    const inquiry = await Inquiry.findById(id)

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    await sendInquiryReply(inquiry.email, inquiry.name, inquiry.message, message)

    // Replying automatically marks it as In Progress if it was still Unread
    if (inquiry.status === 'Unread') {
      inquiry.status = 'In Progress'
      await inquiry.save()
    }

    return NextResponse.json({ message: 'Reply sent' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Send reply error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}