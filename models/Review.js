import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true })

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)