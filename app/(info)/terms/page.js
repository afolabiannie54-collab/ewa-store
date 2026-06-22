export default function TermsPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-[680px] px-6 py-20 md:py-28">
        <p className="text-[14px] font-bold uppercase tracking-wider text-olive mb-4">Legal</p>
        <h1 className="font-display font-bold text-[42px] md:text-[52px] text-forest leading-tight mb-10">
          Terms & Conditions
        </h1>

        <p className="text-[16px] text-text/70 leading-relaxed mb-12">
          Last updated: June 2026
        </p>

        <div className="flex flex-col gap-12">

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Agreement to Terms</h2>
            <p className="text-[17px] text-text leading-relaxed">
              By accessing or using the EWA website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Use of Our Website</h2>
            <p className="text-[17px] text-text leading-relaxed">
              You agree to use our website only for lawful purposes. You must not use our website in any way that could damage, disable, or impair its functionality, or interfere with another person's use of it.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Accounts</h2>
            <p className="text-[17px] text-text leading-relaxed">
              When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Orders & Payment</h2>
            <p className="text-[17px] text-text leading-relaxed">
              All orders are subject to product availability. Payments are processed securely through Paystack. An order is only confirmed once payment has been successfully verified. Prices are listed in Nigerian Naira and may change at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Shipping</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We currently ship within Nigeria only. Shipping costs are calculated based on the delivery region selected at checkout and are non-refundable once an order has shipped.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Product Information</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We make every effort to ensure product descriptions, ingredients, and usage instructions are accurate. However, we recommend patch testing all new skincare products before full use, and consulting a healthcare professional if you have specific skin concerns or allergies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Limitation of Liability</h2>
            <p className="text-[17px] text-text leading-relaxed">
              EWA shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or website, to the fullest extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Changes to These Terms</h2>
            <p className="text-[17px] text-text leading-relaxed">
              We may update these Terms & Conditions from time to time. Continued use of our website after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Contact Us</h2>
            <p className="text-[17px] text-text leading-relaxed">
              If you have any questions about these Terms & Conditions, please reach out to us through our Contact page.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}