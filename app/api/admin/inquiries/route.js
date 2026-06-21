import connectDB from '@/lib/mongodb'
import Inquiry from '@/models/Inquiry'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const inquiries = await Inquiry.find().sort({ createdAt: -1 })

    return NextResponse.json({ inquiries }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get inquiries error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}