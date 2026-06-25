import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find({ active: true }).sort({ name: 1 })
    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error('Get public categories error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
