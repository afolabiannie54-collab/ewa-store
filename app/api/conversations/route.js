import connectDB from '@/lib/mongodb'
import ChatConversation from '@/models/ChatConversation'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await requireAuth()
    await connectDB()

    const conversations = await ChatConversation.find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt')

    return NextResponse.json({ conversations }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    console.error('List conversations error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth()
    await connectDB()

    const { firstMessage } = await req.json()

    const title = firstMessage
      ? (firstMessage.length > 50 ? firstMessage.slice(0, 50) + '…' : firstMessage)
      : 'New conversation'

    const conversation = await ChatConversation.create({
      userId: user.id,
      title,
      messages: []
    })

    return NextResponse.json({ conversation }, { status: 201 })

  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}