'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isValidEmail } from '@/lib/validation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-cream px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' })
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')

    const errors = {}
    if (!otp.trim()) errors.otp = 'Please enter the code'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (password !== confirm) errors.confirm = 'Passwords do not match'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim(), password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        router.push('/login?reset=true')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-[420px]">
        <div className="rounded-[24px] bg-surface p-8 md:p-10" style={{ boxShadow: '0 24px 80px -16px rgba(0,0,0,0.35)' }}>

          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-2">Account</p>
          <h1 className="font-display font-bold text-forest text-[32px] leading-none mb-1.5" style={{ letterSpacing: '-0.02em' }}>
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-[14px] text-forest/50 mb-7">
            {step === 'email'
              ? "Enter your email and we'll send a reset code."
              : `We sent a 6-digit code to ${email}.`}
          </p>

          {error && (
            <div className="rounded-[12px] bg-error/10 border-[1.5px] border-error/25 px-5 py-4 text-[13px] text-error mb-6">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} noValidate>
              <div className="mb-7">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass(fieldErrors.email)}
                />
                <FieldError message={fieldErrors.email} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-5 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-6"
              >
                {loading ? <Loader size="sm" color="cream" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} noValidate>
              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">6-Digit Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className={inputClass(fieldErrors.otp)}
                />
                <FieldError message={fieldErrors.otp} />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={inputClass(fieldErrors.password)}
                />
                <FieldError message={fieldErrors.password} />
              </div>

              <div className="mb-7">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className={inputClass(fieldErrors.confirm)}
                />
                <FieldError message={fieldErrors.confirm} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-5 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              >
                {loading ? <Loader size="sm" color="cream" /> : 'Set New Password'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setPassword(''); setConfirm(''); setError('') }}
                className="w-full text-center text-[13px] text-forest/50 hover:text-olive transition-colors"
              >
                Resend code
              </button>
            </form>
          )}

          <p className="text-center text-[14px] text-forest/60 mt-7">
            <Link href="/login" className="text-olive font-bold hover:underline">Back to Log In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
