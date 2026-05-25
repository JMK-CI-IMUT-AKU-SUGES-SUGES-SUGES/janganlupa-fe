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
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-gray-800/20 bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Register</h1>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <input
                type="text"
                placeholder="Nama Kamu"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              <label className="mb-1 block text-sm font-medium">
                Reply Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Tulis ulang Password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              to="/beranda"
              className="block w-full rounded-lg bg-brand-dark py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </WaveBackground>
  )
}
