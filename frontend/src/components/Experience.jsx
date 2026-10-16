import { Reveal, SectionHeader } from './ui.jsx'
import './Experience.css'

export default function Experience({ experience }) {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionHeader index="04" kicker="Flight Log" title="Career Path" />

        <ol className="timeline">
          <li className="timeline-packet" aria-hidden="true" />
          {experience.map((item, i) => (
            <Reveal as="li" key={`${item.company}-${item.period}`} className="timeline-item" delay={i * 60}>
              <div className="timeline-when mono">
                <span>{item.period}</span>
                <small>{item.type === 'education' ? 'EDU' : 'OPS'}-{String(experience.length - i).padStart(2, '0')}</small>
              </div>

              <span className={`timeline-node ${item.type === 'education' ? 'is-edu' : ''}`} aria-hidden="true" />

              <div className="timeline-card">
                <h3>{item.role}</h3>
                <p className="timeline-company mono">
                  @ {item.company}
                  {item.location && <span> · {item.location}</span>}
                </p>
                <p className="timeline-desc">{item.description}</p>
                {item.highlights?.length > 0 && (
                  <ul className="timeline-highlights">
                    {item.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                {item.tags?.length > 0 && (
                  <ul className="timeline-tags">
                    {item.tags.map((t) => (
                      <li key={t} className="tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
