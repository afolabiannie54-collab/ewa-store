const limits = new Map()

// Returns true if the request is allowed, false if rate-limited.
// key: typically an IP address. maxRequests per windowMs milliseconds.
export function rateLimit(key, maxRequests = 5, windowMs = 60_000) {
  const now = Date.now()
  const record = limits.get(key)

  if (!record || now > record.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) return false

  record.count++
  return true
}
