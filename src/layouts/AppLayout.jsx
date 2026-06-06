import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { preloadRoutesWhenIdle } from '../lib/routePreload'

const idlePreloadTargets = {
  Dashboard: ['/mytask', '/projects'],
  'My Task': ['/dashboard', '/calendar'],
  Projects: ['/dashboard', '/mytask'],
  Calendar: ['/mytask', '/dashboard'],
  Partner: ['/dashboard', '/mytask'],
  Profile: ['/dashboard', '/mytask'],
}

export default function AppLayout({ children, active }) {
  useEffect(() => {
    const nextPaths = idlePreloadTargets[active] || ['/dashboard', '/mytask']
    return preloadRoutesWhenIdle(nextPaths)
  }, [active])

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,102,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,102,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]"></div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.92)_42%,rgba(255,255,255,1)_100%)]"></div>
      <div className="relative z-10">
        <Navbar active={active} />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
