import mongoose from 'mongoose'

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: { type: Number, required: true },
  minimumOrderAmount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
oneTimePerCustomer: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema)