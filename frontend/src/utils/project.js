const TYPES = {
  professional: { label: 'Professional' },
  personal: { label: 'Personal' },
}

/** "personal" | "professional" | null — tolerant of casing and missing values. */
export const projectType = (p) => {
  const t = String(p?.type ?? '').trim().toLowerCase()
  return TYPES[t] ? t : null
}

export const typeLabel = (t) => TYPES[t]?.label ?? ''

/** A link counts only if it's a real URL — empty strings and "#" placeholders are ignored. */
export const hasLink = (url) => {
  const u = String(url ?? '').trim()
  return u !== '' && u !== '#'
}

export const projectLinks = (p) => ({
  demo: hasLink(p?.links?.demo) ? p.links.demo.trim() : null,
  repo: hasLink(p?.links?.repo) ? p.links.repo.trim() : null,
})

/** Always an array — `category` may be a single string or a list in profile.json. */
export const categoriesOf = (p) =>
  (Array.isArray(p?.category) ? p.category : [p?.category])
    .map((c) => String(c ?? '').trim())
    .filter(Boolean)

export const DEFAULT_PROFESSIONAL_NOTICE =
  "This project was built for a company or client. The source code and live system are proprietary and covered by confidentiality agreements, so they cannot be shared publicly. I'm happy to discuss the architecture, challenges, and my role in more detail."

/**
 * Notice shown when a project has no public links. A custom `notice` in
 * profile.json always wins; professional projects fall back to the default.
 */
export const projectNotice = (p, type = projectType(p), links = projectLinks(p)) => {
  if (links.demo || links.repo) return null
  const custom = String(p?.notice ?? '').trim()
  if (custom) return custom
  return type === 'professional' ? DEFAULT_PROFESSIONAL_NOTICE : null
}
