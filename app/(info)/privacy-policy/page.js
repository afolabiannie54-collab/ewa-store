export default function PrivacyPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-[680px] px-6 py-20 md:py-28">
        <p className="text-[14px] font-bold uppercase tracking-wider text-olive mb-4">Legal</p>
        <h1 className="font-display font-bold text-[42px] md:text-[52px] text-forest leading-tight mb-10">
          Privacy Policy
        </h1>

        <p className="text-[16px] text-text/70 leading-relaxed mb-12">
          Last updated: June 2026
        </p>

        <div className="flex flex-col gap-12">

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Introduction</h2>
            <p className="text-[17px] text-text leading-relaxed">
              EWA ("we," "us," or "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase from us.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Information We Collect</h2>
            <p className="text-[17px] text-text leading-relaxed mb-4">
              We collect information you provide directly to us, including your name, email address, phone number, and shipping address when you create an account, place an order, or contact us.
            </p>
            <p className="text-[17px] text-text leading-relaxed">
              When you make a payment, your transaction is processed securely by Paystack. We do not store your card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">How We Use Your Information</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We use your information to process and fulfil your orders, communicate with you about your account or orders, respond to your inquiries, and improve our products and services. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Cookies</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We use essential cookies to keep you logged in and to remember items in your cart. We do not use cookies for third-party advertising tracking.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Data Security</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We take reasonable measures to protect your personal information, including encrypting passwords and using secure connections for all data transmission. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Your Rights</h2>
            <p className="text-[17px] text-text leading-relaxed">
              You may access, update, or delete your account information at any time through your account settings. If you wish to delete your account entirely, please contact us directly.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Contact Us</h2>
            <p className="text-[17px] text-text leading-relaxed">
              If you have any questions about this Privacy Policy, please reach out to us through our Contact page.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}