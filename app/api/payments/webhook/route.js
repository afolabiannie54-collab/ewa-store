import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import PromoCode from '@/models/PromoCode'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoicePDF } from '@/lib/invoice'
import { uploadInvoicePDF } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

function generateOrderNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `EWA-${year}-${random}`
}

export async function POST(req) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    // Verify this request genuinely came from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const { reference, metadata } = event.data

    await connectDB()

    // Prevent duplicate order creation if webhook fires more than once
    const existingOrder = await Order.findOne({ paymentReference: reference })
    if (existingOrder) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Re-validate stock one final time before creating the order
    for (const item of metadata.items) {
      const product = await Product.findById(item.productId)
      const variant = product?.variants.find(v => v.size === item.size)

      if (!variant || variant.stockQuantity < item.quantity) {
        // Stock ran out between checkout and payment confirmation
        console.error(`Insufficient stock for ${item.name} (${item.size}) on order ${reference}`)
        // We still create the order to honor the payment, but flag it for admin attention
      }
    }

    const orderNumber = generateOrderNumber()

    const order = await Order.create({
      orderNumber,
      userId: metadata.userId || null,
      guestEmail: metadata.guestEmail || null,
      guestName: metadata.guestName || null,
      guestPhone: metadata.guestPhone || null,
      items: metadata.items,
      shippingAddress: metadata.shippingAddress,
      shippingTier: metadata.shippingTier,
      shippingCost: metadata.shippingCost,
      subtotal: metadata.subtotal,
      discount: metadata.discount,
      promoCode: metadata.promoCode || null,
      total: metadata.total,
      paymentReference: reference,
      paymentMethod: 'Paystack',
      paymentStatus: 'Paid',
      status: 'Pending'
    })

    // Decrement stock for each purchased variant
    for (const item of metadata.items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size },
        { $inc: { 'variants.$.stockQuantity': -item.quantity } }
      )
    }

    // Increment promo code usage if one was applied
    if (metadata.promoCode) {
      await PromoCode.updateOne({ code: metadata.promoCode }, { $inc: { usedCount: 1 } })
    }

    // Generate and upload invoice PDF
    try {
      const pdfBuffer = await generateInvoicePDF(order)
      const invoiceUrl = await uploadInvoicePDF(pdfBuffer, order.orderNumber)
      order.invoiceUrl = invoiceUrl
      await order.save()
    } catch (err) {
      console.error('Invoice generation failed:', err)
      // Don't fail the whole order if invoice generation has an issue
    }

    // Send confirmation email
    const recipientEmail = metadata.guestEmail || (await order.populate('userId')).userId?.email

    if (recipientEmail) {
      await sendOrderEmail(
        recipientEmail,
        'Your EWA order is confirmed',
        'Order Confirmed',
        `Thank you for your order! Your order number is ${orderNumber}. We'll notify you as your order progresses.`
      ).catch(err => console.error('Email send failed:', err))
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}