import connectDB from '@/lib/mongodb'
import ShippingRate from '@/models/ShippingRate'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const rates = await ShippingRate.find()

    return NextResponse.json({ rates }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get shipping rates error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}