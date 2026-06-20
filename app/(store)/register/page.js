'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      router.push(`/verify?email=${encodeURIComponent(form.email)}`)

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
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
          Create your account
        </h1>
        <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>
          Join EWA for a better skincare experience
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
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
              minLength={8}
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
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
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
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
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
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}