'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export default function AuthPromptModal({ isOpen, onClose, message = 'Log in to continue' }) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-[20px] bg-surface p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-forest/50 hover:text-forest transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <h2 className="font-display font-bold text-forest text-[24px] mb-2">
          {message}
        </h2>
        <p className="text-[14px] text-forest/60 mb-7">
          Log in or create an account to save items to your wishlist.
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: pathname })}
          className="w-full rounded-full border-[1.5px] border-border bg-surface py-3.5 text-[14px] font-medium text-forest hover:bg-cream transition-colors mb-3"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-muted">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className="w-full rounded-full bg-olive py-3.5 text-center text-[14px] font-bold uppercase tracking-[0.08em] text-cream hover:bg-forest transition-colors"
          >
            Log In
          </Link>
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(pathname)}`}
            className="w-full rounded-full py-3.5 text-center text-[14px] font-medium text-forest/70 hover:text-forest transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}