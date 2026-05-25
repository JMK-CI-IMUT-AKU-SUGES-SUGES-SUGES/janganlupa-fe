import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'

function SocialButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50"
    >
      {children}
    </button>
  )
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <WaveBackground className="flex items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-gray-800/20 bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Login</h1>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="emailkamu@gmail.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-11 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <Link
              to="/beranda"
              className="block w-full rounded-lg bg-brand-dark py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Log in
            </Link>
          </form>

          <p className="my-5 text-center text-xs text-muted">or continue with</p>
          <div className="flex justify-center gap-3">
            <SocialButton label="Google">
              <span className="text-lg font-bold">
                <span className="text-[#4285F4]">G</span>
              </span>
            </SocialButton>
            <SocialButton label="GitHub">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </SocialButton>
            <SocialButton label="Facebook">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-xs font-bold text-white">
                f
              </span>
            </SocialButton>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-gray-900 hover:underline">
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </WaveBackground>
  )
}
