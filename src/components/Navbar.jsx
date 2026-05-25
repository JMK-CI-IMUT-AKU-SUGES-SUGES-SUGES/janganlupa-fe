import { Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import Logo from './Logo'

const navLinks = [
  { label: 'Beranda', path: '/beranda' },
  { label: 'Daftar Tugas', path: '/daftar-tugas' },
  { label: 'Kalender', path: '/kalender' },
]

export default function Navbar({ active }) {
  const location = useLocation()

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              active === link.label ||
              location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand'
                    : 'text-brand-light hover:text-brand'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-900">Narendra</p>
            <p className="text-xs text-muted">Mahasiswa</p>
          </div>
          <Link to="/profile">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Narendra"
              alt="Profil"
              className="h-10 w-10 rounded-full border-2 border-brand/20 bg-surface object-cover"
            />
          </Link>
          <Link
            to="/profile"
            className="rounded-lg p-1.5 text-brand transition-colors hover:bg-brand/10"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
