import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { generateInvoicePDF } from '@/lib/invoice'

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const order = await Order.findById(id)

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    if (user.role !== 'admin') {
      const dbUser = await User.findById(user.id)
      const isOwner = order.userId?.toString() === user.id
      const isGuestMatch = dbUser.isEmailVerified && order.guestEmail === dbUser.email

      if (!isOwner && !isGuestMatch) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 })
      }
    }

    const pdfBuffer = await generateInvoicePDF(order)

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Invoice download error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate invoice' }), { status: 500 })
  }
}
