'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      router.push('/login?verified=true')

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResending(true)

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setMessage('A new code has been sent to your email')
      }

    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setResending(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FEFAE0',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid #D6CEB8'
      }}>
        <h1 style={{
          fontFamily: 'serif',
          fontSize: '28px',
          color: '#283618',
          marginBottom: '8px'
        }}>
          Verify your email
        </h1>
        <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>

        {error && (
          <div style={{
            background: '#FBEAEA',
            color: '#C0392B',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: '#EAF3EC',
            color: '#4A7C59',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              placeholder="000000"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #D6CEB8',
                fontSize: '20px',
                letterSpacing: '0.3em',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '100px',
              background: '#606C38',
              color: '#FEFAE0',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '16px'
            }}
          >
            {loading ? <Loader size="sm" color="cream" /> : 'Verify Account'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: '#606C38',
            fontSize: '13px',
            cursor: resending ? 'not-allowed' : 'pointer',
            textAlign: 'center'
          }}
        >
          {resending ? <Loader size="sm" color="olive" /> : "Didn't get a code? Resend"}
        </button>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  )
}