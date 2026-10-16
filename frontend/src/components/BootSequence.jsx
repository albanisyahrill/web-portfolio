import { useEffect, useRef, useState } from 'react'
import './BootSequence.css'

const LINES = [
  { text: 'NEURAL//OS v2.6 — kernel init' },
  { text: 'loading graphics modules', status: 'OK' },
  { text: 'calibrating hologram projector', status: 'OK' },
  { text: 'syncing profile data', status: 'OK', waitForData: true },
  { text: 'encrypting comm channels', status: 'OK' },
  { text: '>> ACCESS GRANTED', final: true },
]

/**
 * Terminal-style intro. Holds on the data line until the portfolio has loaded,
 * then fades out. `fast` shortens it for repeat visits in the same session.
 */
export default function BootSequence({ dataReady, fast, onDone }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const step = fast ? 70 : 280
  const finished = count >= LINES.length

  useEffect(() => {
    if (finished) return
    const blocked = LINES[count - 1]?.waitForData && !dataReady
    if (blocked) return
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 150 : step)
    return () => clearTimeout(t)
  }, [count, dataReady, step, finished])

  useEffect(() => {
    if (!finished) return
    const t1 = setTimeout(() => setLeaving(true), fast ? 150 : 550)
    const t2 = setTimeout(() => doneRef.current(), fast ? 600 : 1150)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [finished, fast])

  useEffect(() => {
    const skip = () => {
      if (dataReady) setCount(LINES.length)
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [dataReady])

  const progress = Math.round((count / LINES.length) * 100)

  return (
    <div className={`boot ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="boot-panel">
        <div className="boot-emblem" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <ul className="boot-lines mono">
          {LINES.slice(0, count).map((line, i) => {
            const waiting = line.waitForData && !dataReady
            return (
              <li key={line.text} className={line.final ? 'is-final' : ''}>
                {!line.final && <span className="boot-ts">[{(i * 0.137 + 0.004).toFixed(3)}]</span>}
                <span className="boot-text">{line.text}</span>
                {line.status && (
                  <span className={`boot-status ${waiting ? 'is-wait' : ''}`}>{waiting ? '....' : line.status}</span>
                )}
              </li>
            )
          })}
          {!finished && <li className="boot-caret" aria-hidden="true" />}
        </ul>
        <div className="boot-bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-meta mono">
          <span>{String(progress).padStart(3, '0')}%</span>
          <span>click / press any key to skip</span>
        </div>
      </div>
    </div>
  )
}
