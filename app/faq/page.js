export const metadata = {
  title: 'FAQ — EWA Skincare',
  description: 'Answers to common questions about EWA skincare products, shipping, payments, and more.',
}

const faqs = [
  {
    question: 'What makes EWA different from other skincare brands?',
    answer: 'EWA is formulated specifically for Nigerian skin and Nigerian climate — not adapted from formulas made for temperate weather. Every product is designed to perform in humidity and heat, and to work with melanin-rich skin rather than around it.'
  },
  {
    question: 'Are your products suitable for sensitive skin?',
    answer: 'Yes. EWA products are formulated without harsh additives or unnecessary fillers. That said, we always recommend doing a patch test before using any new product on your full face, especially if your skin is reactive.'
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times depend on your location in Nigeria. Orders are typically confirmed within 24 hours and delivered within 2–5 business days for most states. You will receive an email when your order is confirmed and again when it ships.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major debit and credit cards via Paystack, which is fully secured. Your payment details are never stored on our servers.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Because our products are consumable skincare items, we do not offer refunds once an order has been delivered. However, if something was wrong with your order — damaged packaging, wrong item, missing product — you can report an issue directly from your order page and we will make it right.'
  },
  {
    question: 'Can I change or cancel my order?',
    answer: 'You can cancel a Pending order from your order page before it is confirmed for dispatch. Once an order is confirmed, it is already being prepared and cannot be cancelled. For any issues after delivery, please use the Report a Problem feature on your order page.'
  },
  {
    question: 'How do I track my order?',
    answer: 'You can track your order at any time from the Track Order page — just enter your order number and the email you used at checkout. If you have an account, your orders are also visible under Your Orders.'
  },
  {
    question: 'Is it safe to shop on EWA?',
    answer: 'Yes. All payments are processed securely through Paystack. We never store your card details, and all data is transmitted over encrypted HTTPS connections.'
  },
]

export default function FAQPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-16 md:py-24">

        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Help</p>
        <h1 className="font-display font-bold text-forest text-[44px] md:text-[56px] leading-none mb-4" style={{ letterSpacing: '-0.02em' }}>
          Frequently Asked Questions
        </h1>
        <p className="text-forest/55 text-[16px] mb-14 max-w-[500px]">
          Can&apos;t find what you&apos;re looking for?{' '}
          <a href="/contact" className="text-olive font-bold hover:underline">Contact us</a> and we&apos;ll get back to you.
        </p>

        <div className="flex flex-col divide-y-[1.5px] divide-border">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-6">
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                <span className="font-display font-bold text-forest text-[17px] md:text-[19px] leading-snug">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 w-7 h-7 rounded-full border-[1.5px] border-border flex items-center justify-center text-forest/50 group-open:rotate-45 transition-transform duration-200">
                  +
                </span>
              </summary>
              <p className="mt-4 text-[15px] text-forest/70 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

      </div>
    </div>
  )
}
