import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const dbUser = await User.findById(user.id)

    return NextResponse.json({ addresses: dbUser.addresses }, { status: 200 })

  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { label, fullName, phone, street, city, state, isDefault } = await req.json()

    if (!fullName || !phone || !street || !city || !state) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const dbUser = await User.findById(user.id)

    if (isDefault) {
      dbUser.addresses.forEach(addr => { addr.isDefault = false })
    }

    const shouldBeDefault = isDefault || dbUser.addresses.length === 0

    dbUser.addresses.push({ label, fullName, phone, street, city, state, isDefault: shouldBeDefault })
    await dbUser.save()

    return NextResponse.json({ addresses: dbUser.addresses }, { status: 201 })

  } catch (error) {
    console.error('Add address error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}