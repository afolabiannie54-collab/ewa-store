import mongoose from 'mongoose'

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['Unread', 'In Progress', 'Resolved'],
    default: 'Unread'
  }
}, { timestamps: true })

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema)