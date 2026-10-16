import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/random.js'
import './Background.css'

const LINK_DIST = 130
const MOUSE_DIST = 190

/** Neural-network particle field that reacts to the pointer. */
export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduce = prefersReducedMotion()
    const mouse = { x: -9999, y: -9999 }
    let w = 0
    let h = 0
    let particles = []
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const widthChanged = window.innerWidth !== w
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Mobile browsers fire height-only resizes as the URL bar slides; keep the field stable.
      if (!widthChanged && particles.length) {
        if (reduce) draw()
        return
      }
      const count = Math.round(Math.min(110, (w * h) / 13000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.5,
      }))
      if (reduce) draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -20) p.x = w + 20
          if (p.x > w + 20) p.x = -20
          if (p.y < -20) p.y = h + 20
          if (p.y > h + 20) p.y = -20
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.hypot(dx, dy)
          if (d < 90 && d > 0) {
            p.x += (dx / d) * 0.9
            p.y += (dy / d) * 0.9
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(31, 139, 255, ${(1 - d / LINK_DIST) * 0.28})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y)
        if (dm < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(45, 226, 255, ${(1 - dm / MOUSE_DIST) * 0.55})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
        ctx.fillStyle = dm < MOUSE_DIST ? '#2de2ff' : 'rgba(140, 190, 255, 0.75)'
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) loop()
    }

    resize()
    if (!reduce) loop()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-grid" />
      <canvas ref={canvasRef} className="bg-canvas" />
    </div>
  )
}
