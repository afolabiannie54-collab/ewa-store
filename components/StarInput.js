'use client'

import { useState } from 'react'

function StarIcon({ filled, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StarInput({ value, onChange, size = 28 }) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value

  return (
    <div className="flex items-center gap-1 text-olive">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHoverValue(i)}
          onMouseLeave={() => setHoverValue(0)}
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
          className="transition-transform hover:scale-110"
        >
          <StarIcon filled={i <= displayValue} style={{ width: size, height: size }} />
        </button>
      ))}
    </div>
  )
}