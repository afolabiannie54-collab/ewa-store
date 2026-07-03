'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import AccountNav from '@/components/AccountNav'
import { isValidEmail, isRequired } from '@/lib/validation'

export default function AccountPage() {
  const { data: session, status, update } = useSession()

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [profileFieldErrors, setProfileFieldErrors] = useState({})

  const [profilePassword, setProfilePassword] = useState('')
  const [emailChangePending, setEmailChangePending] = useState(false)
  const [confirmOtp, setConfirmOtp] = useState('')
  const [confirmingOtp, setConfirmingOtp] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})

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

  const validateProfile = () => {
    const errors = {}
    if (!isRequired(profile.name)) errors.name = 'Please enter your name'
    if (!isRequired(profile.email)) {
      errors.email = 'Please enter your email'
    } else if (!isValidEmail(profile.email)) {
      errors.email = 'Please enter a valid email address'
    }
    return errors
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const errors = validateProfile()
    setProfileFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, name: profile.name.trim(), email: profile.email.trim(), currentPassword: profilePassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setMessage(data.message)
        if (data.emailChangePending) {
          setEmailChangePending(true)
        } else {
          await update()
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

    if (!isRequired(confirmOtp)) {
      setError('Please enter the code sent to your new email')
      return
    }

    setConfirmingOtp(true)

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
    setConfirmingOtp(false)
  }

  const validatePasswordForm = () => {
    const errors = {}
    if (!isRequired(passwordForm.currentPassword)) errors.currentPassword = 'Please enter your current password'
    if (!isRequired(passwordForm.newPassword)) {
      errors.newPassword = 'Please enter a new password'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (!isRequired(passwordForm.confirmPassword)) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    return errors
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    const errors = validatePasswordForm()
    setPasswordFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

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

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-surface px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  if (status === 'loading' || loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Please log in to view your account.</p>
          <Link href="/login" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[640px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[60px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
          My Account
        </h1>
        <p className="text-forest/55 text-[15px] mb-10">Manage your profile and password</p>

        <AccountNav />

        <form onSubmit={handleProfileSubmit} noValidate className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 mb-7">
          <h2 className="font-display font-bold text-forest text-[19px] mb-6">Profile Information</h2>

          <div className="mb-4">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={inputClass(profileFieldErrors.name)}
            />
            <FieldError message={profileFieldErrors.name} />
          </div>

          <div className="mb-4">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Email</label>
            <input
              type="text"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={inputClass(profileFieldErrors.email)}
            />
            <FieldError message={profileFieldErrors.email} />
          </div>

          <div className="mb-6">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">
              Current Password <span className="text-forest/40 font-normal">(only required if changing email)</span>
            </label>
            <input
              type="password"
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
              className={inputClass(false)}
            />
          </div>

          {error && <p className="text-[13px] text-error mb-5">{error}</p>}
          {message && <p className="text-[13px] text-success mb-5">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-olive text-cream px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors disabled:opacity-60"
          >
            {saving ? <Loader size="sm" color="cream" /> : 'Save Changes'}
          </button>

          {emailChangePending && (
            <div className="mt-7 pt-7 border-t-[1.5px] border-border">
              <p className="text-[14px] font-bold text-forest mb-3">Confirm Email Change</p>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={confirmOtp}
                onChange={(e) => setConfirmOtp(e.target.value)}
                maxLength={6}
                className={`${inputClass(false)} mb-3`}
              />
              <button
                type="button"
                onClick={handleConfirmEmailChange}
                disabled={confirmingOtp}
                className="rounded-full bg-forest text-cream px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:bg-olive transition-colors disabled:opacity-60"
              >
                {confirmingOtp ? <Loader size="sm" color="cream" /> : 'Confirm New Email'}
              </button>
            </div>
          )}
        </form>

        <form onSubmit={handlePasswordSubmit} noValidate className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
          <h2 className="font-display font-bold text-forest text-[19px] mb-6">Change Password</h2>

          <div className="mb-4">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={inputClass(passwordFieldErrors.currentPassword)}
            />
            <FieldError message={passwordFieldErrors.currentPassword} />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={inputClass(passwordFieldErrors.newPassword)}
            />
            <FieldError message={passwordFieldErrors.newPassword} />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className={inputClass(passwordFieldErrors.confirmPassword)}
            />
            <FieldError message={passwordFieldErrors.confirmPassword} />
          </div>

          {passwordError && <p className="text-[13px] text-error mb-5">{passwordError}</p>}
          {passwordMessage && <p className="text-[13px] text-success mb-5">{passwordMessage}</p>}

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-full bg-forest text-cream px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:bg-olive transition-colors disabled:opacity-60"
          >
            {changingPassword ? <Loader size="sm" color="cream" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}