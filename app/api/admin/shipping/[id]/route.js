import connectDB from '@/lib/mongodb'
import ShippingRate from '@/models/ShippingRate'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { rate } = await req.json()

    if (rate === undefined || rate < 0) {
      return NextResponse.json({ error: 'Valid rate is required' }, { status: 400 })
    }

    const shippingRate = await ShippingRate.findByIdAndUpdate(id, { rate }, { new: true })

    if (!shippingRate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 })
    }

    return NextResponse.json({ rate: shippingRate }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update shipping rate error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}