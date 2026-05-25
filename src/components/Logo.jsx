import { Link } from 'react-router-dom'
import logo from '../assets/Logo.svg'

export default function Logo({ className = '', variant = 'default', to = '/' }) {
  const isLight = variant === 'light'

  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isLight ? 'bg-white text-brand' : 'bg-brand text-white'
        }`}
      >
        <img src={logo} alt="JanganLupa logo" className="h-5 w-5" />
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${
          isLight ? 'text-white' : 'text-brand'
        }`}
      >
        JanganLupa.id
      </span>
    </Link>
  )
}
