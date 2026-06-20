import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const body = await req.json()
    const {
      name, slug, description, category, skinType, skinConcern,
      ingredients, keyActives, howToUse, usageTime,
      images, variants, status, isFeatured
    } = body

    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (slug && slug !== product.slug) {
      const existingSlug = await Product.findOne({ slug, _id: { $ne: id } })
      if (existingSlug) {
        return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
      }
    }

   
    const uploadedImages = []
    for (const img of images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img)
        uploadedImages.push(url)
      } else {
        uploadedImages.push(img)
      }
    }

 
    const removedImages = product.images.filter(img => !uploadedImages.includes(img))
    for (const img of removedImages) {
      await deleteImage(img).catch(() => {})
    }

    product.name = name ?? product.name
    product.slug = slug ?? product.slug
    product.description = description ?? product.description
    product.category = category ?? product.category
    product.skinType = skinType ?? product.skinType
    product.skinConcern = skinConcern ?? product.skinConcern
    product.ingredients = ingredients ?? product.ingredients
    product.keyActives = keyActives ?? product.keyActives
    product.howToUse = howToUse ?? product.howToUse
    product.usageTime = usageTime ?? product.usageTime
    product.images = uploadedImages
    product.variants = variants ?? product.variants
    product.status = status ?? product.status
    product.isFeatured = isFeatured ?? product.isFeatured

    await product.save()

    return NextResponse.json({ product }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    for (const img of product.images) {
      await deleteImage(img).catch(() => {})
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}