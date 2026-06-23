import Link from 'next/link'

export const metadata = {
  title: 'Our Story — EWA Skincare',
  description: 'EWA is skincare built for Nigerian skin and Nigerian climate — formulated for humidity, heat, and melanin-rich skin from the very first product.',
}

export default function AboutPage() {
  const pillars = [
    {
      title: 'Climate-Adapted',
      description: 'Formulated to actually hold up against heat and humidity, not just survive a cooler test lab.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5" />
        </svg>
      )
    },
    {
      title: 'Cruelty-Free',
      description: 'Never tested on animals, at any stage of formulation.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M8 7c-1-2-1-4 0-5M16 7c1-2 1-4 0-5" />
          <ellipse cx="12" cy="13" rx="6" ry="7" />
          <circle cx="9.5" cy="11" r="0.8" fill="currentColor" />
          <circle cx="14.5" cy="11" r="0.8" fill="currentColor" />
          <path d="M10 15.5c.6.6 1.4.6 2 0" />
        </svg>
      )
    },
    {
      title: 'Clean Ingredients',
      description: 'No noise, no filler — every ingredient earns its place in the formula.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 21c-4.5-2-7-5.5-7-10C5 6 8 3 12 3s7 3 7 8c0 4.5-2.5 8-7 10Z" />
          <path d="M12 21V9" />
        </svg>
      )
    },
    {
      title: 'Made for Melanin-Rich Skin',
      description: 'Designed with melanin-rich skin\u2019s needs and tendencies in mind, not as an afterthought.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 3c3 3.5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6.5 5-10Z" />
        </svg>
      )
    },
  ]

  return (
    <div className="bg-cream">

      {/* HERO */}
      <section className="max-w-[840px] mx-auto px-6 pt-20 md:pt-28 pb-16 text-center">
        <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-olive mb-4">
          Our Story
        </p>
        <h1 className="font-display font-bold text-forest text-[40px] md:text-[56px] leading-[1.05] mb-8" style={{ letterSpacing: '-0.02em' }}>
          Built for Nigerian skin, in Nigerian heat
        </h1>
        <p className="text-[18px] text-forest/70 leading-relaxed">
          Most skincare is formulated somewhere cold and dry, then shipped here and hoped for the best. We started from the opposite direction.
        </p>
      </section>

      {/* BODY COPY */}
      <section className="max-w-[680px] mx-auto px-6 pb-20 md:pb-28">
        <div className="flex flex-col gap-6 text-[17px] text-forest/80 leading-relaxed">
          <p>
            Lagos heat doesn&apos;t behave like a skincare lab in a temperate climate. Humidity sits on your skin all day. The sun is relentless and direct. And melanin-rich skin responds to active ingredients, sun exposure, and hyperpigmentation differently than the skin most global skincare brands formulate for by default.
          </p>
          <p>
            EWA exists because that gap is real, and ignoring it doesn&apos;t make it disappear — it just shows up later as breakouts, dullness, or products that simply stop working halfway through the day. So every formula starts with two questions before anything else: how will this actually perform in Lagos heat, and how will this actually treat melanin-rich skin?
          </p>
          <p>
            That&apos;s the whole philosophy. No padded ingredient lists, no borrowed routines from somewhere else. Just skincare built deliberately for the people actually wearing it, in the climate they actually live in.
          </p>
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="bg-forest">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {pillars.map((pillar, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-cream/10 text-cream flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <p className="font-display font-bold text-cream text-[16px] mb-2">
                  {pillar.title}
                </p>
                <p className="text-[14px] text-cream/60 leading-relaxed max-w-[220px]">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[840px] mx-auto px-6 py-20 md:py-28 text-center">
        <h2 className="font-display font-bold text-forest text-[28px] md:text-[36px] mb-6">
          Ready to see for yourself?
        </h2>
        <Link
          href="/shop"
          className="inline-block rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors"
        >
          Shop The Range
        </Link>
      </section>

    </div>
  )
}