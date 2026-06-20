import mongoose from 'mongoose'

const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  inStock: { type: Boolean, default: true }
})

VariantSchema.pre('save', function () {
  this.inStock = this.stockQuantity > 0
})

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Treatment'],
    required: true
  },
  skinType: [{
    type: String,
    enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
  }],
  skinConcern: [{
    type: String,
    enum: ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']
  }],
  ingredients: { type: String },
  keyActives: [{ type: String }],
  howToUse: { type: String },
  usageTime: { type: String, enum: ['AM', 'PM', 'Both'] },
  images: [{ type: String }],
  variants: { type: [VariantSchema], required: true },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Draft'
  },
  isFeatured: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true })

// Virtual: lowest price across variants, used for product cards ("From ₦8,500")
ProductSchema.virtual('startingPrice').get(function () {
  if (!this.variants || this.variants.length === 0) return 0
  return Math.min(...this.variants.map(v => v.price))
})

// Virtual: true if ANY variant has stock
ProductSchema.virtual('inStock').get(function () {
  if (!this.variants || this.variants.length === 0) return false
  return this.variants.some(v => v.stockQuantity > 0)
})

ProductSchema.set('toJSON', { virtuals: true })
ProductSchema.set('toObject', { virtuals: true })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)