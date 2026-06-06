import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'
import { useAuth } from '../context/AuthContext'
import { registerSchema, formatZodErrors } from '../lib/validation'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    const result = registerSchema.safeParse({ name, email, password, confirmPassword })
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    setLoading(true)

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000)

    try {
      await register(name, slug, email, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = Object.values(err.response.data).flat().join(', ')
        setError(errors || 'Registrasi gagal.')
      } else {
        setError('Registrasi gagal. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <WaveBackground className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto w-full max-w-lg px-4">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-2xl shadow-brand-navy/10 backdrop-blur-xl">
          <div className="bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] px-8 py-7 text-white">
            <div className="flex items-center justify-between gap-4">
              <Logo variant="light" />
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-50">
                Join Team
              </span>
            </div>
            <h1 className="mt-7 text-3xl font-black tracking-tight md:text-4xl">
              Register
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Buat akun untuk mulai mengatur tugas, deadline, dan progres harian.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Nama Kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                  <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-navy"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Tulis ulang Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-navy"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="block w-full rounded-xl bg-brand-navy py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold text-brand-navy hover:text-brand">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </WaveBackground>
  )
}
