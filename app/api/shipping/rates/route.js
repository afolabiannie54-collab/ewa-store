import connectDB from '@/lib/mongodb'
import ShippingRate from '@/models/ShippingRate'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await connectDB()

    const rates = await ShippingRate.find()

    return NextResponse.json({ rates }, { status: 200 })

  } catch (error) {
    console.error('Get shipping rates error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}