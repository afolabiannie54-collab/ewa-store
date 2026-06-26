import mongoose from 'mongoose'

const ChatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  products: [{ name: String, slug: String }]
}, { _id: false })

const ChatConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New conversation' },
  messages: { type: [ChatMessageSchema], default: [] }
}, { timestamps: true })

export default mongoose.models.ChatConversation || mongoose.model('ChatConversation', ChatConversationSchema)