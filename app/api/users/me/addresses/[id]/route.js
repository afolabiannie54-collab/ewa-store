import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const { label, fullName, phone, street, city, state, isDefault } = await req.json()

    const dbUser = await User.findById(user.id)
    const address = dbUser.addresses.find(a => a._id.toString() === id)

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    if (isDefault) {
      dbUser.addresses.forEach(addr => { addr.isDefault = false })
    }

    address.label = label ?? address.label
    address.fullName = fullName ?? address.fullName
    address.phone = phone ?? address.phone
    address.street = street ?? address.street
    address.city = city ?? address.city
    address.state = state ?? address.state
    address.isDefault = isDefault ?? address.isDefault

    await dbUser.save()

    return NextResponse.json({ addresses: dbUser.addresses }, { status: 200 })

  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const dbUser = await User.findById(user.id)

    dbUser.addresses = dbUser.addresses.filter(a => a._id.toString() !== id)
    await dbUser.save()

    return NextResponse.json({ message: 'Address deleted' }, { status: 200 })

  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}