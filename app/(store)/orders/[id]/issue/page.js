'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

const REASON_HELPER_TEXT = {
  'Wrong Item Received': 'Please describe what you ordered and what you received instead. A photo of the item received is required.',
  'Damaged Item Received': 'Please describe the damage. A photo showing the damage is required.',
  'Missing Item': 'Please list which item(s) were missing from your delivery. A photo of your package contents is optional but helpful.'
}

const IMAGE_REQUIRED = {
  'Wrong Item Received': true,
  'Damaged Item Received': true,
  'Missing Item': false
}

export default function ReportIssuePage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [reasonType, setReasonType] = useState('')
  const [details, setDetails] = useState('')
  const [images, setImages] = useState([])

  useEffect(() => {
    fetchOrder()
  }, [orderId])

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!reasonType) {
      setError('Please select an issue type')
      return
    }

    if (!details.trim()) {
      setError('Please describe the issue')
      return
    }

    if (IMAGE_REQUIRED[reasonType] && images.length === 0) {
      setError('A photo is required for this issue type')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/orders/${orderId}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonType, details, images })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setSubmitting(false)
        return
      }

      router.push(`/orders/${orderId}`)

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <p className="text-forest/60 text-[15px]">{error || 'Order not found'}</p>
      </div>
    )
  }

  if (order.status !== 'Delivered') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[15px] mb-4">Issues can only be reported for delivered orders.</p>
          <Link href={`/orders/${orderId}`} className="text-olive font-bold text-[14px] hover:underline">
            ← Back to order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-16">

        <Link href={`/orders/${orderId}`} className="inline-block text-[13px] font-medium text-forest/50 hover:text-olive transition-colors mb-8">
          ← Back to order
        </Link>

        <h1 className="font-display font-bold text-forest text-[40px] md:text-[52px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
          Report a Problem
        </h1>
        <p className="text-forest/55 text-[14px] mb-10">Order {order.orderNumber}</p>

        <div className="rounded-[16px] border-[1.5px] border-border bg-surface px-6 py-5 mb-10">
          <p className="text-[12px] font-bold uppercase tracking-wide text-forest/50 mb-3">Your order contained</p>
          <div className="flex flex-col gap-1.5">
            {order.items.map((item, i) => (
              <p key={i} className="text-[14px] text-forest/75">
                {item.name} ({item.size}) × {item.quantity}
              </p>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-7">
            <label className="block text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-3">
              What&apos;s the issue?
            </label>
            <div className="flex flex-col gap-2.5">
              {Object.keys(REASON_HELPER_TEXT).map(reason => (
                <label
                  key={reason}
                  className={`flex gap-3 px-5 py-4 rounded-[14px] cursor-pointer transition-colors ${
                    reasonType === reason ? 'border-[2px] border-olive bg-olive/[0.04]' : 'border-[1.5px] border-border hover:border-olive/50'
                  }`}
                >
                  <input
                    type="radio"
                    checked={reasonType === reason}
                    onChange={() => setReasonType(reason)}
                    className="mt-0.5 accent-olive"
                  />
                  <span className="text-[14px] font-medium text-forest">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {reasonType && (
            <p className="text-[13px] text-forest/70 leading-relaxed bg-surface border-[1.5px] border-border rounded-[12px] px-5 py-4 mb-7">
              {REASON_HELPER_TEXT[reasonType]}
            </p>
          )}

          <div className="mb-7">
            <label className="block text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-3">
              Describe what happened
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-5 py-4 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors resize-none"
            />
          </div>

          <div className="mb-9">
            <label className="block text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-3">
              Photo {reasonType && IMAGE_REQUIRED[reasonType] ? '(required)' : '(optional)'}
            </label>

            <label className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border px-6 py-3 text-[13px] font-bold text-forest cursor-pointer hover:border-olive transition-colors">
              Choose Photos
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>

            {images.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative w-[72px] h-[72px] rounded-[12px] overflow-hidden border-[1.5px] border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-forest text-cream text-[12px] flex items-center justify-center hover:bg-error transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-[13px] text-error mb-6">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader size="sm" color="cream" /> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}