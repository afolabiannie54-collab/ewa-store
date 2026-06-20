import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'

// Manually read .env.local
const envFile = readFileSync('.env.local', 'utf8')
const envVars = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
)

const MONGODB_URI = envVars.MONGODB_URI
console.log('URI:', MONGODB_URI)

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  await mongoose.connection.collection('users').deleteMany({})
  await mongoose.connection.collection('shippingrates').deleteMany({})
  await mongoose.connection.collection('products').deleteMany({})
  console.log('Cleared existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await mongoose.connection.collection('users').insertOne({
    name: 'EWA Admin',
    email: 'admin@ewa.com',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    wishlist: [],
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  console.log('Admin created — email: admin@ewa.com / password: admin123')

  // Create shipping rates
  await mongoose.connection.collection('shippingrates').insertMany([
    { tier: 'Lagos', rate: 2000, createdAt: new Date(), updatedAt: new Date() },
    { tier: 'Southwest', rate: 3500, createdAt: new Date(), updatedAt: new Date() },
    { tier: 'Nationwide', rate: 5000, createdAt: new Date(), updatedAt: new Date() }
  ])
  console.log('Shipping rates created')

  // Create sample products
  await mongoose.connection.collection('products').insertMany([
    {
      name: 'Niacinamide 10% + Zinc Serum',
      slug: 'niacinamide-10-zinc-serum',
      description: 'A lightweight serum that visibly minimises the appearance of blemishes and pores while controlling excess sebum.',
      price: 8500,
      category: 'Serum',
      skinType: ['Oily', 'Combination'],
      skinConcern: ['Acne', 'Hyperpigmentation'],
      ingredients: 'Aqua, Niacinamide, Zinc PCA, Pentylene Glycol, Arginine',
      keyActives: ['Niacinamide 10%', 'Zinc PCA 1%'],
      howToUse: 'Apply a few drops to face morning and evening after cleansing.',
      usageTime: 'Both',
      images: [],
      stockQuantity: 50,
      inStock: true,
      status: 'Active',
      isFeatured: true,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Barrier Repair Moisturiser',
      slug: 'barrier-repair-moisturiser',
      description: 'A rich, nourishing cream that restores and strengthens the skin barrier for lasting hydration.',
      price: 12500,
      category: 'Moisturizer',
      skinType: ['Dry', 'Sensitive'],
      skinConcern: ['Hydration', 'Aging'],
      ingredients: 'Aqua, Ceramide NP, Ceramide AP, Hyaluronic Acid, Shea Butter',
      keyActives: ['Ceramides', 'Hyaluronic Acid', 'Shea Butter'],
      howToUse: 'Apply generously to face and neck morning and evening.',
      usageTime: 'Both',
      images: [],
      stockQuantity: 35,
      inStock: true,
      status: 'Active',
      isFeatured: true,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'SPF 50 Invisible Sunscreen',
      slug: 'spf-50-invisible-sunscreen',
      description: 'A lightweight, non-greasy sunscreen that protects against UVA and UVB rays without leaving a white cast.',
      price: 9200,
      category: 'Sunscreen',
      skinType: ['Oily', 'Combination', 'Normal'],
      skinConcern: ['Hyperpigmentation', 'Aging'],
      ingredients: 'Aqua, Zinc Oxide, Titanium Dioxide, Niacinamide, Glycerin',
      keyActives: ['Zinc Oxide', 'Titanium Dioxide', 'Niacinamide'],
      howToUse: 'Apply as the last step of your morning routine. Reapply every 2 hours.',
      usageTime: 'AM',
      images: [],
      stockQuantity: 0,
      inStock: false,
      status: 'Active',
      isFeatured: false,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
  console.log('Sample products created')

  console.log('Seed complete!')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})