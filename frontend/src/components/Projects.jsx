import { useMemo, useRef, useState } from 'react'
import ProjectVisual from './ProjectVisual.jsx'
import { Reveal, SectionHeader } from './ui.jsx'
import { categoriesOf, projectType, typeLabel } from '../utils/project.js'
import './Projects.css'

const ALL = 'All'
const TYPE_FILTERS = ['all', 'professional', 'personal']

function ProjectCard({ project, index, onOpen }) {
  const ref = useRef(null)
  const type = projectType(project)

  const onMove = (e) => {
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - py) * 8}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 10}deg`)
  }
  const onLeave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <article
      ref={ref}
      className={`project-card ${project.featured ? 'is-featured' : ''}`}
      style={{ '--pc': project.color }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <button className="project-hit" onClick={() => onOpen(project)} aria-label={`Open details for ${project.title}`} />
      <ProjectVisual project={project} className="project-visual" />
      <div className="project-body">
        <div className="project-meta mono">
          <span>PRJ-{String(index + 1).padStart(3, '0')}</span>
          <span>{categoriesOf(project).join(' / ')}</span>
          {project.year > 0 && <span>{project.year}</span>}
          {type && <span className={`project-type is-${type}`}>{typeLabel(type)}</span>}
        </div>
        <h3 className="project-title">
          {project.title}
          {project.featured && <span className="project-badge mono">Featured</span>}
        </h3>
        <p className="project-summary">{project.summary}</p>
        <ul className="project-tech">
          {project.tech.slice(0, 4).map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
          {project.tech.length > 4 && <li className="tag">+{project.tech.length - 4}</li>}
        </ul>
        <span className="project-cta mono" aria-hidden="true">
          Access File <i>→</i>
        </span>
      </div>
    </article>
  )
}

export default function Projects({ projects, onOpen }) {
  const [filter, setFilter] = useState(ALL)
  const [kind, setKind] = useState('all')
  const categories = useMemo(() => [ALL, ...new Set(projects.flatMap(categoriesOf))], [projects])
  const hasTypes = projects.some((p) => projectType(p))
  const byType = kind === 'all' ? projects : projects.filter((p) => projectType(p) === kind)
  const visible = filter === ALL ? byType : byType.filter((p) => categoriesOf(p).includes(filter))

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionHeader index="03" kicker="Mission Archive" title="Portfolio">
          Selected projects — from large-scale platforms to creative experiments. Open any card to view the full file.
        </SectionHeader>

        {hasTypes && (
          <Reveal className="project-types mono" role="group" aria-label="Filter by project type">
            {TYPE_FILTERS.map((t) => {
              const count = t === 'all' ? projects.length : projects.filter((p) => projectType(p) === t).length
              return (
                <button
                  key={t}
                  className={`${kind === t ? 'is-active' : ''} is-${t}`}
                  aria-pressed={kind === t}
                  onClick={() => setKind(t)}
                >
                  <i aria-hidden="true" />
                  {t === 'all' ? 'All Types' : typeLabel(t)}
                  <span>{String(count).padStart(2, '0')}</span>
                </button>
              )
            })}
          </Reveal>
        )}

        <Reveal className="project-filters" role="group" aria-label="Filter by category">
          {categories.map((c) => {
            const count = c === ALL ? byType.length : byType.filter((p) => categoriesOf(p).includes(c)).length
            if (count === 0 && c !== filter) return null
            return (
              <button key={c} className={filter === c ? 'is-active' : ''} aria-pressed={filter === c} onClick={() => setFilter(c)}>
                {c}
                <span className="mono">{String(count).padStart(2, '0')}</span>
              </button>
            )
          })}
        </Reveal>

        <div className="project-grid">
          {visible.map((p, i) => (
            <Reveal key={`${kind}-${filter}-${p.id}`} delay={i * 80} className="project-cell">
              <ProjectCard project={p} index={projects.indexOf(p)} onOpen={onOpen} />
            </Reveal>
          ))}
        </div>

        {visible.length === 0 && <p className="project-empty mono">No projects match this filter.</p>}
      </div>
    </section>
  )
}
