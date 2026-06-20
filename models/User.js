import mongoose from 'mongoose'

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
})

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
  lastLoginAt: { type: Date },
  addresses: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)