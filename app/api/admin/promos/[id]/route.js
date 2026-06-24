import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const updates = await req.json()

    const allowedFields = ['active', 'oneTimePerCustomer']
    const sanitizedUpdates = {}
    for (const field of allowedFields) {
      if (field in updates) sanitizedUpdates[field] = updates[field]
    }

    const promo = await PromoCode.findByIdAndUpdate(id, sanitizedUpdates, { new: true })

    if (!promo) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
    }

    return NextResponse.json({ promo }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update promo error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const promo = await PromoCode.findByIdAndDelete(id)

    if (!promo) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Promo code deleted' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Delete promo error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}