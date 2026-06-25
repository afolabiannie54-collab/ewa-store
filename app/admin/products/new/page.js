'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Loader from '@/components/Loader'

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
const SKIN_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    skinType: [],
    skinConcern: [],
    ingredients: '',
    keyActives: '',
    howToUse: '',
    usageTime: 'Both',
    status: 'Draft',
    isFeatured: false
  })

  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([{ size: '', price: '', stockQuantity: '' }])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        const active = (data.categories || []).filter(c => c.active)
        setCategories(active)
        if (active.length > 0) setForm(prev => ({ ...prev, category: prev.category || active[0].name }))
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false))
  }, [])

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setForm({ ...form, name, slug })
  }

  const toggleArrayField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants([...variants, { size: '', price: '', stockQuantity: '' }])
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (images.length === 0) {
      setError('At least one product image is required')
      return
    }

    const validVariants = variants.filter(v => v.size && v.price && v.stockQuantity !== '')
    if (validVariants.length === 0) {
      setError('At least one complete variant (size, price, stock) is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          keyActives: form.keyActives.split(',').map(s => s.trim()).filter(Boolean),
          images,
          variants: validVariants.map(v => ({
            size: v.size,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity)
          }))
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      router.push('/admin/products')

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>
        Add New Product
      </h1>

      {error && (
        <div style={{ background: '#FBEAEA', color: '#C0392B', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Basic Info */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Product Name</label>
          <input
            type="text"
            value={form.name}
            onChange={handleNameChange}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Slug (auto-generated)</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          >
            {categoriesLoading
              ? <option value="" disabled>Loading...</option>
              : categories.length === 0
                ? <option value="" disabled>No active categories</option>
                : categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>

        {/* Skin Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>Skin Type</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SKIN_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleArrayField('skinType', type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: form.skinType.includes(type) ? '1px solid #606C38' : '1px solid #D6CEB8',
                  background: form.skinType.includes(type) ? '#606C38' : 'transparent',
                  color: form.skinType.includes(type) ? '#FEFAE0' : '#283618',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Concern */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>Skin Concern</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SKIN_CONCERNS.map(concern => (
              <button
                key={concern}
                type="button"
                onClick={() => toggleArrayField('skinConcern', concern)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: form.skinConcern.includes(concern) ? '1px solid #606C38' : '1px solid #D6CEB8',
                  background: form.skinConcern.includes(concern) ? '#606C38' : 'transparent',
                  color: form.skinConcern.includes(concern) ? '#FEFAE0' : '#283618',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Ingredients (full INCI list)</label>
          <textarea
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Key Actives (comma separated)</label>
          <input
            type="text"
            value={form.keyActives}
            onChange={(e) => setForm({ ...form, keyActives: e.target.value })}
            placeholder="Niacinamide 10%, Zinc PCA 1%"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>How To Use</label>
          <textarea
            value={form.howToUse}
            onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
            rows={2}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Usage Time</label>
          <select
            value={form.usageTime}
            onChange={(e) => setForm({ ...form, usageTime: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
            <option value="Both">Both</option>
          </select>
        </div>

        {/* Images */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>Product Images (1 required, up to 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#C0392B', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>Variants (size, price, stock)</label>
          {variants.map((variant, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Size (e.g. 30ml)"
                value={variant.size}
                onChange={(e) => updateVariant(i, 'size', e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px' }}
              />
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => updateVariant(i, 'price', e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px' }}
              />
              <input
                type="number"
                placeholder="Stock"
                value={variant.stockQuantity}
                onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px' }}
              />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} style={{ background: 'transparent', border: 'none', color: '#C0392B', cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            style={{ fontSize: '12px', color: '#606C38', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '4px' }}
          >
            + Add another size
          </button>
        </div>

        {/* Status & Featured */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px' }}
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          <label style={{ fontSize: '13px' }}>Feature this product on homepage</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '100px',
            background: '#606C38',
            color: '#FEFAE0',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <Loader size="sm" color="cream" /> : 'Create Product'}
        </button>
      </form>
    </div>
  )
}