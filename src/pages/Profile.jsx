import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'

const profileInfo = [
  { label: 'Nama Lengkap', value: 'ARDHIVA DWI PUTRA NARENDRA' },
  { label: 'NIM', value: '253140707111147' },
  { label: 'Prodi', value: 'Teknologi Informasi' },
  { label: 'Fakultas', value: 'Fakultas Ilmu Komputer' },
  { label: 'Universitas', value: 'Universitas Brawijaya' },
]

const friends = [
  { name: 'Samuel', seed: 'Samuel', bg: 'bg-red-400' },
  { name: 'Lefi', seed: 'Lefi', bg: 'bg-slate-300' },
  { name: 'Abby', seed: 'Abby', bg: 'bg-red-400' },
]

export default function Profile() {
  return (
    <WaveBackground>
      <header className="mx-auto max-w-6xl px-6 py-5">
        <Logo />
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12">
        <h1 className="mb-8 text-3xl font-bold text-brand">Profile</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Narendra"
              alt="Narendra"
              className="mx-auto h-32 w-32 rounded-full border-4 border-brand/10 object-cover"
            />
            <h2 className="mt-4 text-xl font-bold tracking-wide text-gray-900">
              NARENDRA
            </h2>
            <p className="mt-1 text-sm text-muted">ardhivaputran@gmail.com</p>
            <span className="mt-3 inline-block rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-800">
              Aktif
            </span>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Ganti Password
              </button>
              <Link
                to="/login"
                className="rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Logout
              </Link>
            </div>

            <Link
              to="/login"
              className="mt-4 block w-full rounded-lg bg-brand-light py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Logout
            </Link>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="divide-y divide-gray-100">
                {profileInfo.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:justify-between"
                  >
                    <span className="text-sm text-muted">{row.label}</span>
                    <span className="text-sm font-bold text-gray-900 sm:text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-6 font-bold text-gray-900">
                Teman Projek Terbaik
              </h3>
              <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
                {friends.map((friend) => (
                  <div key={friend.name} className="text-center">
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ${friend.bg}`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.seed}`}
                        alt={friend.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium">{friend.name}</p>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-center text-muted transition-colors hover:text-brand"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <UserPlus className="h-7 w-7 text-gray-600" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Tambah Partner</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </WaveBackground>
  )
}
