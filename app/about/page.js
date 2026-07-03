import Link from 'next/link'
import Image from 'next/image'
import AboutGallery from '@/components/AboutGallery'
import SageOpenButton from '@/components/SageOpenButton'
import FadeInSection from '@/components/FadeInSection'

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
      <style>{`
        @media (max-width: 1023px) {
          .sage-mockup-card { transform: none !important; }
        }
        .lg-grid-title-desc {
          display: block;
        }
        @media (min-width: 1024px) {
          .lg-grid-title-desc {
            display: grid;
            grid-template-columns: 240px 1fr;
            align-items: baseline;
            gap: 0 48px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="bg-forest min-h-screen flex items-center">
        <div className="w-full max-w-[1320px] mx-auto px-6 md:px-12 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div>
              <p className="text-cream/50 text-[13px] font-bold uppercase tracking-[0.2em] mb-5">Our Story</p>
              <h1 className="font-display font-bold text-cream text-[44px] md:text-[60px] lg:text-[68px] leading-[1.02] mb-8" style={{ letterSpacing: '-0.02em' }}>
                Built for Nigerian skin, in Nigerian heat
              </h1>
              <Link
                href="/shop"
                className="inline-block w-fit rounded-full bg-cream text-forest text-[14px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-olive hover:text-cream transition-colors"
              >
                Explore Our Products
              </Link>
            </div>

            <div
              className="relative w-full overflow-hidden"
              style={{ height: '70vh', minHeight: '420px', borderRadius: '32px' }}
            >
              <Image
                src="/about/hero.jpg"
                alt="EWA skincare lifestyle"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* OUR PHILOSOPHY */}
      <FadeInSection>
      <section className="max-w-[720px] mx-auto px-6 py-24 md:py-32 text-center">
        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.2em] mb-6">Our Philosophy</p>
        <p className="font-display font-bold text-forest text-[28px] md:text-[36px] leading-[1.3]" style={{ letterSpacing: '-0.01em' }}>
          We believe skincare should adapt to the skin and climate it's actually made for — not the other way around.
        </p>
      </section>
      </FadeInSection>

      {/* THE STORY — half and half */}
      <FadeInSection>
      <section className="max-w-[1320px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '4/5', borderRadius: '28px' }}
          >
            <Image
              src="/about/story.jpg"
              alt="EWA skincare ingredients and process"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-olive text-[13px] font-bold uppercase tracking-[0.2em] mb-5">The Story</p>
            <h2 className="font-display font-bold text-forest leading-[1.05] mb-8" style={{ fontSize: 'clamp(36px, 4vw, 54px)', letterSpacing: '-0.02em' }}>
              Most skincare wasn't made with us in mind
            </h2>
            <div className="flex flex-col gap-5 text-forest/70" style={{ fontSize: '17px', lineHeight: '1.75' }}>
              <p>
                Lagos heat doesn't behave like a skincare lab in a temperate climate. Humidity sits on your skin all day. The sun is relentless and direct. And melanin-rich skin responds to active ingredients, sun exposure, and hyperpigmentation differently than the skin most global skincare brands formulate for by default.
              </p>
              <p>
                EWA exists because that gap is real, and ignoring it doesn't make it disappear — it just shows up later as breakouts, dullness, or products that simply stop working halfway through the day. So every formula starts with two questions before anything else: how will this actually perform in Lagos heat, and how will this actually treat melanin-rich skin?
              </p>
            </div>
          </div>

        </div>
      </section>
      </FadeInSection>
      <FadeInSection>
      <AboutGallery />
      </FadeInSection>

      {/* PILLARS — editorial typographic list */}
      <FadeInSection>
      <section className="bg-forest">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-20 md:py-28">

          <div style={{ marginBottom: '80px' }}>
            <p style={{ color: 'rgba(254,250,224,0.4)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              What We Stand For
            </p>
            <h2
              className="font-display font-bold text-cream"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.02em', lineHeight: '1.05' }}
            >
              Built on a few<br />simple rules
            </h2>
          </div>

          <div>
            {pillars.map((pillar, i) => (
              <div
                key={i}
                style={{
                  borderTop: '1px solid rgba(254,250,224,0.12)',
                  padding: 'clamp(28px, 4vw, 44px) 0',
                  display: 'grid',
                  gridTemplateColumns: 'clamp(48px, 6vw, 80px) 1fr',
                  gap: 'clamp(16px, 3vw, 48px)',
                  alignItems: 'start',
                }}
              >
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 'clamp(32px, 4vw, 56px)', color: 'rgba(254,250,224,0.22)', lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="lg-grid-title-desc">
                  <h3
                    className="font-display font-bold text-cream"
                    style={{ fontSize: 'clamp(18px, 2vw, 26px)', letterSpacing: '-0.01em', marginBottom: '8px' }}
                  >
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.75', color: 'rgba(254,250,224,0.6)', maxWidth: '400px' }}>
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(254,250,224,0.12)' }} />
          </div>

        </div>
      </section>
      </FadeInSection>

      {/* SAGE TEASER */}
      <FadeInSection>
      <section style={{ background: 'linear-gradient(140deg, #384c17 0%, #4f6425 45%, #627c30 100%)', padding: 'clamp(72px, 10vw, 100px) 0 clamp(80px, 12vw, 120px)' }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: text */}
            <div>
              <p style={{ color: 'rgba(254,250,224,0.5)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Meet Sage
              </p>
              <h2
                className="font-display font-bold text-cream"
                style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', letterSpacing: '-0.02em', lineHeight: '1.06', marginBottom: '24px' }}
              >
                Your personal skincare advisor, always on
              </h2>
              <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'rgba(254,250,224,0.62)', marginBottom: '44px', maxWidth: '420px' }}>
                Whether it's a specific skin concern or just figuring out where to start — Sage is warm, knowledgeable, and right there in the corner of your screen.
              </p>
              <SageOpenButton
                style={{ display: 'inline-flex', alignItems: 'center', background: '#FEFAE0', color: '#384c17', fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
              >
                Chat with Sage
              </SageOpenButton>
            </div>

            {/* Right: chat mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
              <div className="sage-mockup-card" style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', boxShadow: '0 48px 120px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden', transform: 'rotate(1.5deg)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #283618 0%, #384c17 100%)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '20px', height: '20px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                        <path d="M16 9v17" stroke="#FEFAE0" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                        <path d="M16 13c-1.5 1-3 2.5-3 4M16 18c1.5 1 3 2.5 3 4" stroke="#FEFAE0" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                      </svg>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid #283618' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#FEFAE0', fontWeight: 700, fontSize: '16px', lineHeight: '1.2', margin: 0 }}>Sage</p>
                    <p style={{ color: 'rgba(254,250,224,0.45)', fontSize: '11px', margin: 0 }}>Your skin advisor</p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '13px', height: '13px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                      </svg>
                    </div>
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#283618', maxWidth: '230px' }}>
                      Hi! I&apos;m Sage. What&apos;s going on with your skin lately?
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#FEFAE0', maxWidth: '200px' }}>
                      My skin gets so oily by noon
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '13px', height: '13px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                      </svg>
                    </div>
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#283618', maxWidth: '230px' }}>
                      Lagos heat will do that. A lightweight gel moisturiser actually helps regulate oil — sounds counterintuitive, but it works.
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0 }} />
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '11px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(40,54,24,0.07)', background: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, background: '#f5f4f0', borderRadius: '999px', padding: '9px 16px', fontSize: '13px', color: 'rgba(40,54,24,0.35)', border: '1.5px solid #D6CEB8' }}>
                    Ask Sage anything...
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FEFAE0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
      </FadeInSection>

      {/* CLOSING CTA */}
      <FadeInSection>
      <section className="bg-forest" style={{ padding: 'clamp(80px, 12vw, 120px) 0 clamp(96px, 14vw, 140px)', overflow: 'hidden', position: 'relative' }}>
        {/* Decorative concentric circles */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', border: '1px solid rgba(254,250,224,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '480px', height: '480px', borderRadius: '50%', border: '1px solid rgba(254,250,224,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(254,250,224,0.09)', pointerEvents: 'none' }} />

        <div className="max-w-[1320px] mx-auto px-6 md:px-12" style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ color: 'rgba(254,250,224,0.4)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>
            Shop EWA
          </p>
          <h2
            className="font-display font-bold text-cream"
            style={{ fontSize: 'clamp(52px, 9vw, 120px)', letterSpacing: '-0.03em', lineHeight: '0.95', marginBottom: '56px' }}
          >
            Ready to see<br />it for yourself?
          </h2>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-cream text-forest font-bold uppercase hover:bg-olive hover:text-cream transition-colors"
            style={{ fontSize: '14px', letterSpacing: '0.1em', padding: '16px 40px' }}
          >
            Shop The Range
          </Link>
        </div>
      </section>
      </FadeInSection>

    </div>
  )
}