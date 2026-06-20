import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
})

const ShippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true }
})

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestEmail: { type: String },
  guestName: { type: String },
  guestPhone: { type: String },
  items: [OrderItemSchema],
  shippingAddress: { type: ShippingAddressSchema, required: true },
  shippingTier: {
    type: String,
    enum: ['Lagos', 'Southwest', 'Nationwide'],
    required: true
  },
  shippingCost: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  promoCode: { type: String },
  total: { type: Number, required: true },
  paymentReference: { type: String, unique: true, sparse: true },
  paymentMethod: { type: String, default: 'Paystack' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  invoiceUrl: { type: String },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)