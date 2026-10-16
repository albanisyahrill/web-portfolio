import { useEffect, useMemo, useRef, useState } from 'react'
import { scrollToSection, useNow } from '../hooks.js'
import { ScrambleText } from './ui.jsx'
import './SideNav.css'

function Clock({ timezone }) {
  const now = useNow(1000)
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  let time
  try {
    time = now.toLocaleTimeString('en-GB', { ...opts, timeZone: timezone })
  } catch {
    time = now.toLocaleTimeString('en-GB', opts)
  }
  return <span className="side-clock">{time}</span>
}

const isTyping = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]')

/**
 * Left rail navigation. Each node shows a ring that fills as you read its
 * section; hovering reveals a decoding label; number keys 0–N jump around.
 * Below 900px it becomes a slide-in drawer opened from a floating button.
 */
export default function SideNav({ profile, sections }) {
  const items = useMemo(() => [{ id: 'top', label: 'Home', hint: 'Starting point' }, ...sections], [sections])
  const [active, setActive] = useState('top')
  const [hovered, setHovered] = useState(null)
  const [open, setOpen] = useState(false)
  const nodeRefs = useRef({})
  const fillRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      const atEnd = window.scrollY >= max - 2
      let current = items[0].id
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= vh * 0.4) current = it.id
        const p = atEnd && r.top < vh ? 1 : Math.min(1, Math.max(0, (vh * 0.4 - r.top) / r.height))
        nodeRefs.current[it.id]?.style.setProperty('--p', p.toFixed(3))
      }
      if (atEnd) current = items[items.length - 1].id
      fillRef.current?.style.setProperty('--fill', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      if (document.querySelector('.modal')) return
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      const n = Number(e.key)
      if (e.key.length === 1 && Number.isInteger(n) && n < items.length) {
        e.preventDefault()
        scrollToSection(items[n].id)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items])

  // Magnetic pull: the node drifts toward the pointer while hovered.
  const magnet = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--tx', `${(e.clientX - (r.left + 20)) * 0.3}px`)
    el.style.setProperty('--ty', `${(e.clientY - (r.top + r.height / 2)) * 0.3}px`)
  }
  const release = (e) => {
    e.currentTarget.style.setProperty('--tx', '0px')
    e.currentTarget.style.setProperty('--ty', '0px')
    setHovered(null)
  }

  return (
    <>
      <button
        type="button"
        className={`side-toggle ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="side-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`side-backdrop ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="side-nav" className={`side ${open ? 'is-open' : ''}`}>
        <a href="#top" className="side-logo" aria-label="Back to home" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <polygon points="24,2 43,13 43,35 24,46 5,35 5,13" />
            <polygon points="24,8 38,16 38,32 24,40 10,32 10,16" className="side-logo-inner" />
          </svg>
          <span>{profile.initials}</span>
        </a>

        <nav className="side-nav" aria-label="Main navigation">
          <div className="side-list">
            <span className="side-track" aria-hidden="true">
              <span className="side-fill" ref={fillRef} />
            </span>
            <ul>
              {items.map((it, i) => {
                const isActive = active === it.id
                const isHover = hovered === it.id
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      ref={(el) => {
                        nodeRefs.current[it.id] = el
                      }}
                      className={`side-item ${isActive ? 'is-active' : ''} ${isHover ? 'is-hover' : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                      aria-label={it.label}
                      onPointerEnter={() => setHovered(it.id)}
                      onPointerMove={magnet}
                      onPointerLeave={release}
                      onFocus={() => setHovered(it.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="side-node" aria-hidden="true">
                        <span className="side-ring" />
                        <span className="side-core mono">{i}</span>
                      </span>
                      <span className="side-flyout" aria-hidden="true">
                        <span className="side-flyout-idx mono">{String(i).padStart(2, '0')} //</span>
                        <ScrambleText className="side-flyout-label" text={it.label} trigger={isHover || open} duration={450} />
                        <span className="side-flyout-hint mono">{it.hint}</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        <div className="side-foot mono">
          <span className="status-dot" title="Online" />
          <Clock timezone={profile.timezone} />
          <span className="side-alias">{profile.alias}</span>
          <span className="side-keys" title={`Press 0–${items.length - 1} to jump between sections`}>
            0–{items.length - 1}
          </span>
        </div>
      </aside>
    </>
  )
}
