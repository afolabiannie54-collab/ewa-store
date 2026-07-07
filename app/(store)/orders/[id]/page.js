'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/lib/useToast'

const STATUS_STYLES = {
  Pending: 'bg-cream text-forest border-cream/40',
  Confirmed: 'bg-olive/20 text-cream border-cream/30',
  Shipped: 'bg-cream/15 text-cream border-cream/30',
  Delivered: 'bg-success/25 text-cream border-cream/30',
  Cancelled: 'bg-error/20 text-cream border-cream/30'
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id
  const router = useRouter()
  const { status } = useSession()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const showToast = useToast()
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [invoiceError, setInvoiceError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/orders/${orderId}`)
    } else if (status === 'authenticated') {
      fetchOrder()
    }
  }, [status, orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setOrder(data.order)
      }
    } catch (err) {
      setError('Failed to load order')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Could not cancel order', 'error')
      } else {
        setShowCancelModal(false)
        showToast('Order cancelled')
        fetchOrder()
      }
    } catch (err) {
      showToast('Something went wrong', 'error')
    }
    setCancelling(false)
  }

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true)
    setInvoiceError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate invoice')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order.orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setInvoiceError(err.message || 'Could not download invoice')
    }
    setDownloadingInvoice(false)
  }

  const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered']

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <p className="text-forest/60 text-[15px]">{error || 'Order not found'}</p>
      </div>
    )
  }

  const currentIndex = statusSteps.indexOf(order.status)

  return (
    <div className="bg-cream min-h-screen">

      {/* MASTHEAD */}
      <div className="bg-forest">
        <div className="max-w-[860px] mx-auto px-6 py-12 md:py-16">
          <Link href="/orders" className="inline-block text-[13px] font-medium text-cream/60 hover:text-cream transition-colors mb-8">
            ← Back to orders
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-cream/50 mb-3">
                {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="font-display font-bold text-cream text-[40px] md:text-[56px] leading-none" style={{ letterSpacing: '-0.02em' }}>
                {order.orderNumber}
              </h1>
            </div>

            <span className={`flex-shrink-0 text-[12px] font-bold uppercase tracking-wide px-4 py-2 rounded-full border-[1.5px] ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-12 md:py-16">

        {/* TIMELINE */}
        {order.status === 'Cancelled' ? (
          <div className="rounded-[16px] bg-error/10 border-[1.5px] border-error/25 px-6 py-5 mb-12">
            <p className="text-[14px] font-medium text-error">This order was cancelled.</p>
          </div>
        ) : (
          <div className="flex justify-between mb-12">
            {statusSteps.map((step, i) => {
              const isComplete = i <= currentIndex
              const dateField = { Pending: 'createdAt', Confirmed: 'confirmedAt', Shipped: 'shippedAt', Delivered: 'deliveredAt' }[step]
              const date = order[dateField]

              return (
                <div key={step} className="flex-1 text-center relative">
                  {i > 0 && (
                    <div className={`absolute top-[15px] right-1/2 left-[-50%] h-[2px] ${i <= currentIndex ? 'bg-olive' : 'bg-border'}`} />
                  )}
                  <div className={`relative w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center ${isComplete ? 'bg-olive' : 'bg-border'}`}>
                    {isComplete && <span className="text-cream text-[13px]" aria-hidden="true">✓</span>}
                  </div>
                  <p className={`text-[13px] font-bold ${isComplete ? 'text-forest' : 'text-forest/35'}`} aria-current={i === currentIndex ? 'step' : undefined}>{step}</p>
                  {date && (
                    <p className="text-[11px] text-forest/45 mt-1">
                      {new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* RECEIPT */}
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden mb-7">
          <div className="px-7 md:px-8 py-6 border-b-[1.5px] border-border">
            <h2 className="font-display font-bold text-forest text-[19px]">Items</h2>
          </div>

          <div className="px-7 md:px-8 py-6 flex flex-col gap-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative w-[64px] h-[64px] rounded-[12px] overflow-hidden bg-cream flex-shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-forest text-[16px]">{item.name}</p>
                  <p className="text-[13px] text-forest/50 mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-forest text-[15px] whitespace-nowrap">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="px-7 md:px-8 py-6 border-t-[1.5px] border-border flex flex-col gap-2.5">
            <div className="flex justify-between text-[14px] text-forest">
              <span>Subtotal</span><span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[14px] text-forest">
              <span>Shipping ({order.shippingTier})</span><span className="font-medium">₦{order.shippingCost.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[14px] text-success">
                <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span><span className="font-medium">-₦{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[20px] font-display font-bold text-forest pt-3 mt-1 border-t-[1.5px] border-border">
              <span>Total</span><span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* SHIPPING ADDRESS */}
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 mb-9">
          <h2 className="font-display font-bold text-forest text-[19px] mb-4">Shipping Address</h2>
          <p className="text-[14px] text-forest/75 leading-relaxed">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.phone}<br />
            {order.shippingAddress.street}, {order.shippingAddress.city}<br />
            {order.shippingAddress.state}
          </p>
        </div>

        {/* ACTIONS */}
        {invoiceError && (
          <p className="text-[13px] text-error mb-4">{invoiceError}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="rounded-full border-[1.5px] border-border text-forest text-[13px] font-bold uppercase tracking-wide px-7 py-3.5 hover:border-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingInvoice ? 'Generating…' : 'Download Invoice'}
          </button>

          {order.status === 'Pending' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-full border-[1.5px] border-error text-error text-[13px] font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-error hover:text-cream transition-colors"
            >
              Cancel Order
            </button>
          )}

          {order.status === 'Delivered' && (
            <>
              <Link
                href={`/orders/${order._id}/issue`}
                className="rounded-full border-[1.5px] border-border text-forest text-[13px] font-bold uppercase tracking-wide px-7 py-3.5 hover:border-olive transition-colors"
              >
                Report a Problem
              </Link>
              {order.items.map((item, i) => (
                <Link
                  key={i}
                  href={`/api/products/redirect/${item.productId}`}
                  className="rounded-full border-[1.5px] border-border text-forest text-[13px] font-bold uppercase tracking-wide px-7 py-3.5 hover:border-olive transition-colors"
                >
                  Review {item.name}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        message="This can't be undone. Your order will be cancelled and won't be processed any further."
        confirmLabel="Cancel Order"
        danger
        loading={cancelling}
      />
    </div>
  )
}