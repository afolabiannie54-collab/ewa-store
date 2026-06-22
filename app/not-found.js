import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p
          className="font-display font-bold text-forest leading-none text-[140px] md:text-[200px] mb-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          404
        </p>

        <h1 className="font-display font-bold text-[32px] md:text-[40px] text-forest mb-4">
          This page doesn't exist
        </h1>

        <p className="text-[17px] text-text/70 leading-relaxed mb-10 max-w-md mx-auto">
          The page you're looking for may have been moved, renamed, or never existed. Let's get you back to where you belong.
        </p>

        <Link
          href="/"
          className="inline-block rounded-full bg-olive text-cream text-[15px] font-bold uppercase tracking-wider px-9 py-4 hover:bg-forest transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}