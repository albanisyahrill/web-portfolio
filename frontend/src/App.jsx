import { useCallback, useEffect, useState } from 'react'
import { fetchPortfolio } from './api.js'
import Background from './components/Background.jsx'
import BootSequence from './components/BootSequence.jsx'
import SideNav from './components/SideNav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import ProjectModal from './components/ProjectModal.jsx'
import Experience from './components/Experience.jsx'
import Terminal from './components/Terminal.jsx'
import { Cursor } from './components/ui.jsx'

const SECTIONS = [
  { id: 'about', label: 'About', hint: 'Personnel file' },
  { id: 'skills', label: 'Skills', hint: 'Capability matrix' },
  { id: 'projects', label: 'Portfolio', hint: 'Mission archive' },
  { id: 'experience', label: 'Journey', hint: 'Flight log' },
  { id: 'terminal', label: 'Terminal', hint: 'Shell access' },
]

const BOOT_KEY = 'neuralos:booted'

function seenBoot() {
  try {
    return sessionStorage.getItem(BOOT_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [portfolio, setPortfolio] = useState(null)
  const [booted, setBooted] = useState(false)
  const [fastBoot] = useState(seenBoot)
  const [activeProject, setActiveProject] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPortfolio().then((data) => {
      if (!alive) return
      setPortfolio(data)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (portfolio?.profile) document.title = `${portfolio.profile.alias} — ${portfolio.profile.name}`
  }, [portfolio])

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* storage unavailable — boot just replays next time */
    }
    setBooted(true)
  }, [])

  const closeProject = useCallback(() => setActiveProject(null), [])
  const ready = booted && portfolio

  return (
    <>
      <Background />
      <Cursor />

      {!booted && <BootSequence dataReady={!!portfolio} fast={fastBoot} onDone={finishBoot} />}

      {ready && (
        <>
          <SideNav profile={portfolio.profile} sections={SECTIONS} />
          <div className="shell">
            <main>
              <Hero profile={portfolio.profile} />
              <About profile={portfolio.profile} />
              <Skills skills={portfolio.skills} />
              <Projects projects={portfolio.projects} onOpen={setActiveProject} />
              <Experience experience={portfolio.experience} />
              <Terminal data={portfolio} onOpenProject={setActiveProject} />
            </main>
          </div>
          <ProjectModal project={activeProject} onClose={closeProject} />
        </>
      )}
    </>
  )
}
