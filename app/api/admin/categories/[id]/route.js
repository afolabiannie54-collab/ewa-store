import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const updates = await req.json()

    const allowedFields = ['active']
    const sanitizedUpdates = {}
    for (const field of allowedFields) {
      if (field in updates) sanitizedUpdates[field] = updates[field]
    }

    const category = await Category.findByIdAndUpdate(id, sanitizedUpdates, { returnDocument: 'after' })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const productsUsingCategory = await Product.countDocuments({ category: category.name })

    if (productsUsingCategory > 0) {
      return NextResponse.json({
        error: `Cannot delete: ${productsUsingCategory} product(s) still use this category. Reassign them first.`
      }, { status: 400 })
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}