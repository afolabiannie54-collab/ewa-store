'use client'

import { useState } from 'react'
import Link from 'next/link'
import FadeInSection from '@/components/FadeInSection'

const faqs = [
  {
    category: 'About EWA',
    items: [
      {
        question: 'What makes EWA different from other skincare brands?',
        answer: 'EWA is formulated specifically for Nigerian skin and Nigerian climate — not adapted from formulas made for temperate weather. Every product is designed to perform in humidity and heat, and to work with melanin-rich skin rather than around it.'
      },
      {
        question: 'Are your products suitable for sensitive skin?',
        answer: 'Yes. EWA products are formulated without harsh additives or unnecessary fillers. That said, we always recommend doing a patch test before using any new product on your full face, especially if your skin is reactive.'
      },
    ]
  },
  {
    category: 'Orders & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Delivery times depend on your location in Nigeria. Orders are typically confirmed within 24 hours and delivered within 2–5 business days for most states. You will receive an email when your order is confirmed and again when it ships.'
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'You can cancel a Pending order from your order page before it is confirmed for dispatch. Once an order is confirmed, it is already being prepared and cannot be cancelled. For any issues after delivery, please use the Report a Problem feature on your order page.'
      },
      {
        question: 'How do I track my order?',
        answer: 'You can track your order at any time from the Track Order page — just enter your order number and the email you used at checkout. If you have an account, your orders are also visible under Your Orders.'
      },
    ]
  },
  {
    category: 'Payments & Refunds',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major debit and credit cards via Paystack, which is fully secured. Your payment details are never stored on our servers.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'Because our products are consumable skincare items, we do not offer refunds once an order has been delivered. However, if something was wrong with your order — damaged packaging, wrong item, missing product — you can report an issue directly from your order page and we will make it right.'
      },
      {
        question: 'Is it safe to shop on EWA?',
        answer: 'Yes. All payments are processed securely through Paystack. We never store your card details, and all data is transmitted over encrypted HTTPS connections.'
      },
    ]
  },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border-b-[1.5px] border-border transition-colors ${open ? 'border-olive/30' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className={`font-display font-bold text-[16px] md:text-[18px] leading-snug transition-colors ${open ? 'text-olive' : 'text-forest'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${open ? 'bg-olive border-olive text-cream rotate-45' : 'border-border text-forest/50'}`}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[400px] pb-5' : 'max-h-0'}`}>
        <p className="text-[15px] text-forest/70 leading-relaxed max-w-[640px]">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="bg-cream min-h-screen">

      <div className="bg-forest">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <p className="text-cream/50 text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Help Centre</p>
          <h1 className="font-display font-bold text-cream text-[44px] md:text-[60px] leading-none mb-5" style={{ letterSpacing: '-0.02em' }}>
            Frequently Asked<br />Questions
          </h1>
          <p className="text-cream/60 text-[16px] max-w-[480px] leading-relaxed">
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/contact" className="text-cream font-bold underline hover:text-olive transition-colors">
              Contact us
            </Link>{' '}
            and we&apos;ll get back to you.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16 md:py-20">
        {faqs.map((section, si) => (
          <FadeInSection key={section.category} delay={si * 100}>
            <div className="mb-14">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-olive mb-6">
                {section.category}
              </p>
              <div>
                {section.items.map((item, ii) => (
                  <FAQItem key={ii} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          </FadeInSection>
        ))}

        <FadeInSection delay={300}>
          <div className="rounded-[24px] bg-forest p-10 text-center mt-8">
            <h2 className="font-display font-bold text-cream text-[28px] md:text-[32px] mb-3" style={{ letterSpacing: '-0.01em' }}>
              Still have questions?
            </h2>
            <p className="text-cream/60 text-[15px] mb-7 max-w-[380px] mx-auto leading-relaxed">
              Our team is happy to help with anything not covered here.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-full bg-cream text-forest text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-olive hover:text-cream transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </FadeInSection>
      </div>
    </div>
  )
}
