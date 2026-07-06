'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    category: 'About EWA',
    items: [
      {
        question: 'What makes EWA different from other skincare brands?',
        answer: 'EWA is formulated specifically for Nigerian skin and Nigerian climate — not adapted from formulas made for temperate weather. Every product is designed to perform in humidity and heat, and to work with melanin-rich skin rather than around it.'
      },
      {
        question: 'Are your products free from parabens and sulfates?',
        answer: 'Yes. EWA products are formulated without parabens, sulfates, and harsh synthetic fragrances. We believe clean formulations should never compromise on efficacy — every ingredient in our range is selected with intention. Full ingredient lists are available on each product page.'
      },
      {
        question: 'Are your products suitable for sensitive skin?',
        answer: 'Yes. Our formulas are designed to be gentle and effective for all skin types, including sensitive skin. We always recommend a patch test before introducing any new product — apply a small amount to your inner wrist or behind your ear and wait 24 hours.'
      },
      {
        question: 'How do I know which products are right for my skin?',
        answer: 'Each product page lists recommended skin types and the concerns it addresses. You can also filter the shop by skin type or concern. If you\'re still unsure, chat with Sage — our AI skincare advisor — or reach out via the Contact page.'
      },
      {
        question: 'Can I use multiple EWA products together?',
        answer: 'Absolutely. Our range is designed to layer well. Apply thinner formulas (serums) before thicker ones (moisturisers), and always finish your morning routine with SPF. Avoid combining multiple exfoliating actives in the same routine without building up tolerance first.'
      },
    ]
  },
  {
    category: 'Orders & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Most orders arrive within 2–5 business days. Lagos and Abuja typically arrive in 1–3 business days; other states may take 3–5. You\'ll receive an email when your order is confirmed and again when it ships.'
      },
      {
        question: 'Do you ship to all states in Nigeria?',
        answer: 'Yes — we ship nationwide across all 36 states and the FCT. Delivery fees and timelines are calculated at checkout based on your shipping address.'
      },
      {
        question: 'How do I track my order?',
        answer: 'Use the Track Order page with your order number and email. If you have an account, your orders are also visible under My Orders with live status updates.'
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'You can cancel a Pending order from your order page before it\'s confirmed for dispatch. Once confirmed, the order is already being prepared and cannot be cancelled. For issues after delivery, use the Report a Problem feature on your order page.'
      },
      {
        question: 'What if my order is delayed?',
        answer: 'Check your order status under My Orders first. If your order appears stuck beyond the estimated delivery window, contact us at hello@ewaskincare.com and we\'ll investigate right away.'
      },
    ]
  },
  {
    category: 'Payments & Refunds',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major debit and credit cards (Mastercard, Visa, Verve) and bank transfers, processed securely via Paystack. We do not currently accept pay-on-delivery.'
      },
      {
        question: 'Is it safe to shop on EWA?',
        answer: 'Yes. All payments go through Paystack, a PCI-DSS compliant gateway trusted by thousands of Nigerian businesses. We never store your card details — they go directly to Paystack\'s encrypted servers.'
      },
      {
        question: 'Can I place an order without creating an account?',
        answer: 'Yes — guest checkout is fully supported. Creating an account gives you access to order history, saved addresses, and a wishlist, but it\'s completely optional.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'If something was wrong with your order — damaged packaging, wrong item, or a missing product — use the Report a Problem feature on your order page and we\'ll make it right. Please note that because our products are consumable skincare items, we do not offer refunds for change-of-mind purchases.'
      },
    ]
  },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border-b-[1.5px] transition-colors duration-200 ${open ? 'border-olive/20' : 'border-border'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-7 text-left group"
        aria-expanded={open}
      >
        <span className={`font-display font-bold text-[20px] md:text-[24px] leading-snug transition-colors duration-200 ${open ? 'text-olive' : 'text-forest group-hover:text-olive'}`}>
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 mt-1 w-9 h-9 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${
            open ? 'bg-olive border-olive text-cream rotate-45' : 'border-border text-forest/50 group-hover:border-olive group-hover:text-olive'
          }`}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[500px] pb-8' : 'max-h-0'}`}>
        <p className="text-[17px] text-forest/80 leading-[1.75] max-w-[680px]">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* HERO */}
      <div className="bg-forest">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-20 md:py-28">
          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.2em] mb-5">Help Centre</p>
          <h1
            className="font-display font-bold text-cream text-[52px] md:text-[80px] leading-[0.95] mb-7"
            style={{ letterSpacing: '-0.03em' }}
          >
            Frequently<br />Asked<br />Questions
          </h1>
          <p className="text-cream/65 text-[18px] max-w-[440px] leading-relaxed">
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/contact" className="text-cream font-bold underline underline-offset-2 hover:text-olive transition-colors">
              Contact us
            </Link>{' '}
            and we&apos;ll get back to you.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-24">
        {FAQS.map((section) => (
          <div key={section.category} className="mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-8">
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-olive">
                {section.category}
              </p>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div>
              {section.items.map((item, ii) => (
                <FAQItem key={ii} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}

        {/* STILL NEED HELP */}
        <div className="rounded-[28px] bg-forest px-8 md:px-16 py-14 md:py-16 text-center mt-8">
          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.2em] mb-4">Still need help?</p>
          <h2
            className="font-display font-bold text-cream text-[36px] md:text-[48px] leading-none mb-5"
            style={{ letterSpacing: '-0.02em' }}
          >
            We&apos;re here for you
          </h2>
          <p className="text-cream/60 text-[17px] mb-9 max-w-[400px] mx-auto leading-relaxed">
            Our team responds to every message. Send us a note and we&apos;ll be in touch.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-cream text-forest text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-4 hover:bg-olive hover:text-cream transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>

    </div>
  )
}