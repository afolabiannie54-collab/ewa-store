import connectDB from '@/lib/mongodb'
import Inquiry from '@/models/Inquiry'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { status } = await req.json()

    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ inquiry }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update inquiry error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}