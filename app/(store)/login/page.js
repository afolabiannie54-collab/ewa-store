'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isRequired, isValidEmail } from '@/lib/validation'

function GoogleIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" {...props}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justVerified = searchParams.get('verified') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const errors = {}
    if (!isRequired(form.email)) {
      errors.email = 'Please enter your email'
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!isRequired(form.password)) errors.password = 'Please enter your password'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-cream px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  return (
    <div className="min-h-screen flex">

      {/* LEFT: DARK PANEL */}
      <div className="hidden lg:flex relative w-1/2 bg-forest overflow-hidden items-center justify-center p-16">
        <div
          className="absolute w-[600px] h-[600px] rounded-full -top-32 -left-32"
          style={{ background: 'radial-gradient(circle, rgba(96,108,56,0.35) 0%, rgba(96,108,56,0.08) 50%, transparent 75%)' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full -bottom-40 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(254,250,224,0.06) 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-[420px]">
          <Link href="/" className="font-display font-bold text-cream text-[32px] mb-8 inline-block" style={{ letterSpacing: '-0.04em' }}>
            Ewa
          </Link>
          <h2 className="font-display font-bold text-cream text-[42px] leading-[1.1] mb-5" style={{ letterSpacing: '-0.02em' }}>
            Skin that feels like itself again
          </h2>
          <p className="text-cream/60 text-[16px] leading-relaxed">
            Log back in to pick up where you left off — your orders, wishlist, and everything in between.
          </p>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex-1 bg-cream flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">

          <Link href="/" className="lg:hidden font-display font-bold text-forest text-[28px] mb-10 inline-block" style={{ letterSpacing: '-0.04em' }}>
            Ewa
          </Link>

          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Account</p>
          <h1 className="font-display font-bold text-forest text-[36px] md:text-[40px] leading-none mb-8" style={{ letterSpacing: '-0.02em' }}>
            Log In
          </h1>

          {justVerified && (
            <div className="rounded-[12px] bg-success/10 border-[1.5px] border-success/25 px-5 py-4 text-[13px] text-success mb-6">
              Account verified! You can now log in.
            </div>
          )}

          {error && (
            <div className="rounded-[12px] bg-error/10 border-[1.5px] border-error/25 px-5 py-4 text-[13px] text-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div className="mb-7">
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass(fieldErrors.password)}
              />
              <FieldError message={fieldErrors.password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[16px] hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader size="sm" color="cream" /> : 'Log In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] font-bold text-forest/40 uppercase tracking-wide">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 rounded-full border-[1.5px] border-border bg-surface text-forest py-[14px] text-[14px] font-medium hover:bg-cream transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-[14px] text-forest/60 mt-8">
            Don&apos;t have an account?{' '}
            <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-olive font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}