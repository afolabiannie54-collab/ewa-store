'use client'

import { useEffect, useState } from 'react'

function CheckIcon({ color }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M6 10l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorIcon({ color }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon({ color }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M10 9v5M10 7v.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const TYPE_CONFIG = {
  success: { Icon: CheckIcon, color: '#16a34a', border: 'border-l-[#16a34a]' },
  error:   { Icon: ErrorIcon, color: '#dc2626', border: 'border-l-[#dc2626]' },
  info:    { Icon: InfoIcon,  color: '#2563eb', border: 'border-l-[#2563eb]' },
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

  const { Icon, color, border } = TYPE_CONFIG[type] || TYPE_CONFIG.success

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] bg-white text-[#1c1c1e] border border-[#e2e8f0] border-l-[3px] ${border} text-[13px] font-medium shadow-[0_4px_20px_-2px_rgba(0,0,0,0.14)] min-w-[220px] max-w-[320px] transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <Icon color={color} />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onDismiss, 350)
        }}
        className="flex-shrink-0 text-[#1c1c1e]/35 hover:text-[#1c1c1e]/70 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
