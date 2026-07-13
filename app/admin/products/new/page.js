'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isRequired } from '@/lib/validation'

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
const SKIN_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [fieldErrors, setFieldErrors] = useState({})

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
      reader.onloadend = () => setImages(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index))

  const addVariant = () => setVariants([...variants, { size: '', price: '', stockQuantity: '' }])
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index))
  const updateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const validate = () => {
    const errors = {}
    if (!isRequired(form.name)) errors.name = 'Product name is required'
    if (!isRequired(form.slug)) errors.slug = 'Slug is required'
    if (!isRequired(form.description)) errors.description = 'Description is required'
    if (!isRequired(form.category)) errors.category = 'Please select a category'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (images.length === 0) {
      setError('At least one product image is required')
      return
    }

    const validVariants = variants.filter(v => v.size && v.price && v.stockQuantity !== '')
    if (validVariants.length === 0) {
      setError('At least one complete variant (size, price, stock) is required')
      return
    }
    if (validVariants.some(v => Number(v.price) <= 0)) {
      setError('All variant prices must be greater than ₦0')
      return
    }
    if (validVariants.some(v => Number(v.stockQuantity) < 0)) {
      setError('Stock quantity cannot be negative')
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

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-cream px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  const variantInputClass = 'rounded-[8px] border-[1.5px] border-forest/15 bg-cream px-3 py-2 text-[13px] text-forest placeholder:text-forest/35 focus:border-olive outline-none transition-colors'

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Catalog</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Add New Product
      </h1>

      {error && (
        <div className="rounded-[14px] bg-error/10 border-[1.5px] border-error/25 px-5 py-4 text-[13px] text-error mb-7">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* LEFT — main form */}
          <div className="flex flex-col gap-6">

            {/* BASIC INFO */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
              <h2 className="font-display font-bold text-forest text-[18px] mb-6">Basic Information</h2>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Product Name</label>
                <input type="text" value={form.name} onChange={handleNameChange} className={inputClass(fieldErrors.name)} />
                <FieldError message={fieldErrors.name} />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass(fieldErrors.slug)} />
                <FieldError message={fieldErrors.slug} />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className={`${inputClass(fieldErrors.description)} resize-none`}
                />
                <FieldError message={fieldErrors.description} />
              </div>
            </div>

            {/* CLASSIFICATION */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
              <h2 className="font-display font-bold text-forest text-[18px] mb-6">Classification</h2>

              <div className="mb-6">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Category</label>
                {categoriesLoading ? (
                  <p className="text-[13px] text-forest/50">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-[13px] text-error">No categories available — add one first.</p>
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`${inputClass(fieldErrors.category)} cursor-pointer`}
                  >
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                  </select>
                )}
                <FieldError message={fieldErrors.category} />
              </div>

              <div className="mb-6">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-3">Skin Type</label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPES.map(type => (
                    <button
                      key={type} type="button" onClick={() => toggleArrayField('skinType', type)}
                      className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                        form.skinType.includes(type) ? 'bg-olive text-cream' : 'border-[1.5px] border-border text-forest hover:border-olive'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-3">Skin Concern</label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_CONCERNS.map(concern => (
                    <button
                      key={concern} type="button" onClick={() => toggleArrayField('skinConcern', concern)}
                      className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                        form.skinConcern.includes(concern) ? 'bg-olive text-cream' : 'border-[1.5px] border-border text-forest hover:border-olive'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
              <h2 className="font-display font-bold text-forest text-[18px] mb-6">Product Details</h2>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Ingredients (full INCI list)</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  rows={3}
                  className={`${inputClass(false)} resize-none`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Key Actives (comma separated)</label>
                <input
                  type="text"
                  placeholder="Niacinamide 10%, Zinc PCA 1%"
                  value={form.keyActives}
                  onChange={(e) => setForm({ ...form, keyActives: e.target.value })}
                  className={inputClass(false)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">How To Use</label>
                <textarea
                  value={form.howToUse}
                  onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                  rows={2}
                  className={`${inputClass(false)} resize-none`}
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Usage Time</label>
                <select
                  value={form.usageTime}
                  onChange={(e) => setForm({ ...form, usageTime: e.target.value })}
                  className={`${inputClass(false)} cursor-pointer`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

          </div>

          {/* RIGHT — sticky sidebar */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6">

            {/* IMAGES */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
              <h2 className="font-display font-bold text-forest text-[16px] mb-1">Images</h2>
              <p className="text-[12px] text-forest/50 mb-4">At least 1 image required</p>

              <label className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border px-5 py-2 text-[12px] font-bold text-forest cursor-pointer hover:border-olive transition-colors">
                + Add Images
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>

              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-[58px] h-[58px] rounded-[10px] overflow-hidden border-[1.5px] border-border flex-shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label="Remove image"
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-forest text-cream text-[10px] flex items-center justify-center hover:bg-error transition-colors leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRICING & STOCK */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
              <h2 className="font-display font-bold text-forest text-[16px] mb-1">Pricing & Stock</h2>
              <p className="text-[12px] text-forest/50 mb-4">At least one size variant</p>

              <div className="flex flex-col gap-2.5">
                {variants.map((variant, i) => (
                  <div key={i} className="rounded-[10px] border-[1.5px] border-forest/10 p-3 relative">
                    {variants.length > 1 && (
                      <button
                        type="button" onClick={() => removeVariant(i)}
                        aria-label="Remove variant"
                        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-error/60 hover:bg-error/10 transition-colors text-[15px] leading-none"
                      >
                        ×
                      </button>
                    )}
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text" placeholder="Size (30ml)" value={variant.size}
                        onChange={(e) => updateVariant(i, 'size', e.target.value)}
                        className={`${variantInputClass} col-span-3`}
                      />
                      <input
                        type="number" placeholder="Price" value={variant.price} min="0.01" step="0.01"
                        onChange={(e) => updateVariant(i, 'price', e.target.value)}
                        className={`${variantInputClass} col-span-2`}
                      />
                      <input
                        type="number" placeholder="Qty" value={variant.stockQuantity} min="0" step="1"
                        onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                        className={variantInputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="mt-3 text-[12px] font-bold text-olive hover:underline"
              >
                + Add another size
              </button>
            </div>

            {/* VISIBILITY */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
              <h2 className="font-display font-bold text-forest text-[16px] mb-5">Visibility</h2>

              <div className="mb-4">
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`${inputClass(false)} cursor-pointer`}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <label className={`flex items-center gap-2.5 text-[13px] font-medium ${form.status === 'Active' ? 'text-forest cursor-pointer' : 'text-forest/40 cursor-not-allowed'}`}>
                <input
                  type="checkbox" checked={form.isFeatured}
                  disabled={form.status !== 'Active'}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="accent-olive w-4 h-4 disabled:cursor-not-allowed"
                />
                Feature on homepage
              </label>
              {form.status !== 'Active' && (
                <p className="text-[12px] text-forest/45 mt-2">
                  Only Active products can be featured. Set status to Active to enable this.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] py-4 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader size="sm" color="cream" /> : 'Create Product'}
            </button>

          </div>

        </div>
      </form>
    </div>
  )
}
