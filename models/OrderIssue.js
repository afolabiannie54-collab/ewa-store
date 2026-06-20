import mongoose from 'mongoose'

const OrderIssueSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reasonType: {
    type: String,
    enum: ['Wrong Item Received', 'Damaged Item Received', 'Missing Item'],
    required: true
  },
  details: { type: String, required: true },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Resolved'],
    default: 'Pending'
  },
  adminNote: { type: String }
}, { timestamps: true })

export default mongoose.models.OrderIssue || mongoose.model('OrderIssue', OrderIssueSchema)