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

  if (loading) return (
    <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FEFAE0' }}>
      <Loader size="lg" />
    </div>
  )
  if (error && !order) return <div style={{ padding: '40px' }}>{error}</div>

  if (order.status !== 'Delivered') {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#7A7A5C' }}>Issues can only be reported for delivered orders.</p>
        <Link href={`/orders/${orderId}`} style={{ color: '#606C38', fontWeight: 500 }}>← Back to order</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href={`/orders/${orderId}`} style={{ fontSize: '13px', color: '#7A7A5C', textDecoration: 'none' }}>← Back to order</Link>

      <h1 style={{ fontFamily: 'serif', fontSize: '26px', color: '#283618', margin: '20px 0 8px' }}>Report a Problem</h1>
      <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '24px' }}>Order {order.orderNumber}</p>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#283618', marginBottom: '10px' }}>Your order contained:</p>
        {order.items.map((item, i) => (
          <p key={i} style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '4px' }}>
            • {item.name} ({item.size}) × {item.quantity}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>
            What's the issue?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(REASON_HELPER_TEXT).map(reason => (
              <label
                key={reason}
                style={{
                  display: 'flex', gap: '10px', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  border: reasonType === reason ? '1.5px solid #606C38' : '1px solid #D6CEB8'
                }}
              >
                <input type="radio" checked={reasonType === reason} onChange={() => setReasonType(reason)} />
                <span style={{ fontSize: '13px', color: '#283618' }}>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {reasonType && (
          <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '20px', background: '#FEFAE0', padding: '12px', borderRadius: '10px' }}>
            {REASON_HELPER_TEXT[reasonType]}
          </p>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>
            Describe what happened
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>
            Photo {reasonType && IMAGE_REQUIRED[reasonType] ? '(required)' : '(optional)'}
          </label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img} alt="" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#C0392B', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '14px', borderRadius: '100px',
            background: '#606C38', color: '#FEFAE0', border: 'none',
            fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? <Loader size="sm" color="cream" /> : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}