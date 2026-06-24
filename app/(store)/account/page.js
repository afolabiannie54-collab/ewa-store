'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'

export default function AccountPage() {
  const { data: session, status } = useSession()

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [profilePassword, setProfilePassword] = useState('')
  const [emailChangePending, setEmailChangePending] = useState(false)
  const [confirmOtp, setConfirmOtp] = useState('')

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (res.ok) {
        setProfile({ name: data.user.name, email: data.user.email })
      }
    } catch (err) {
      console.error('Failed to load profile')
    }
    setLoading(false)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, currentPassword: profilePassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setMessage(data.message)
        if (data.emailChangePending) {
          setEmailChangePending(true)
        }
        setProfilePassword('')
      }
    } catch (err) {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/users/me/confirm-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: confirmOtp })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setMessage('Email updated successfully')
        setEmailChangePending(false)
        setConfirmOtp('')
        fetchProfile()
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setChangingPassword(true)

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error)
      } else {
        setPasswordMessage('Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      setPasswordError('Something went wrong')
    }
    setChangingPassword(false)
  }

  if (status === 'loading' || loading) return (
    <div className="bg-cream min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  if (status === 'unauthenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Please log in to view your account.</p>
        <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>My Account</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>Manage your profile and password</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <Link href="/account" style={{ padding: '8px 16px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', fontSize: '12px', textDecoration: 'none' }}>Profile</Link>
        <Link href="/account/addresses" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Addresses</Link>
        <Link href="/wishlist" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Wishlist</Link>
      </div>

      <form onSubmit={handleProfileSubmit} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Profile Information</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '6px' }}>
            Current Password (only required if changing email)
          </label>
          <input
            type="password"
            value={profilePassword}
            onChange={(e) => setProfilePassword(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        {message && <p style={{ color: '#4A7C59', fontSize: '13px', marginBottom: '12px' }}>{message}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 24px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
        >
          {saving ? <Loader size="sm" color="cream" /> : 'Save Changes'}
        </button>

        {emailChangePending && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #D6CEB8' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>Confirm Email Change</p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={confirmOtp}
              onChange={(e) => setConfirmOtp(e.target.value)}
              maxLength={6}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px', marginBottom: '12px' }}
            />
            <button
              type="button"
              onClick={handleConfirmEmailChange}
              style={{ padding: '12px 24px', borderRadius: '100px', background: '#283618', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
            >
              Confirm New Email
            </button>
          </div>
        )}
      </form>

      <form onSubmit={handlePasswordSubmit} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Change Password</h2>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            minLength={8}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            minLength={8}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        {passwordError && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{passwordError}</p>}
        {passwordMessage && <p style={{ color: '#4A7C59', fontSize: '13px', marginBottom: '12px' }}>{passwordMessage}</p>}

        <button
          type="submit"
          disabled={changingPassword}
          style={{ padding: '12px 24px', borderRadius: '100px', background: '#283618', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
        >
          {changingPassword ? <Loader size="sm" color="cream" /> : 'Change Password'}
        </button>
      </form>
    </div>
  )
}