import { useEffect, useRef, useState } from 'react'
import ProjectVisual from './ProjectVisual.jsx'
import { categoriesOf, projectLinks, projectNotice, projectType, typeLabel } from '../utils/project.js'
import './ProjectModal.css'

/** Full-screen image viewer: fits the screen, tap/click toggles actual size for reading small diagram text. */
function Lightbox({ src, alt, onClose }) {
  const [actual, setActual] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className={`lightbox ${actual ? 'is-actual' : ''}`} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <div className="lightbox-bar mono" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setActual((a) => !a)}>
          {actual ? 'Fit to screen' : 'Actual size'}
        </button>
        <a href={src} target="_blank" rel="noreferrer">
          Open ↗
        </a>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close image">
          ESC ✕
        </button>
      </div>
      <div className="lightbox-stage" onClick={onClose}>
        <img
          src={src}
          alt={alt}
          onClick={(e) => {
            e.stopPropagation()
            setActual((a) => !a)
          }}
        />
      </div>
    </div>
  )
}

export default function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)
  const [zoomed, setZoomed] = useState(false)
  const zoomedRef = useRef(false)
  zoomedRef.current = zoomed

  useEffect(() => setZoomed(false), [project])

  useEffect(() => {
    if (!project) return
    const prevFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (zoomedRef.current) setZoomed(false)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [project, onClose])

  if (!project) return null
  const type = projectType(project)
  const links = projectLinks(project)
  const notice = projectNotice(project, type, links)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className="modal-panel hud-frame" style={{ '--pc': project.color }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-bar mono">
          <span>
            <span className="status-dot" /> FILE // {project.id.toUpperCase()}
          </span>
          <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close">
            ESC ✕
          </button>
        </div>

        {project.image ? (
          <button type="button" className="modal-visual-btn" onClick={() => setZoomed(true)} aria-label={`Enlarge image: ${project.title}`}>
            <ProjectVisual project={project} className="modal-visual" />
            <span className="modal-zoom mono" aria-hidden="true">
              ⤢ Expand
            </span>
          </button>
        ) : (
          <ProjectVisual project={project} className="modal-visual" />
        )}

        <div className="modal-content">
          <div className="modal-kicker mono">
            {type && <span className={`project-type is-${type}`}>{typeLabel(type)}</span>}
            <span>{[categoriesOf(project).join(' / '), project.year, project.role].filter(Boolean).join(' · ')}</span>
          </div>
          <h3 id="modal-title" className="modal-title">
            {project.title}
          </h3>

          {project.metrics?.length > 0 && (
            <dl className="modal-metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dd>{m.value}</dd>
                  <dt className="mono">{m.label}</dt>
                </div>
              ))}
            </dl>
          )}

          <p className="modal-desc">{project.description}</p>

          <div className="modal-tech">
            <span className="mono">Tech Stack</span>
            <ul>
              {project.tech.map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {(links.demo || links.repo) && (
            <div className="modal-actions">
              {links.demo && (
                <a className="btn btn-primary" href={links.demo} target="_blank" rel="noreferrer">
                  Live Demo ↗
                </a>
              )}
              {links.repo && (
                <a className={`btn ${links.demo ? 'btn-ghost' : 'btn-primary'}`} href={links.repo} target="_blank" rel="noreferrer">
                  Source Code
                </a>
              )}
            </div>
          )}

          {notice && (
            <aside className="modal-notice" role="note">
              <span className="modal-notice-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                  <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <div>
                <p className="modal-notice-title mono">{type === 'professional' ? 'Confidential Project' : 'Source Unavailable'}</p>
                <p className="modal-notice-text">{notice}</p>
              </div>
            </aside>
          )}
        </div>
      </div>
      {zoomed && (
        <div onClick={(e) => e.stopPropagation()}>
          <Lightbox src={project.image} alt={project.title} onClose={() => setZoomed(false)} />
        </div>
      )}
    </div>
  )
}
