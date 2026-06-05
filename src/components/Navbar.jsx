import { Link, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from 'lucide-react'
import Logo from './Logo'
import useWorkspace from '../hooks/useWorkspace'

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Task', path: '/mytask', icon: ListChecks },
  { label: 'Projects', path: '/projects', icon: FolderOpen },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Partner', path: '/partner', icon: Users },
]

export default function Navbar({ active }) {
  const location = useLocation()
  const { currentUser } = useWorkspace()
  const avatarSeed = encodeURIComponent(currentUser.slug || currentUser.name)

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-slate-200/70 backdrop-blur-xl transition-all duration-300">
        <Logo className="transition-transform duration-300 hover:scale-105" />

        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              active === link.label ||
              location.pathname === link.path ||
              location.pathname.startsWith(`${link.path}/`)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-brand'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold tracking-tight text-gray-900">
              {currentUser.name}
            </p>
            <p className="text-xs font-medium text-brand/70">{currentUser.role}</p>
          </div>
          <Link 
            to="/profile" 
            className="group relative"
          >
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-brand to-purple-500 opacity-0 blur transition duration-300 group-hover:opacity-70"></div>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
              alt="Profil"
              className="relative h-10 w-10 rounded-full border-2 border-white bg-slate-50 object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <Link
            to="/profile"
            aria-label="Pengaturan profil"
            className="rounded-xl border border-slate-200 bg-white p-2 text-gray-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:bg-brand/10 hover:text-brand"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
