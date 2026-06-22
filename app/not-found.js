import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center relative overflow-hidden px-6">

      {/* Decorative shapes */}
      <svg width="340" height="340" viewBox="0 0 340 340" className="absolute -top-16 -left-20 opacity-90" aria-hidden="true">
        <circle cx="170" cy="170" r="160" fill="none" stroke="#606C38" strokeWidth="1.5" opacity="0.35" />
        <circle cx="170" cy="170" r="120" fill="#606C38" opacity="0.12" />
      </svg>

      <svg width="300" height="300" viewBox="0 0 300 300" className="absolute -bottom-16 -right-16" aria-hidden="true">
        <path d="M150 20 C220 20 280 80 280 150 C280 220 220 280 150 280 C80 280 20 220 20 150 C20 100 60 60 110 40" fill="none" stroke="#283618" strokeWidth="1.5" opacity="0.3" />
        <circle cx="150" cy="150" r="90" fill="#283618" opacity="0.08" />
      </svg>

      <svg width="120" height="120" viewBox="0 0 120 120" className="absolute top-[18%] right-[8%] hidden md:block" aria-hidden="true">
        <path d="M60 10 Q90 30 90 60 Q90 90 60 110 Q30 90 30 60 Q30 30 60 10 Z" fill="#606C38" opacity="0.15" />
      </svg>

      <svg width="90" height="90" viewBox="0 0 90 90" className="absolute bottom-[22%] left-[10%] hidden md:block" aria-hidden="true">
        <circle cx="45" cy="45" r="40" fill="none" stroke="#606C38" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 6" />
      </svg>

      <div className="relative z-10 text-center max-w-[580px]">
        <p className="text-[13px] font-bold uppercase tracking-[0.25em] text-olive mb-7">
          Page not found
        </p>

        <p
          className="font-display font-bold text-forest leading-[0.8] text-[140px] md:text-[220px] mb-8"
          style={{ letterSpacing: '-0.04em' }}
        >
          404
        </p>

        <h1 className="font-display font-bold text-[26px] md:text-[30px] text-forest mb-3.5" style={{ letterSpacing: '-0.01em' }}>
          This page doesn't exist
        </h1>

        <p className="text-[15px] text-forest/55 leading-relaxed max-w-[380px] mx-auto mb-10">
          The page you're looking for may have been moved, renamed, or never existed.
        </p>

        <Link
          href="/"
          className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-[17px] hover:bg-forest transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}