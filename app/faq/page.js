'use client'

import { useState } from 'react'
import Link from 'next/link'
import FadeInSection from '@/components/FadeInSection'

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
        answer: 'Yes. EWA products are formulated without parabens, sulfates, and harsh synthetic fragrances. We believe clean formulations should never compromise on efficacy — every ingredient in our range is selected with intention. Full ingredient lists are on each product page.'
      },
      {
        question: 'Are your products suitable for sensitive skin?',
        answer: 'Yes. EWA products are formulated to be gentle and effective for all skin types, including sensitive skin. We always recommend performing a patch test before introducing any new product to your full routine — apply a small amount to your inner wrist or behind your ear and wait 24 hours.'
      },
      {
        question: 'How do I know which products are right for my skin?',
        answer: 'Each product page lists the recommended skin types (Oily, Dry, Combination, Sensitive, Normal) and skin concerns it addresses (Acne, Aging, Hyperpigmentation, Hydration, Brightening). You can also filter the shop by skin type. If you\'re still unsure, reach out via our Contact page and we\'ll point you in the right direction.'
      },
      {
        question: 'Can I use multiple EWA products together?',
        answer: 'Absolutely — our range is designed to layer well together. As a general rule, apply thinner formulas (serums) before thicker ones (moisturisers), and always finish your morning routine with SPF. Avoid combining multiple exfoliating actives in the same routine without building up tolerance gradually.'
      },
    ]
  },
  {
    category: 'Orders & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Most orders arrive within 2–5 business days depending on your location. Lagos and Abuja typically arrive in 1–3 business days; other states may take 3–5 business days. You will receive an email when your order is confirmed and again when it ships.'
      },
      {
        question: 'Do you ship to all states in Nigeria?',
        answer: 'Yes — we ship nationwide across all 36 states and the FCT. Delivery fees and timelines vary by location and are calculated at checkout based on your shipping address.'
      },
      {
        question: 'How do I track my order?',
        answer: 'You can track your order at any time from the Track Order page using your order number and email. If you have an account, your orders are also visible under My Orders with live status updates.'
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'You can cancel a Pending order from your order page before it is confirmed for dispatch. Once confirmed, the order is already being prepared and cannot be cancelled. For any issues after delivery, use the Report a Problem feature on your order page.'
      },
      {
        question: 'What if my order is delayed?',
        answer: 'Delays can occasionally happen due to logistics or high-demand periods. If your order has not arrived within the estimated window, check your tracking link first. If it still appears stuck, contact us at hello@ewaskincare.com and we will investigate on your behalf.'
      },
    ]
  },
  {
    category: 'Payments & Refunds',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major debit and credit cards (Mastercard, Visa, Verve) processed securely via Paystack. Bank transfers are also supported through Paystack at checkout. We do not accept pay-on-delivery at this time.'
      },
      {
        question: 'Is it safe to shop on EWA?',
        answer: 'Yes. All payments are processed through Paystack, a PCI-DSS compliant gateway trusted by thousands of Nigerian businesses. We never store your card details — they go directly to Paystack\'s secure servers over encrypted HTTPS.'
      },
      {
        question: 'Can I place an order without creating an account?',
        answer: 'Yes — you can check out as a guest by entering your contact and delivery details. Creating an account gives you added benefits like saved addresses, order history, and a wishlist, but it is entirely optional.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We accept returns within 7 days of delivery for items that are unopened and in their original packaging. If something was wrong with your order — damaged packaging, wrong item, or a missing product — use the Report a Problem feature on your order page and we will make it right promptly.'
      },
      {
        question: 'How long does a refund take to process?',
        answer: 'Once your return is received and inspected, refunds are processed within 3–5 business days. Depending on your bank, it may take a further 2–7 business days for the funds to reflect in your account.'
      },
    ]
  },
]

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border-b-[1.5px] transition-colors ${open ? 'border-olive/30' : 'border-border'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-5 py-5 text-left group"
        aria-expanded={open}
      >
        <span className={`font-display font-bold text-[16px] md:text-[18px] leading-snug transition-colors ${open ? 'text-olive' : 'text-forest group-hover:text-olive/80'}`}>
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${
            open ? 'bg-olive border-olive text-cream rotate-45' : 'border-border text-forest/40 group-hover:border-olive/50'
          }`}
        >
          <PlusIcon />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[400px] pb-6' : 'max-h-0'}`}>
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
        <div className="max-w-[900px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <p className="text-cream/50 text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Help Centre</p>
          <h1
            className="font-display font-bold text-cream text-[44px] md:text-[64px] leading-none mb-5"
            style={{ letterSpacing: '-0.03em' }}
          >
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
        {FAQS.map((section, si) => (
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
          <div className="rounded-[24px] bg-forest p-10 text-center mt-4">
            <h2
              className="font-display font-bold text-cream text-[28px] md:text-[34px] mb-3"
              style={{ letterSpacing: '-0.01em' }}
            >
              Still have questions?
            </h2>
            <p className="text-cream/60 text-[15px] mb-7 max-w-[380px] mx-auto leading-relaxed">
              Our team is happy to help with anything not covered here.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-full bg-cream text-forest text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-white transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </FadeInSection>
      </div>

    </div>
  )
}
