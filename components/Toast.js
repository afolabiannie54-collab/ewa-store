'use client'

import { useEffect, useState } from 'react'

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)" />
      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)" />
      <path d="M10 9v5M10 7v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const ICONS = { success: CheckIcon, error: ErrorIcon, info: InfoIcon }

const STYLES = {
  success: 'bg-[#283618] text-cream border-olive/30',
  error: 'bg-[#C0392B] text-cream border-red-400/30',
  info: 'bg-[#606C38] text-cream border-olive/30',
}

export default function Toast({ message, type = 'success', duration = 3500, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 350)
    }, duration)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onDismiss])

  const Icon = ICONS[type]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-[14px] border-[1px] text-[13px] font-medium shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] min-w-[220px] max-w-[320px] transition-all duration-300 ease-out ${STYLES[type]} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <Icon />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onDismiss, 350)
        }}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
