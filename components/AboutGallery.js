'use client'

import Image from 'next/image'

const CARDS = [
  { src: '/about/gallery-1.jpg', alt: 'EWA product texture close-up',            ratio: '2/3',  rotate: -1.5 },
  { src: '/about/gallery-2.jpg', alt: 'Skincare application lifestyle shot',      ratio: '3/2',  rotate: 1    },
  { src: '/about/gallery-3.jpg', alt: 'EWA product on display',                  ratio: '1/1',  rotate: -2   },
  { src: '/about/gallery-4.jpg', alt: 'Ingredient detail shot',                  ratio: '3/4',  rotate: 1.5  },
  { src: '/about/gallery-5.jpg', alt: 'Morning skincare routine lifestyle shot',  ratio: '3/2',  rotate: -1   },
  { src: '/about/gallery-6.jpg', alt: 'EWA packaging detail',                    ratio: '2/3',  rotate: 2    },
]

// Duplicate so the strip loops seamlessly
const STRIP = [...CARDS, ...CARDS]

export default function AboutGallery() {
  return (
    <section className="pb-28 md:pb-36">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .gallery-strip {
          animation: marquee 20s linear infinite;
        }
        .gallery-strip:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
        <div className="text-center">
          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.2em] mb-4">In the Wild</p>
          <h2
            className="font-display font-bold text-forest"
            style={{ fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: '-0.02em' }}
          >
            A closer look
          </h2>
        </div>
      </div>

      {/* Edge-to-edge strip with gradient fade on both sides */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '140px', zIndex: 10, pointerEvents: 'none',
            background: 'linear-gradient(to right, #FEFAE0 20%, transparent)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '140px', zIndex: 10, pointerEvents: 'none',
            background: 'linear-gradient(to left, #FEFAE0 20%, transparent)',
          }}
        />

        <div
          className="gallery-strip flex items-end gap-5 w-max"
          style={{ paddingTop: '60px', paddingBottom: '32px', paddingLeft: '20px' }}
        >
          {STRIP.map((card, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                height: '36vh',
                minHeight: '200px',
                aspectRatio: card.ratio,
                borderRadius: '16px',
                overflow: 'hidden',
                transform: `rotate(${card.rotate}deg)`,
                position: 'relative',
              }}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
