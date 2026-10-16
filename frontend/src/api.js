import localData from '@data/profile.json'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

/** Loads portfolio from the Go API, falling back to the bundled JSON when offline. */
export async function fetchPortfolio() {
  try {
    const res = await fetch(`${API_BASE}/api/portfolio`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[portfolio] API unavailable, using local data:', err.message)
    return localData
  }
}
