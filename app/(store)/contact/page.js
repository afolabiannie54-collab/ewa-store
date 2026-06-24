'use client'

import { useState } from 'react'
import Loader from '@/components/Loader'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setSuccess(true)
        setForm({ name: '', email: '', message: '' })
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>Contact Us</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>
        Have a question? Send us a message and we'll get back to you by email.
      </p>

      {success ? (
        <div style={{ background: '#EAF3EC', color: '#4A7C59', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px' }}>Thank you! Your message has been received. We'll respond to your email soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px', marginBottom: '12px' }}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px', marginBottom: '12px' }}
          />
          <textarea
            placeholder="Your Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows={5}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px', marginBottom: '16px' }}
          />

          {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

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
            {submitting ? <Loader size="sm" color="cream" /> : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}