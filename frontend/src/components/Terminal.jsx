import { useMemo, useRef, useState, useEffect } from 'react'
import { scrollToSection } from '../hooks.js'
import { SectionHeader, Reveal } from './ui.jsx'
import { categoriesOf, projectType, typeLabel } from '../utils/project.js'
import './Terminal.css'

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'terminal']
const QUICK = ['help', 'whoami', 'skills', 'projects', 'experience']

let lineId = 0
const line = (text, kind = 'out') => ({ id: ++lineId, kind, text })

function buildCommands(data, { openProject }) {
  const { profile, skills, projects, experience } = data
  const findProject = (arg) => {
    if (!arg) return null
    const n = Number(arg)
    if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1]
    return projects.find((p) => p.id === arg.toLowerCase())
  }

  const cmds = {
    help: {
      desc: 'list commands',
      run: () => [
        line('Available commands:', 'accent'),
        ...Object.entries(cmds)
          .filter(([, c]) => !c.hidden)
          .map(([name, c]) => line(`  ${name.padEnd(14)} ${c.desc}`)),
        line('Tip: TAB to autocomplete, ↑/↓ for history.', 'dim'),
      ],
    },
    whoami: {
      desc: 'short identity',
      run: () => [
        line(`${profile.name} — ${profile.roles[0]}`, 'accent'),
        line(`location: ${profile.location}`),
      ],
    },
    about: {
      desc: 'full biography',
      run: () => profile.bio.map((p) => line(p)),
    },
    skills: {
      desc: 'skill matrix',
      run: () =>
        skills.flatMap((g) => [
          line(`[${g.category.toUpperCase()}]`, 'accent'),
          line(`  ${g.items.join('  ·  ')}`),
        ]),
    },
    projects: {
      desc: 'list projects',
      run: () => [
        ...projects.map((p, i) =>
          line(`  [${i + 1}] ${p.title.padEnd(24)} ${[categoriesOf(p).join(' / '), typeLabel(projectType(p)), p.year].filter(Boolean).join(' · ')}`),
        ),
        line("Type 'open <number>' to open a project file.", 'dim'),
      ],
    },
    open: {
      desc: 'open a project: open <number|id>',
      run: ([arg]) => {
        const p = findProject(arg)
        if (!p) return [line(`project not found: ${arg ?? '(empty)'}`, 'err')]
        setTimeout(() => openProject(p), 150)
        return [line(`opening file ${p.id} ...`, 'accent')]
      },
    },
    experience: {
      desc: 'career history',
      run: () => experience.map((e) => line(`  ${e.period.padEnd(18)} ${e.role} @ ${e.company}`)),
    },
    goto: {
      desc: `navigate: goto <${SECTIONS.join('|')}>`,
      run: ([arg]) => {
        if (!SECTIONS.includes(arg)) return [line(`unknown section. options: ${SECTIONS.join(', ')}`, 'err')]
        setTimeout(() => scrollToSection(arg), 200)
        return [line(`jumping to #${arg} ...`, 'accent')]
      },
    },
    date: {
      desc: 'system time',
      run: () => [line(new Date().toLocaleString('en-US', { timeZone: profile.timezone, dateStyle: 'full', timeStyle: 'long' }))],
    },
    echo: {
      desc: 'print text',
      run: (args) => [line(args.join(' '))],
    },
    clear: {
      desc: 'clear screen',
      run: () => [],
    },
    sudo: {
      hidden: true,
      run: () => [line('access denied: this incident will be reported to the administrator. 😏', 'err')],
    },
    ls: {
      hidden: true,
      run: () => [line('about.txt  skills.dat  projects/  experience.log')],
    },
  }
  return cmds
}

export default function Terminal({ data, onOpenProject }) {
  const { profile } = data
  const host = profile.alias.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio'
  const prompt = `guest@${host}:~$`

  const [lines, setLines] = useState(() => [
    line(`NEURAL//OS shell — connected to ${profile.name}`, 'accent'),
    line("Type 'help' to see available commands.", 'dim'),
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  const commands = useMemo(() => buildCommands(data, { openProject: onOpenProject }), [data, onOpenProject])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const run = (raw) => {
    const cmdline = raw.trim()
    const echo = line(cmdline, 'input')
    setInput('')
    setCursor(-1)
    if (!cmdline) {
      setLines((l) => [...l, echo])
      return
    }
    setHistory((h) => [cmdline, ...h.filter((x) => x !== cmdline)].slice(0, 50))
    const [name, ...args] = cmdline.split(/\s+/)
    const cmd = commands[name.toLowerCase()]
    if (name.toLowerCase() === 'clear') {
      setLines([])
      return
    }
    const out = cmd ? cmd.run(args) : [line(`command not found: ${name} — type 'help'`, 'err')]
    setLines((l) => [...l, echo, ...out].slice(-200))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(cursor + 1, history.length - 1)
      if (next >= 0) {
        setCursor(next)
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = cursor - 1
      setCursor(Math.max(next, -1))
      setInput(next >= 0 ? history[next] : '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const term = input.trim().toLowerCase()
      if (!term || term.includes(' ')) return
      const matches = Object.keys(commands).filter((c) => c.startsWith(term) && !commands[c].hidden)
      if (matches.length === 1) setInput(matches[0] + ' ')
      else if (matches.length > 1) setLines((l) => [...l, line(input, 'input'), line(matches.join('   '), 'dim')])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <section id="terminal" className="section terminal-section">
      <div className="container">
        <SectionHeader index="05" kicker="Direct Interface" title="Terminal">
          Prefer the keyboard? Explore this profile from the command line. Try typing <code>help</code>.
        </SectionHeader>

        <Reveal className="term hud-frame">
          <div className="term-bar mono">
            <span className="term-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{prompt.replace(':~$', '')}</span>
          </div>

          <div
            className="term-body mono"
            ref={bodyRef}
            onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus({ preventScroll: true })}
            role="log"
            aria-live="polite"
          >
            {lines.map((l) =>
              l.kind === 'input' ? (
                <div key={l.id} className="term-line is-input">
                  <span className="term-prompt">{prompt}</span> {l.text}
                </div>
              ) : (
                <div key={l.id} className={`term-line is-${l.kind}`}>
                  {l.text}
                </div>
              ),
            )}

            <div className="term-input-row">
              <label htmlFor="term-input" className="term-prompt">
                {prompt}
              </label>
              <input
                id="term-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-label="Enter a terminal command"
              />
            </div>
          </div>

          <div className="term-quick">
            {QUICK.map((q) => (
              <button key={q} type="button" className="mono" onClick={() => run(q)}>
                {q}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
