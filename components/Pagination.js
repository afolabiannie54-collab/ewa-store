'use client'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages))
    const sorted = [...set].sort((a, b) => a - b)
    const result = []
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...')
      result.push(sorted[i])
    }
    return result
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="rounded-full border-[1.5px] border-border bg-surface text-forest text-[13px] font-bold px-4 py-2 hover:border-olive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="text-forest/40 px-1 text-[13px]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-[36px] h-9 rounded-full text-[13px] font-bold transition-colors ${
              p === page
                ? 'bg-olive text-cream'
                : 'border-[1.5px] border-border bg-surface text-forest hover:border-olive'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-full border-[1.5px] border-border bg-surface text-forest text-[13px] font-bold px-4 py-2 hover:border-olive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}
