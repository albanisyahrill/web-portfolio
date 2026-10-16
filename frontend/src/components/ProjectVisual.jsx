import { useId, useMemo } from 'react'
import { seeded } from '../utils/random.js'

const W = 400
const H = 250

function circuit(rand) {
  const paths = []
  const nodes = []
  for (let i = 0; i < 14; i++) {
    let x = Math.round((rand() * W) / 20) * 20
    let y = Math.round((rand() * H) / 20) * 20
    let d = `M${x} ${y}`
    for (let s = 0; s < 4; s++) {
      if (rand() > 0.5) x += (rand() > 0.5 ? 1 : -1) * 20 * (1 + Math.floor(rand() * 4))
      else y += (rand() > 0.5 ? 1 : -1) * 20 * (1 + Math.floor(rand() * 3))
      d += ` L${x} ${y}`
    }
    paths.push(d)
    nodes.push([x, y])
  }
  return { paths, nodes, rings: [] }
}

function orbits(rand) {
  const cx = W * (0.35 + rand() * 0.3)
  const cy = H * (0.35 + rand() * 0.3)
  const rings = Array.from({ length: 6 }, (_, i) => ({
    cx,
    cy,
    r: 22 + i * 24 + rand() * 8,
    dash: `${8 + rand() * 60} ${6 + rand() * 30}`,
  }))
  const nodes = rings.map((r) => {
    const a = rand() * Math.PI * 2
    return [cx + Math.cos(a) * r.r, cy + Math.sin(a) * r.r]
  })
  return { paths: [], nodes, rings }
}

function waves(rand) {
  const paths = []
  for (let l = 0; l < 9; l++) {
    const amp = 8 + rand() * 26
    const freq = 0.01 + rand() * 0.025
    const phase = rand() * Math.PI * 2
    const base = 30 + l * 24
    let d = ''
    for (let x = 0; x <= W; x += 8) {
      const y = base + Math.sin(x * freq + phase) * amp
      d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `
    }
    paths.push(d)
  }
  const nodes = Array.from({ length: 5 }, () => [rand() * W, rand() * H])
  return { paths, nodes, rings: [] }
}

const GENERATORS = [circuit, orbits, waves]

/** Deterministic generative artwork per project, used when no image is given. */
export default function ProjectVisual({ project, className = '' }) {
  const art = useMemo(() => {
    const rand = seeded(project.id)
    const gen = GENERATORS[Math.floor(rand() * GENERATORS.length)]
    return gen(rand)
  }, [project.id])

  const color = project.color || '#1f8bff'
  const gid = `pv${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  if (project.image) {
    // Images are often architecture diagrams: show them whole (contain) over a blurred fill.
    return (
      <div className={`pv pv-has-img ${className}`} style={{ '--pv-color': color }}>
        <img className="pv-fill" src={project.image} alt="" aria-hidden="true" loading="lazy" />
        <img className="pv-img" src={project.image} alt={project.title} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`pv ${className}`} style={{ '--pv-color': color }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`${gid}-bg`} cx="70%" cy="20%" r="90%">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="60%" stopColor="#020814" stopOpacity="1" />
          </radialGradient>
          <pattern id={`${gid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${gid}-bg)`} />
        <rect width={W} height={H} fill={`url(#${gid}-grid)`} />
        <g fill="none" stroke={color} strokeWidth="1.2" className="pv-lines">
          {art.paths.map((d, i) => (
            <path key={i} d={d} strokeOpacity={0.35 + (i % 3) * 0.2} />
          ))}
          {art.rings.map((r, i) => (
            <circle key={i} cx={r.cx} cy={r.cy} r={r.r} strokeDasharray={r.dash} strokeOpacity={0.3 + i * 0.1} />
          ))}
        </g>
        <g fill={color}>
          {art.nodes.map(([x, y], i) => (
            <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" className="pv-node" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </g>
        <text x="16" y={H - 16} className="pv-code">
          {project.id.toUpperCase()}
        </text>
      </svg>
      <span className="pv-scan" />
    </div>
  )
}
