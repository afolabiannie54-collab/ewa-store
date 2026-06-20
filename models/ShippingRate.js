import mongoose from 'mongoose'

const ShippingRateSchema = new mongoose.Schema({
  tier: {
    type: String,
    enum: ['Lagos', 'Southwest', 'Nationwide'],
    required: true,
    unique: true
  },
  rate: { type: Number, required: true }
}, { timestamps: true })

export default mongoose.models.ShippingRate || mongoose.model('ShippingRate', ShippingRateSchema)