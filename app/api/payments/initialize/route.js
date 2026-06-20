import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import PromoCode from '@/models/PromoCode'
import ShippingRate from '@/models/ShippingRate'
import { getShippingTier } from '@/lib/shipping'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    const body = await req.json()

    const {
      items,           // [{ productId, size, quantity }]
      shippingAddress, // { fullName, phone, street, city, state }
      promoCode,
      guestEmail,
      guestName,
      guestPhone
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!shippingAddress || !shippingAddress.state) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    if (!user && (!guestEmail || !guestName || !guestPhone)) {
      return NextResponse.json({ error: 'Guest details are required' }, { status: 400 })
    }

    // Validate items, calculate subtotal server-side (never trust client-sent prices)
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || product.status !== 'Active') {
        return NextResponse.json({ error: `A product in your cart is no longer available` }, { status: 400 })
      }

      const variant = product.variants.find(v => v.size === item.size)
      if (!variant) {
        return NextResponse.json({ error: `${product.name} (${item.size}) is no longer available` }, { status: 400 })
      }

      if (variant.stockQuantity < item.quantity) {
        return NextResponse.json({ error: `Only ${variant.stockQuantity} left of ${product.name} (${item.size})` }, { status: 400 })
      }

      subtotal += variant.price * item.quantity

      validatedItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: item.size,
        price: variant.price,
        quantity: item.quantity
      })
    }

    // Calculate shipping
    const shippingTier = getShippingTier(shippingAddress.state)
    const shippingRateDoc = await ShippingRate.findOne({ tier: shippingTier })
    const shippingCost = shippingRateDoc?.rate || 0

    // Validate promo code if provided
    let discount = 0
    let appliedPromoCode = null

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() })

      if (!promo || !promo.active || new Date() > promo.expiryDate || promo.usedCount >= promo.usageLimit || subtotal < promo.minimumOrderAmount) {
        return NextResponse.json({ error: 'Promo code is no longer valid' }, { status: 400 })
      }

      discount = promo.discountType === 'percentage'
        ? Math.round((subtotal * promo.discountValue) / 100)
        : promo.discountValue

      discount = Math.min(discount, subtotal)
      appliedPromoCode = promo.code
    }

    const total = subtotal + shippingCost - discount

    // Generate a unique payment reference
    const reference = `EWA-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    // Store the full pending order details temporarily using the reference
    // We'll retrieve this in the webhook to actually create the order
    const pendingData = {
      reference,
      userId: user?.id || null,
      guestEmail: user ? null : guestEmail,
      guestName: user ? null : guestName,
      guestPhone: user ? null : guestPhone,
      items: validatedItems,
      shippingAddress,
      shippingTier,
      shippingCost,
      subtotal,
      discount,
      promoCode: appliedPromoCode,
      total
    }

    // We attach this data to Paystack's metadata field so the webhook can read it back
    const email = user?.email || guestEmail

    return NextResponse.json({
      reference,
      amount: total * 100, // Paystack expects kobo, not naira
      email,
      metadata: pendingData
    }, { status: 200 })

  } catch (error) {
    console.error('Initialize payment error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}