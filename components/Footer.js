import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-forest pt-20 overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12">

        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-14 pb-16">

          <div>
            <p
              className="font-display font-bold text-[34px] text-cream leading-none mb-5"
              style={{ letterSpacing: '-0.06em' }}
            >
              Ewa
            </p>
            <p className="text-[16px] text-cream/80 leading-relaxed mb-6 max-w-[280px]">
              Clean skincare for every skin type. Formulated with intention, made for you.
            </p>
            <p className="text-[16px] text-cream mb-2">hello@ewaskincare.com</p>
            <p className="text-[16px] text-cream">Lagos, Nigeria</p>
          </div>

          <div>
            <p className="text-[14px] font-bold uppercase tracking-wider text-cream/60 mb-5">Shop</p>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/shop?category=Cleanser" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Cleansers</Link></li>
              <li><Link href="/shop?category=Moisturizer" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Moisturizers</Link></li>
              <li><Link href="/shop?category=Serum" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Serums</Link></li>
              <li><Link href="/shop?category=Sunscreen" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Sunscreens</Link></li>
              <li><Link href="/shop?category=Treatment" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Treatments</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[14px] font-bold uppercase tracking-wider text-cream/60 mb-5">Account</p>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/account" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">My Account</Link></li>
              <li><Link href="/orders" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">My Orders</Link></li>
              <li><Link href="/wishlist" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Wishlist</Link></li>
              <li><Link href="/track-order" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[14px] font-bold uppercase tracking-wider text-cream/60 mb-5">Company</p>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/#our-story" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Privacy Policy</Link></li>
              <li><Link href="/return-policy" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Return Policy</Link></li>
              <li><Link href="/terms" className="text-[17px] font-medium text-cream hover:text-olive transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="relative border-t border-cream/15 py-8 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5">
          <p className="text-[15px] text-cream/75 max-w-[380px]">
            Have a question about your skin or an order? We're here to help.
          </p>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-cream text-forest text-[14px] font-bold uppercase tracking-wider px-8 py-4 hover:bg-white transition-colors"
          >
            Get in Touch
          </Link>
        </div>

        <div className="border-t border-cream/15 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-cream/60 order-2 sm:order-1">
            © {year} EWA Skincare. All rights reserved.
          </p>
          <div className="flex gap-7 order-1 sm:order-2">
            <Link href="/terms" className="text-[14px] font-semibold text-cream/60 hover:text-cream transition-colors uppercase tracking-wide">Terms</Link>
            <Link href="/privacy-policy" className="text-[14px] font-semibold text-cream/60 hover:text-cream transition-colors uppercase tracking-wide">Privacy</Link>
            <Link href="/return-policy" className="text-[14px] font-semibold text-cream/60 hover:text-cream transition-colors uppercase tracking-wide">Returns</Link>
          </div>
        </div>
      </div>

<div className="select-none -mb-6 sm:-mb-10 md:-mb-14 pt-4 pb-6 pointer-events-none">
        <p
          className="font-display font-bold text-cream/[0.08] text-center leading-none text-[30vw]"
          style={{ letterSpacing: '-0.08em' }}
        >
          Ewa
        </p>
      </div>
    </footer>
  )
}