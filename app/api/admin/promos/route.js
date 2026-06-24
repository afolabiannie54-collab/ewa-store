import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const promos = await PromoCode.find().sort({ createdAt: -1 })

    return NextResponse.json({ promos }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get promos error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { code, discountType, discountValue, minimumOrderAmount, expiryDate, usageLimit, oneTimePerCustomer } = await req.json()

    if (!code || !discountType || !discountValue || !expiryDate || !usageLimit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json({ error: 'This code already exists' }, { status: 409 })
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      expiryDate,
      usageLimit,
      oneTimePerCustomer: !!oneTimePerCustomer,
      active: true
    })

    return NextResponse.json({ promo }, { status: 201 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Create promo error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}