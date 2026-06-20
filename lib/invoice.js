import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateInvoicePDF(order) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size in points

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const forest = rgb(0.157, 0.212, 0.094)   // #283618
  const olive = rgb(0.376, 0.424, 0.220)    // #606C38
  const muted = rgb(0.478, 0.478, 0.361)    // #7A7A5C
  const black = rgb(0, 0, 0)

  let y = 800

  // Header
  page.drawText('EWA', { x: 50, y, size: 24, font: fontBold, color: forest })
  page.drawText('INVOICE', { x: 450, y, size: 20, font: fontBold, color: olive })
  y -= 40

  page.drawText(`Order Number: ${order.orderNumber}`, { x: 50, y, size: 11, font, color: black })
  y -= 16
  page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}`, { x: 50, y, size: 11, font, color: black })
  y -= 16
  page.drawText(`Payment Reference: ${order.paymentReference || 'N/A'}`, { x: 50, y, size: 11, font, color: black })
  y -= 40

  // Customer / Shipping info
  page.drawText('Bill To:', { x: 50, y, size: 12, font: fontBold, color: forest })
  y -= 18
  page.drawText(order.shippingAddress.fullName, { x: 50, y, size: 11, font, color: black })
  y -= 14
  page.drawText(order.shippingAddress.phone, { x: 50, y, size: 11, font, color: black })
  y -= 14
  page.drawText(`${order.shippingAddress.street}, ${order.shippingAddress.city}`, { x: 50, y, size: 11, font, color: black })
  y -= 14
  page.drawText(order.shippingAddress.state, { x: 50, y, size: 11, font, color: black })
  y -= 40

  // Table header
  page.drawText('Item', { x: 50, y, size: 11, font: fontBold, color: forest })
  page.drawText('Size', { x: 280, y, size: 11, font: fontBold, color: forest })
  page.drawText('Qty', { x: 360, y, size: 11, font: fontBold, color: forest })
  page.drawText('Price', { x: 420, y, size: 11, font: fontBold, color: forest })
  page.drawText('Total', { x: 500, y, size: 11, font: fontBold, color: forest })
  y -= 8
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: muted })
  y -= 20

  // Table rows
  for (const item of order.items) {
    page.drawText(item.name.substring(0, 32), { x: 50, y, size: 10, font, color: black })
    page.drawText(item.size, { x: 280, y, size: 10, font, color: black })
    page.drawText(String(item.quantity), { x: 360, y, size: 10, font, color: black })
    page.drawText(`N${item.price.toLocaleString()}`, { x: 420, y, size: 10, font, color: black })
    page.drawText(`N${(item.price * item.quantity).toLocaleString()}`, { x: 500, y, size: 10, font, color: black })
    y -= 20
  }

  y -= 10
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: muted })
  y -= 24

  // Totals
  const drawTotalRow = (label, value, bold = false) => {
    page.drawText(label, { x: 400, y, size: 11, font: bold ? fontBold : font, color: bold ? forest : black })
    page.drawText(`N${value.toLocaleString()}`, { x: 500, y, size: 11, font: bold ? fontBold : font, color: bold ? forest : black })
    y -= 18
  }

  drawTotalRow('Subtotal', order.subtotal)
  drawTotalRow('Shipping', order.shippingCost)
  if (order.discount > 0) drawTotalRow('Discount', -order.discount)
  y -= 4
  drawTotalRow('Total', order.total, true)

  y -= 40
  page.drawText('Thank you for shopping with EWA.', { x: 50, y, size: 10, font, color: muted })
  y -= 14
  page.drawText('For questions about this order, contact us through your account.', { x: 50, y, size: 10, font, color: muted })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}