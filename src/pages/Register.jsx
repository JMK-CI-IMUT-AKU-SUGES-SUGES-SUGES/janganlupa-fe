import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <WaveBackground className="flex items-center justify-center py-12">
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
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Nama Kamu"
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

              <Link
                to="/dashboard"
                className="block w-full rounded-xl bg-brand-navy py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
              >
                Register
              </Link>
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
