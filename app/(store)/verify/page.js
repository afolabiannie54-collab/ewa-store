'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isRequired } from '@/lib/validation'
import { useToast } from '@/lib/useToast'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const showToast = useToast()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isRequired(otp)) {
      setFieldErrors({ otp: 'Please enter the code sent to your email' })
      return
    }
    setFieldErrors({})
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

      showToast('Account verified!')
      router.push(`/login?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)

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
    <div className="min-h-screen bg-forest flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px] rounded-[24px] bg-surface p-8 md:p-10" style={{ boxShadow: '0 24px 80px -16px rgba(0,0,0,0.35)' }}>

        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Verification</p>
        <h1 className="font-display font-bold text-forest text-[32px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
          Check your email
        </h1>
        <p className="text-forest/60 text-[14px] leading-relaxed mb-8">
          We sent a 6-digit code to <strong className="text-forest font-bold">{email}</strong>. Enter it below.
        </p>

        {error && (
          <div className="rounded-[12px] bg-error/10 border-[1.5px] border-error/25 px-5 py-4 text-[13px] text-error mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-[12px] bg-success/10 border-[1.5px] border-success/25 px-5 py-4 text-[13px] text-success mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-7">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="000000"
              className={`w-full rounded-[12px] border-[2px] bg-cream px-5 py-4 text-[22px] text-forest text-center outline-none transition-colors ${
                fieldErrors.otp ? 'border-error' : 'border-forest/15 focus:border-olive'
              }`}
              style={{ letterSpacing: '0.3em' }}
            />
            <FieldError message={fieldErrors.otp} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-5 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4"
          >
            {loading ? <Loader size="sm" color="cream" /> : 'Verify Account'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full py-3 text-center text-[13px] font-bold text-olive hover:underline disabled:cursor-not-allowed"
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