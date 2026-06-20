import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const { code, subtotal } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase() })

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })
    }

    if (!promo.active) {
      return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 })
    }

    if (new Date() > promo.expiryDate) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 })
    }

    if (promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 })
    }

    if (subtotal < promo.minimumOrderAmount) {
      return NextResponse.json({
        error: `This code requires a minimum order of ₦${promo.minimumOrderAmount.toLocaleString()}`
      }, { status: 400 })
    }

    let discount = 0
    if (promo.discountType === 'percentage') {
      discount = Math.round((subtotal * promo.discountValue) / 100)
    } else {
      discount = promo.discountValue
    }

    // Never let discount exceed the subtotal
    discount = Math.min(discount, subtotal)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount
    }, { status: 200 })

  } catch (error) {
    console.error('Validate promo error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}