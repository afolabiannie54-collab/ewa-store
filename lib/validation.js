export function isValidEmail(value) {
  if (!value || !value.trim()) return false
  // Standard practical email pattern — not RFC-perfect, but catches real mistakes
  // without being so strict it rejects valid real-world addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isRequired(value) {
  return !!(value && value.toString().trim().length > 0)
}

export function isValidPhone(value) {
  if (!value || !value.trim()) return false
  // Nigerian phone numbers:
  // Local format: 11 digits starting with 0 then 7/8/9 (e.g. 08012345678)
  // International format: 13 digits starting with 234 then 7/8/9 (e.g. 2348012345678)
  // With + prefix: +234 followed by 10 digits starting with 7/8/9 (e.g. +2348012345678)
  const digitsOnly = value.replace(/\D/g, '')
  if (digitsOnly.startsWith('234') && digitsOnly.length === 13) {
    return /^234[789]\d{9}$/.test(digitsOnly)
  }
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return /^0[789]\d{9}$/.test(digitsOnly)
  }
  return false
}