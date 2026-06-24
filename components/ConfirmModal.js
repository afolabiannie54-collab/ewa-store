'use client'
import Loader from '@/components/Loader'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-[20px] bg-surface p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-bold text-forest text-[22px] mb-2.5">
          {title}
        </h2>
        <p className="text-[14px] text-forest/65 leading-relaxed mb-7">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border-[1.5px] border-border text-forest text-[13px] font-bold uppercase tracking-wide py-3.5 hover:border-olive transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-full text-cream text-[13px] font-bold uppercase tracking-wide py-3.5 transition-colors disabled:opacity-60 ${
              danger ? 'bg-error hover:bg-error/85' : 'bg-olive hover:bg-forest'
            }`}
          >
            {loading ? <Loader size="sm" color="cream" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}