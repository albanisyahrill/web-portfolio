import { useMemo } from 'react'
import { useTypewriter } from '../hooks.js'
import './Hero.css'

const hexPoints = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')

function HoloCore({ initials, avatar, coordinates }) {
  const ticks = useMemo(() => Array.from({ length: 72 }, (_, i) => i), [])
  return (
    <div className="core" aria-hidden="true">
      <div className="core-sweep" />
      <svg viewBox="0 0 400 400" className="core-svg">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1f8bff" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#0050ff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0050ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coreStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2de2ff" />
            <stop offset="100%" stopColor="#0050ff" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="150" fill="url(#coreGlow)" />
        <circle cx="200" cy="200" r="194" className="core-faint" />

        <g className="core-spin core-spin-slow">
          {ticks.map((i) => (
            <line
              key={i}
              x1="200"
              y1="10"
              x2="200"
              y2={i % 6 === 0 ? 26 : 17}
              transform={`rotate(${i * 5} 200 200)`}
              className={i % 6 === 0 ? 'core-tick is-major' : 'core-tick'}
            />
          ))}
        </g>

        <g className="core-spin core-spin-rev">
          <circle cx="200" cy="200" r="165" className="core-dash" />
          <circle cx="200" cy="35" r="4" className="core-node" />
          <circle cx="365" cy="200" r="2.5" className="core-node" />
        </g>

        <g className="core-spin core-spin-med">
          <circle cx="200" cy="200" r="138" className="core-arc" />
        </g>

        <g className="core-spin core-spin-fast">
          <circle cx="200" cy="200" r="118" className="core-arc-thin" />
        </g>

        <polygon points={hexPoints(200, 200, 98)} className="core-hex" />
        <polygon points={hexPoints(200, 200, 86)} className="core-hex core-hex-inner" />

        <line x1="20" y1="200" x2="80" y2="200" className="core-cross" />
        <line x1="320" y1="200" x2="380" y2="200" className="core-cross" />
        <line x1="200" y1="20" x2="200" y2="70" className="core-cross" />
        <line x1="200" y1="330" x2="200" y2="380" className="core-cross" />
      </svg>

      <div className="core-center">
        {avatar ? <img src={avatar} alt="" /> : <span style={{ '--n': Math.max(2, initials.length) }}>{initials}</span>}
      </div>
    </div>
  )
}

export default function Hero({ profile }) {
  const role = useTypewriter(profile.roles)
  const [first, ...rest] = profile.name.split(' ')

  return (
    <section id="top" className="hero">
      <div className="hero-floor" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker mono">
            <span className="status-dot" />
            [ IDENTITY VERIFIED ] — {profile.location}
          </p>

          <h1 className="hero-name" style={{ '--chars': Math.max(first.length, 4) }}>
            <span className="glitch" data-text={first}>
              {first}
            </span>
            {rest.length > 0 && <span className="hero-name-outline">{rest.join(' ')}</span>}
          </h1>

          <p className="hero-role mono" aria-label={profile.roles.join(', ')}>
            <span className="hero-prompt" aria-hidden="true">
              &gt;_
            </span>
            <span aria-hidden="true">{role}</span>
            <span className="hero-caret" aria-hidden="true" />
          </p>

          <p className="hero-tagline">{profile.tagline}</p>

          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">
              View Portfolio <span aria-hidden="true">→</span>
            </a>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">
                Download CV <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>

          <ul className="hero-socials mono">
            {profile.socials.map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <HoloCore initials={profile.initials} avatar={profile.avatar} coordinates={profile.coordinates} />
      </div>

      <div className="hero-hud mono" aria-hidden="true">
        <span>SYS://PORTFOLIO</span>
        <span>BUILD 2026.10</span>
      </div>

      
    </section>
  )
}
