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
  // Accepts digits, spaces, +, -, parentheses, requires at least 7 digits total
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.length >= 7
}