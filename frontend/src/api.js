import localData from '@data/profile.json'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Static hosting (e.g. Netlify) has no Go API: build with VITE_STATIC_DATA=true to use the bundled JSON directly.
const STATIC_ONLY = import.meta.env.VITE_STATIC_DATA === 'true'

/** Loads portfolio from the Go API, falling back to the bundled JSON when offline. */
export async function fetchPortfolio() {
  if (STATIC_ONLY) return localData
  try {
    const res = await fetch(`${API_BASE}/api/portfolio`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[portfolio] API unavailable, using local data:', err.message)
    return localData
  }
}
