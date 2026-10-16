import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './utils/random.js'

export function useInView({ threshold = 0.2, rootMargin = '0px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

export function useTypewriter(words, { typeSpeed = 65, deleteSpeed = 30, pause = 1700 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!words?.length) return
    const word = words[index % words.length]
    let t
    if (!deleting && text === word) {
      t = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      t = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => i + 1)
      }, 250)
    } else {
      const next = deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)
      t = setTimeout(() => setText(next), deleting ? deleteSpeed : typeSpeed)
    }
    return () => clearTimeout(t)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause])

  return text
}

export function useCountUp(target, start, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, duration])

  return value
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

export function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
