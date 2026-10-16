import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks.js'
import { prefersReducedMotion } from '../utils/random.js'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFX'

/** Decodes text from random glyphs once `trigger` turns true. */
export function ScrambleText({ text, as: Tag = 'span', className, trigger = true, duration = 900 }) {
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!trigger || prefersReducedMotion()) {
      setOut(text)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const revealed = Math.floor(p * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        s += i < revealed || text[i] === ' ' ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOut(s)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [trigger, text, duration])

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  )
}

export function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.15 })
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function SectionHeader({ index, kicker, title, children }) {
  const [ref, inView] = useInView({ threshold: 0.4 })
  return (
    <header ref={ref} className={`section-header ${inView ? 'is-visible' : ''}`}>
      <p className="section-kicker mono">
        <span>{index}</span> // {kicker}
      </p>
      <ScrambleText as="h2" className="section-title" text={title} trigger={inView} />
      {children && <p className="section-desc">{children}</p>}
      <div className="section-rule">
        <span />
      </div>
    </header>
  )
}

/** Crosshair-bracket cursor follower; only for fine pointers, native cursor stays. */
export function Cursor() {
  const ring = useRef(null)
  const dot = useRef(null)
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion(),
  )

  useEffect(() => {
    if (!enabled) return
    let x = -100
    let y = -100
    let tx = x
    let ty = y
    let raf
    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      dot.current.style.transform = `translate(${tx}px, ${ty}px)`
      const hit = e.target.closest?.('a, button, [data-cursor], input, textarea, select, label')
      ring.current.classList.toggle('is-hover', !!hit)
      ring.current.classList.remove('is-hidden')
      dot.current.classList.remove('is-hidden')
    }
    const onDown = () => ring.current.classList.add('is-down')
    const onUp = () => ring.current.classList.remove('is-down')
    const onLeave = () => {
      ring.current.classList.add('is-hidden')
      dot.current.classList.add('is-hidden')
    }
    const loop = () => {
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      ring.current.style.transform = `translate(${x}px, ${y}px)`
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div className="cursor-ring is-hidden" ref={ring} aria-hidden="true">
        <span />
      </div>
      <div className="cursor-dot is-hidden" ref={dot} aria-hidden="true" />
    </>
  )
}
