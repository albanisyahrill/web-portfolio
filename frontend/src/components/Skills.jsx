import { useState } from 'react'
import { Reveal, SectionHeader } from './ui.jsx'
import './Skills.css'

const RING_COLORS = ['#2de2ff', '#1f8bff', '#6b7dff', '#9cc6ff']
const ringColor = (i) => RING_COLORS[i % RING_COLORS.length]

/** Concentric rotating rings — one per skill category, one node per skill. */
function Orbit({ groups, active, focusCat, onActive }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className={`orbit ${focusCat ? 'has-focus' : ''}`} onMouseLeave={() => onActive(null)}>
      {groups.map((g, ring) => {
        const radius = 17 + ring * 10.5
        const duration = 34 + ring * 14
        const reverse = ring % 2 === 1
        return (
          <div
            key={g.category}
            className={`orbit-ring ${focusCat === g.category ? 'is-focus' : ''}`}
            style={{
              '--r': radius,
              '--dur': `${duration}s`,
              '--dir': reverse ? 'reverse' : 'normal',
              '--counter-dir': reverse ? 'normal' : 'reverse',
              '--ring-color': ringColor(ring),
            }}
          >
            {g.items.map((name, i) => {
              const angle = (360 / g.items.length) * i + ring * 23
              const skill = { name, category: g.category, index: i, count: g.items.length }
              return (
                <button
                  key={name}
                  type="button"
                  className={`orbit-node ${active?.name === name ? 'is-active' : ''}`}
                  style={{ '--a': `${angle}deg` }}
                  onMouseEnter={() => onActive(skill)}
                  onFocus={() => onActive(skill)}
                  onClick={() => onActive(skill)}
                  onBlur={() => onActive(null)}
                  aria-label={`${name} — ${g.category}`}
                >
                  <span className="orbit-spin" aria-hidden="true">
                    <span className="orbit-text">{name}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}

      <div className="orbit-core" aria-live="polite">
        {active ? (
          <>
            <span className="orbit-core-cat mono">{active.category}</span>
            <strong className="orbit-core-name" style={{ '--len': Math.max(active.name.length, 5) }}>
              {active.name}
            </strong>
            <span className="orbit-core-meta mono">
              node {String(active.index + 1).padStart(2, '0')}/{String(active.count).padStart(2, '0')}
            </span>
          </>
        ) : (
          <>
            <span className="orbit-core-cat mono">Matrix</span>
            <strong className="orbit-core-idle">SKILL</strong>
            <span className="orbit-core-meta mono">{total} active nodes</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function Skills({ skills }) {
  const [active, setActive] = useState(null)
  const [hoverCat, setHoverCat] = useState(null)
  const focusCat = active?.category ?? hoverCat

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <SectionHeader index="02" kicker="Capabilities" title="Skill Matrix">
          Each orbit ring represents a domain and each node a technology. Hover or tap the orbit and cards to explore.
        </SectionHeader>

        <div className="skills-grid">
          <Reveal className="orbit-wrap">
            <Orbit groups={skills} active={active} focusCat={focusCat} onActive={setActive} />
          </Reveal>

          <div className="skill-groups">
            {skills.map((g, gi) => (
              <Reveal
                key={g.category}
                delay={gi * 90}
                className={`skill-group ${focusCat === g.category ? 'is-focus' : ''} ${focusCat && focusCat !== g.category ? 'is-dim' : ''}`}
                style={{ '--ring-color': ringColor(gi) }}
                onMouseEnter={() => setHoverCat(g.category)}
                onMouseLeave={() => {
                  setHoverCat(null)
                  setActive(null)
                }}
              >
                <header className="skill-group-head">
                  <span className="skill-group-idx mono">{String(gi + 1).padStart(2, '0')}</span>
                  <h3>{g.category}</h3>
                  <span className="skill-group-count mono">{g.items.length} node</span>
                </header>
                <ul className="skill-chips">
                  {g.items.map((name, i) => (
                    <li
                      key={name}
                      className={active?.name === name ? 'is-active' : ''}
                      onMouseEnter={() => setActive({ name, category: g.category, index: i, count: g.items.length })}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
