export default function ReturnPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-[680px] px-6 py-20 md:py-28">
        <p className="text-[14px] font-bold uppercase tracking-wider text-olive mb-4">Legal</p>
        <h1 className="font-display font-bold text-[42px] md:text-[52px] text-forest leading-tight mb-10">
          Return Policy
        </h1>

        <p className="text-[16px] text-text/70 leading-relaxed mb-12">
          Last updated: June 2026
        </p>

        <div className="flex flex-col gap-12">

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Our Policy on Returns</h2>
            <p className="text-[17px] text-text leading-relaxed">
              Due to the nature of skincare products, which are consumable and unsuitable for resale once opened, EWA does not offer general returns or refunds on opened products. We take quality seriously and want every customer to be confident in what they receive.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">When You Can Report an Issue</h2>
            <p className="text-[17px] text-text leading-relaxed mb-4">
              While we do not accept general returns, we understand that issues can occur during fulfilment and delivery. Once your order has been marked as delivered, you may report a problem if:
            </p>
            <ul className="flex flex-col gap-2 text-[17px] text-text leading-relaxed list-disc pl-6">
              <li>You received the wrong item</li>
              <li>An item arrived damaged</li>
              <li>An item was missing from your order</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">How to Report an Issue</h2>
            <p className="text-[17px] text-text leading-relaxed">
              From your order detail page, select "Report a Problem," choose the issue type, and provide a description along with a photo where required. Our team will review your report and respond with a resolution.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">What Happens Next</h2>
            <p className="text-[17px] text-text leading-relaxed">
              Once your report is reviewed, our team will either approve and resolve the issue directly with you, or let you know if we're unable to validate the report. Approved issues are resolved on a case-by-case basis, which may include a replacement item.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Order Cancellations</h2>
            <p className="text-[17px] text-text leading-relaxed">
              Orders can be cancelled only while their status is "Pending," before they have been confirmed for processing. Once an order has been confirmed, it can no longer be cancelled.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[26px] text-forest mb-4">Questions</h2>
            <p className="text-[17px] text-text leading-relaxed">
              If you have any questions about this policy, please reach out to us through our Contact page.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}