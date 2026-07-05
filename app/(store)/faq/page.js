'use client'

import { useState } from 'react'
import Link from 'next/link'

function ChevronIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${className}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const FAQS = [
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Most orders arrive within 2–5 business days depending on your location. Lagos and Abuja typically arrive in 1–3 business days, while deliveries to other states may take 3–5 business days. You will receive a tracking update once your order has been dispatched.'
      },
      {
        q: 'Do you ship to all states in Nigeria?',
        a: 'Yes — we ship nationwide across all 36 states and the FCT. Delivery fees and timelines vary by location and are calculated at checkout based on your shipping address.'
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is shipped, you will receive an email with tracking details. You can also visit the My Orders section of your account at any time to view your current order status.'
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Address changes can only be made before your order is dispatched. Please contact us immediately at hello@ewaskincare.com or via the Contact page if you need to update your address, and we will do our best to help.'
      },
      {
        q: 'What if my order is delayed?',
        a: 'Delays can occasionally happen due to logistics or high demand periods. If your order has not arrived within the estimated window, check your tracking link first. If it still appears stuck, reach out to us and we will investigate on your behalf.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for items that are unopened, unused, and in their original packaging. Please review our full Return Policy for eligibility details and step-by-step instructions on how to initiate a return.'
      },
      {
        q: 'What if I receive a wrong or damaged item?',
        a: 'We are sorry if this happens — it is not the experience we want you to have. Go to My Orders in your account, find the relevant order, and tap "Report a Problem." Attach a clear photo of the issue and we will resolve it promptly with either a replacement or a full refund.'
      },
      {
        q: 'How long does a refund take to process?',
        a: 'Once your return is received and inspected, refunds are processed within 3–5 business days. The time for the funds to appear in your account depends on your bank, but typically takes 2–7 additional business days.'
      },
      {
        q: 'Are opened or used products eligible for return?',
        a: 'For hygiene reasons, we are unable to accept returns on products that have been opened or used, unless the item arrived damaged or was incorrect. If you have a concern about a product you have already opened, please contact us — we will always try to find a fair resolution.'
      }
    ]
  },
  {
    category: 'Products & Ingredients',
    items: [
      {
        q: 'Are EWA products safe for sensitive skin?',
        a: 'Yes — our formulations are designed to be gentle and effective for all skin types, including sensitive skin. However, individual skin reactions can vary. We always recommend performing a patch test before introducing any new product to your full routine.'
      },
      {
        q: 'Are your products free from parabens and sulfates?',
        a: 'EWA products are formulated without parabens, sulfates, and harsh synthetic fragrances. We believe clean formulations should not compromise on efficacy — every ingredient in our range is selected with intention. Full ingredient lists are listed on each product page.'
      },
      {
        q: 'How do I know which products are right for my skin?',
        a: 'Each product page lists the recommended skin types (Oily, Dry, Combination, Sensitive, Normal) and skin concerns it addresses (Acne, Aging, Hyperpigmentation, etc.). You can also filter the shop by skin type to find products matched to you. If you are still unsure, use the chat widget or contact us — we are happy to help.'
      },
      {
        q: 'What is a patch test and why does it matter?',
        a: 'A patch test is a simple way to check how your skin reacts to a new product before applying it to your face. Apply a small amount to the inside of your wrist or behind your ear, and wait 24 hours. If you notice no redness, itching, or irritation, the product is likely safe for broader use. We recommend this step for everyone, especially those with sensitive or reactive skin.'
      },
      {
        q: 'Can I use multiple EWA products together?',
        a: 'Absolutely — our range is designed to work well together. As a general rule, layer thinner formulas (serums) before thicker ones (moisturisers), and always finish your morning routine with SPF. Avoid combining multiple active-heavy products (e.g. two exfoliating treatments) in the same routine without building up tolerance gradually.'
      }
    ]
  },
  {
    category: 'Orders & Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major debit and credit cards (Mastercard, Visa, Verve) processed securely via Paystack. Bank transfers are also supported through Paystack at checkout. We do not accept pay-on-delivery at this time.'
      },
      {
        q: 'Is it safe to pay on your website?',
        a: 'Yes. All payments are processed through Paystack, a PCI-DSS compliant payment gateway trusted by thousands of Nigerian businesses. We never store your card details — they go directly to Paystack\'s secure servers.'
      },
      {
        q: 'Can I place an order without creating an account?',
        a: 'Yes — you can check out as a guest by entering your contact and delivery details at checkout. Creating an account gives you added benefits like saved addresses, order history, and a wishlist, but it is entirely optional.'
      },
      {
        q: 'Can I cancel my order after it has been placed?',
        a: 'You can cancel your order before it is dispatched by contacting us as soon as possible at hello@ewaskincare.com. Once an order has been shipped, it cannot be cancelled, but you may be eligible to return it after delivery in line with our return policy.'
      },
      {
        q: 'Do you offer promo codes or discounts?',
        a: 'Yes — we run promotions from time to time. You can enter a promo code at checkout in the Order Summary section. Follow us on social media or sign up for our newsletter to be the first to know about upcoming offers.'
      }
    ]
  }
]

export default function FAQPage() {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[820px] mx-auto px-6 py-16 md:py-24">

        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Help Centre</p>
        <h1
          className="font-display font-bold text-forest text-[48px] md:text-[64px] leading-none mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          FAQ
        </h1>
        <p className="text-forest/55 text-[16px] leading-relaxed mb-16 max-w-[480px]">
          Everything you need to know about our products, orders, and policies. Can&apos;t find your answer?{' '}
          <Link href="/contact" className="text-olive font-semibold hover:underline">Get in touch.</Link>
        </p>

        <div className="flex flex-col gap-8">
          {FAQS.map((section, si) => (
            <div key={si}>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-olive mb-4">
                {section.category}
              </p>
              <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
                {section.items.map((item, ii) => {
                  const id = `${si}-${ii}`
                  const isOpen = openId === id
                  return (
                    <div key={ii} className={ii > 0 ? 'border-t border-border' : ''}>
                      <button
                        onClick={() => toggle(id)}
                        className={`w-full flex items-center justify-between gap-5 px-7 py-5 text-left transition-colors ${isOpen ? 'bg-cream/60' : 'hover:bg-cream/40'}`}
                      >
                        <span className={`text-[15px] font-semibold leading-snug transition-colors ${isOpen ? 'text-olive' : 'text-forest'}`}>
                          {item.q}
                        </span>
                        <ChevronIcon className={isOpen ? 'rotate-180 text-olive' : 'text-forest/40'} />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[400px]' : 'max-h-0'}`}
                      >
                        <p className="px-7 pb-6 text-[15px] text-forest/65 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[20px] bg-forest px-8 py-10 text-center">
          <p className="font-display font-bold text-cream text-[22px] md:text-[26px] mb-2" style={{ letterSpacing: '-0.01em' }}>
            Still have questions?
          </p>
          <p className="text-cream/60 text-[15px] mb-7">
            Our team typically responds within 24 hours.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-cream text-forest text-[13px] font-bold uppercase tracking-[0.12em] px-9 py-4 hover:bg-white transition-colors"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  )
}
