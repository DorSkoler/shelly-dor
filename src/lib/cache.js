const CACHE_VERSION = 'v1'

export function getCached(key) {
  try {
    const raw = localStorage.getItem(`cache_${CACHE_VERSION}_${key}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    // Cache valid for 30 minutes
    if (Date.now() - ts > 30 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

export function setCache(key, data) {
  try {
    localStorage.setItem(`cache_${CACHE_VERSION}_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // Storage full or unavailable — ignore
  }
}
