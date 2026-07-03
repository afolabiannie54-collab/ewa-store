'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Toast from '@/components/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++counterRef.current
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-[96px] right-5 z-[80] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onDismiss={() => dismissToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) {
    return () => {}
  }
  return showToast
}
