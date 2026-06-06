import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'
import { useAuth } from '../context/AuthContext'
import { loginSchema, formatZodErrors } from '../lib/validation'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Login gagal, periksa email dan password Anda.')
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
                Secure Access
              </span>
            </div>
            <h1 className="mt-7 text-3xl font-black tracking-tight md:text-4xl">
              Login
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Masuk untuk lanjut ke dashboard dan pantau tugas yang sedang berjalan.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="emailkamu@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-navy"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="block w-full rounded-xl bg-brand-navy py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-navy hover:text-brand">
                Register for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </WaveBackground>
  )
}
