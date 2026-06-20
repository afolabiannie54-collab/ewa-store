'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justVerified = searchParams.get('verified') === 'true'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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

    router.push('/')
    router.refresh()
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
          Welcome back
        </h1>
        <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>
          Log in to your EWA account
        </p>

        {justVerified && (
          <div style={{
            background: '#EAF3EC',
            color: '#4A7C59',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            Account verified! You can now log in.
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #D6CEB8',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #D6CEB8',
                fontSize: '14px',
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#D6CEB8' }} />
          <span style={{ fontSize: '12px', color: '#7A7A5C' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#D6CEB8' }} />
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '100px',
            background: '#FFFFFF',
            color: '#283618',
            border: '1.5px solid #D6CEB8',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#7A7A5C', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#606C38', fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}