// ─── In-memory Rate Limiter ───────────────────────────────────────────────────
// Simple but effective for MVP. Upgrade to Redis (Upstash) for multi-instance prod.
//
// Usage:
//   const { success, retryAfter } = await rateLimit('login', ip, { max: 5, window: 60 })
//   if (!success) return errorResponse(`Trop de tentatives. Réessayez dans ${retryAfter}s`, 429)

const store = new Map()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * @param {string} action   - e.g. 'login', 'otp', 'register'
 * @param {string} identifier - IP address or userId
 * @param {object} options
 * @param {number} options.max    - max attempts in window
 * @param {number} options.window - window in seconds
 */
export function rateLimit(action, identifier, { max = 5, window = 60 } = {}) {
  const key     = `${action}:${identifier}`
  const now     = Date.now()
  const windowMs = window * 1000

  const entry = store.get(key)

  // First request or window expired
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: max - 1, retryAfter: 0 }
  }

  // Window active
  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { success: false, remaining: 0, retryAfter }
  }

  entry.count++
  return { success: true, remaining: max - entry.count, retryAfter: 0 }
}

// ─── Preset limiters ──────────────────────────────────────────────────────────

// Login: 5 attempts per 15 minutes per IP
export function loginRateLimit(ip) {
  return rateLimit('login', ip, { max: 5, window: 15 * 60 })
}

// OTP request: 3 per 10 minutes per phone
export function otpRateLimit(phone) {
  return rateLimit('otp', phone, { max: 3, window: 10 * 60 })
}

// Register: 3 per hour per IP
export function registerRateLimit(ip) {
  return rateLimit('register', ip, { max: 3, window: 60 * 60 })
}

// API general: 100 per minute per IP
export function apiRateLimit(ip) {
  return rateLimit('api', ip, { max: 100, window: 60 })
}

// ─── Get client IP from Next.js request ──────────────────────────────────────
export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    '127.0.0.1'
  )
}
