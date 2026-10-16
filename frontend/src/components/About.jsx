import { useMemo } from 'react'
import { useCountUp, useInView } from '../hooks.js'
import { hashString, seeded } from '../utils/random.js'
import { Reveal, SectionHeader } from './ui.jsx'
import './About.css'

function Barcode({ seed }) {
  const bars = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: 46 }, () => ({ w: rand() > 0.7 ? 3 : rand() > 0.4 ? 2 : 1, gap: rand() > 0.5 ? 2 : 1 }))
  }, [seed])
  return (
    <div className="barcode" aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} style={{ width: b.w, marginRight: b.gap }} />
      ))}
    </div>
  )
}

function StatBox({ stat, start, delay }) {
  const value = useCountUp(stat.value, start, 1600 + delay)
  return (
    <div className="stat">
      <span className="stat-value">
        {value.toLocaleString('en-US')}
        <em>{stat.suffix}</em>
      </span>
      <span className="stat-label mono">{stat.label}</span>
    </div>
  )
}

export default function About({ profile }) {
  const [statsRef, statsInView] = useInView({ threshold: 0.4 })
  const idCode = useMemo(() => hashString(profile.name).toString(16).toUpperCase().padStart(8, '0'), [profile.name])

  const meta = [
    { k: 'Location', v: profile.location },
    { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
    { k: 'Time Zone', v: profile.timezone },
    { k: 'Languages', v: profile.languages.join(' · ') },
  ]

  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeader index="01" kicker="Personnel File" title="User Profile" />

        <div className="about-grid">
          <Reveal className="id-card hud-frame">
            <div className="id-head mono">
              <span>ID // 0x{idCode.slice(0, 4)}-{idCode.slice(4)}</span>
            </div>

            <div className="id-photo">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                <span className="id-initials">{profile.initials}</span>
              )}
              <i className="id-scan" aria-hidden="true" />
              <span className="id-corner mono" aria-hidden="true">
                BIO-SCAN ✓
              </span>
            </div>

            <h3 className="id-name">{profile.name}</h3>
            <p className="id-role mono">{profile.roles[0]}</p>

            <Barcode seed={profile.name} />
            <div className="id-foot mono">
              <span>{profile.alias}</span>
            </div>
          </Reveal>

          <div className="about-body">
            <Reveal className="about-bio" delay={120}>
              {profile.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>

            <Reveal as="dl" className="about-meta" delay={220}>
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="mono">{m.k}</dt>
                  <dd>{m.href ? <a href={m.href}>{m.v}</a> : m.v}</dd>
                </div>
              ))}
            </Reveal>

            <div className="stats" ref={statsRef}>
              {profile.stats.map((s, i) => (
                <StatBox key={s.label} stat={s} start={statsInView} delay={i * 150} />
              ))}
            </div>

            {profile.resumeUrl && (
              <Reveal delay={300}>
                <a className="btn btn-ghost" href={profile.resumeUrl} target="_blank" rel="noreferrer">
                  Download CV <span aria-hidden="true">↓</span>
                </a>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
