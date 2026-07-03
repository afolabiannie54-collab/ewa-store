'use client'

import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', duration = 3000, onDismiss }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  const colors = {
    success: 'bg-success text-cream',
    error: 'bg-error text-cream',
    info: 'bg-forest text-cream'
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-6 py-3.5 rounded-full text-[13px] font-bold shadow-lg transition-all duration-300 whitespace-nowrap ${colors[type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {message}
    </div>
  )
}
