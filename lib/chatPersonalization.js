import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import PromoCode from '@/models/PromoCode'

/**
 * Assembles real, live personalization data for a logged-in user, for use
 * as chat context. Every value here is grounded in actual database records —
 * nothing here should ever be presented to the model as fact unless it's
 * genuinely true at the moment of the request.
 */
export async function getPersonalizationContext(userId) {
  await connectDB()

  const [deliveredOrders, user, activePromos] = await Promise.all([
    Order.find({ userId, status: 'Delivered' }).sort({ deliveredAt: -1 }).limit(5),
    User.findById(userId).populate('wishlist'),
    PromoCode.find({ active: true, expiryDate: { $gt: new Date() } })
  ])

  // Flatten delivered order items into a simple, recent purchase list —
  // most recent first, deduplicated by product name so a repeat purchase
  // doesn't show up twice.
  const seenProducts = new Set()
  const recentPurchases = []
  for (const order of deliveredOrders) {
    for (const item of order.items) {
      if (!seenProducts.has(item.name)) {
        seenProducts.add(item.name)
        recentPurchases.push({ name: item.name, deliveredAt: order.deliveredAt })
      }
    }
  }

  const wishlistItems = (user?.wishlist || [])
    .filter(p => p && p.status === 'Active')
    .map(p => ({ name: p.name, slug: p.slug, startingPrice: p.startingPrice }))

  // Only surface promos this specific user can actually still use —
  // excluding ones they've already redeemed if marked one-time-per-customer,
  // and ones that have hit their overall usage cap.
  const usablePromos = []
  for (const promo of activePromos) {
    if (promo.usedCount >= promo.usageLimit) continue

    if (promo.oneTimePerCustomer) {
      const alreadyUsed = await Order.findOne({ userId, promoCode: promo.code })
      if (alreadyUsed) continue
    }

    usablePromos.push({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minimumOrderAmount: promo.minimumOrderAmount
    })
  }

  return {
    isFirstTimeCustomer: deliveredOrders.length === 0,
    recentPurchases,
    wishlistItems,
    usablePromos
  }
}