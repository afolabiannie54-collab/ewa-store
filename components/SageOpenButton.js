'use client'

export default function SageOpenButton({ children, style, className }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('sage:open'))}
      style={style}
      className={className}
    >
      {children}
    </button>
  )
}
