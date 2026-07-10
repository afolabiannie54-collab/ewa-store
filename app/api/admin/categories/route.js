import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await requireAdmin()
    await connectDB()

    const categories = await Category.find().sort({ name: 1 })

    return NextResponse.json({ categories }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin()
    await connectDB()

    const { name } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()
    const escaped = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } })
    if (existing) {
      return NextResponse.json({ error: 'This category already exists' }, { status: 409 })
    }

    const category = await Category.create({ name: trimmedName })

    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}