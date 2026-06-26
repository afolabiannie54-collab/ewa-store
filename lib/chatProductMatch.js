import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
const SKIN_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']

// Maps common, casual phrasing to the exact enum values stored in the database.
// Without this, someone typing "breakouts" or "dark spots" would never match
// anything, since the real fields only ever contain "Acne" or "Hyperpigmentation".
const CONCERN_SYNONYMS = {
  acne: 'Acne', breakout: 'Acne', breakouts: 'Acne', pimple: 'Acne', pimples: 'Acne', spots: 'Acne',
  aging: 'Aging', wrinkle: 'Aging', wrinkles: 'Aging', 'fine lines': 'Aging', 'anti-aging': 'Aging',
  hyperpigmentation: 'Hyperpigmentation', 'dark spots': 'Hyperpigmentation', 'dark spot': 'Hyperpigmentation', discoloration: 'Hyperpigmentation',
  hydration: 'Hydration', dry: 'Hydration', dryness: 'Hydration', moisture: 'Hydration', dehydrated: 'Hydration',
  brightening: 'Brightening', glow: 'Brightening', dull: 'Brightening', dullness: 'Brightening', radiance: 'Brightening',
}

const TYPE_SYNONYMS = {
  oily: 'Oily', oil: 'Oily', greasy: 'Oily',
  dry: 'Dry',
  combination: 'Combination', combo: 'Combination',
  sensitive: 'Sensitive', irritated: 'Sensitive', reactive: 'Sensitive',
  normal: 'Normal',
}

/**
 * Given a user's chat message, finds a small set of real, active products
 * from the catalog that are relevant to what they're asking about.
 * Returns an empty array if nothing matches — callers should treat that as
 * "give general advice, don't name specific products" rather than an error.
 */
export async function findRelevantProducts(message) {
  await connectDB()

  const lowerMessage = message.toLowerCase()

  const matchedConcerns = new Set()
  const matchedTypes = new Set()

  for (const [phrase, value] of Object.entries(CONCERN_SYNONYMS)) {
    if (lowerMessage.includes(phrase)) matchedConcerns.add(value)
  }
  for (const [phrase, value] of Object.entries(TYPE_SYNONYMS)) {
    if (lowerMessage.includes(phrase)) matchedTypes.add(value)
  }

  // Also check for a real category name mentioned directly (e.g. "do you have a serum?")
  const activeCategories = await Category.find({ active: true })
  const matchedCategories = activeCategories
    .filter(cat => lowerMessage.includes(cat.name.toLowerCase()))
    .map(cat => cat.name)

  const hasAnyMatch = matchedConcerns.size > 0 || matchedTypes.size > 0 || matchedCategories.length > 0

  if (!hasAnyMatch) {
    return []
  }

  const orConditions = []
  if (matchedConcerns.size > 0) orConditions.push({ skinConcern: { $in: [...matchedConcerns] } })
  if (matchedTypes.size > 0) orConditions.push({ skinType: { $in: [...matchedTypes] } })
  if (matchedCategories.length > 0) orConditions.push({ category: { $in: matchedCategories } })

  const products = await Product.find({
    status: 'Active',
    $or: orConditions
  }).limit(5)

  return products.map(p => ({
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    startingPrice: p.startingPrice,
    inStock: p.inStock
  }))
}