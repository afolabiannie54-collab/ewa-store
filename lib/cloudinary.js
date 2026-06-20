import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(base64Image, folder = 'ewa-products') {
  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
    resource_type: 'image'
  })
  return result.secure_url
}

export async function deleteImage(imageUrl) {
  const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]
  await cloudinary.uploader.destroy(publicId)
}

export async function uploadInvoicePDF(pdfBuffer, orderNumber) {
  const base64PDF = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64PDF, {
    folder: 'ewa-invoices',
    public_id: orderNumber,
    resource_type: 'auto'
  })

  return result.secure_url
}

export default cloudinary