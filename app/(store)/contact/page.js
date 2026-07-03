'use client'

import { useState } from 'react'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isRequired, isValidEmail } from '@/lib/validation'
import { useToast } from '@/lib/useToast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const showToast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!isRequired(form.name)) errors.name = 'Please enter your name'
    if (!isRequired(form.email)) {
      errors.email = 'Please enter your email'
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!isRequired(form.message)) errors.message = 'Please enter a message'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name?.trim(),
          email: form.email?.trim(),
          message: form.message?.trim()
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        showToast("Message sent — we'll get back to you soon!")
        setForm({ name: '', email: '', message: '' })
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-surface px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  return (
    <div className="bg-cream min-h-screen px-6 py-16 md:py-24">
      <div className="max-w-[560px] mx-auto">

        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Get in touch</p>
        <h1 className="font-display font-bold text-forest text-[40px] md:text-[52px] leading-none mb-4" style={{ letterSpacing: '-0.02em' }}>
          Contact Us
        </h1>
        <p className="text-forest/60 text-[15px] leading-relaxed mb-12">
          Have a question or feedback? Send us a message and we&apos;ll get back to you by email.
        </p>

        <form onSubmit={handleSubmit} noValidate>

            {error && (
              <div className="rounded-[12px] bg-error/10 border-[1.5px] border-error/25 px-5 py-4 text-[13px] text-error mb-6">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Name</label>
              <input
                type="text"
                placeholder="Anna Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass(fieldErrors.name)}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            <div className="mb-5">
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Email</label>
              <input
                type="text"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div className="mb-8">
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Message</label>
              <textarea
                placeholder="Tell us what&apos;s on your mind..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className={`${inputClass(fieldErrors.message)} resize-none`}
              />
              <FieldError message={fieldErrors.message} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-5 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader size="sm" color="cream" /> : 'Send Message'}
            </button>
          </form>
      </div>
    </div>
  )
}