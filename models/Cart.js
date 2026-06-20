import mongoose from 'mongoose'

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }
})

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [CartItemSchema]
}, { timestamps: true })

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema)