import connectDB from '@/lib/mongodb'
import ChatConversation from '@/models/ChatConversation'
import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const { id } = await params
    const conversation = await ChatConversation.findOne({ _id: id, userId: user.id })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    console.error('Get conversation error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const { id } = await params
    const { messages } = await req.json()

    const conversation = await ChatConversation.findOneAndUpdate(
      { _id: id, userId: user.id },
      { messages },
      { returnDocument: 'after' }
    )

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    console.error('Update conversation error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth()
    await connectDB()

    const { id } = await params
    const conversation = await ChatConversation.findOneAndDelete({ _id: id, userId: user.id })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Conversation deleted' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    console.error('Delete conversation error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}