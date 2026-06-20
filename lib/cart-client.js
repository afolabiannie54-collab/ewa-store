const GUEST_CART_KEY = 'ewa_guest_cart'

export function getGuestCart() {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(GUEST_CART_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveGuestCart(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function addToGuestCart(productId, size, quantity) {
  const cart = getGuestCart()
  const existing = cart.find(item => item.productId === productId && item.size === size)

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ productId, size, quantity })
  }

  saveGuestCart(cart)
  return cart
}

export function updateGuestCartItem(productId, size, quantity) {
  const cart = getGuestCart()
  const item = cart.find(i => i.productId === productId && i.size === size)
  if (item) {
    item.quantity = quantity
  }
  saveGuestCart(cart)
  return cart
}

export function removeFromGuestCart(productId, size) {
  const cart = getGuestCart().filter(
    item => !(item.productId === productId && item.size === size)
  )
  saveGuestCart(cart)
  return cart
}

export function clearGuestCart() {
  saveGuestCart([])
}