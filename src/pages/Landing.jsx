import { Link } from 'react-router-dom'
import { BookOpen, Briefcase, User } from 'lucide-react'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import WaveBackground from '../components/WaveBackground'

const features = [
  {
    icon: User,
    color: 'bg-purple-100 text-purple-600',
    title: 'Pribadi',
    desc: 'Buat jadwal mu sendiri',
  },
  {
    icon: BookOpen,
    color: 'bg-red-100 text-red-600',
    title: 'Pendidikan',
    desc: 'Kelola tugas kuliah',
  },
  {
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
    title: 'Pekerjaan',
    desc: 'Atur deadline kerja',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <WaveBackground>
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg border-2 border-brand px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center mt-30">
          <h1 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">
            Satu Centang, Selangkah Lebih Dekat!
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg italic text-gray-700">
            &ldquo;Solusi paling simpel untuk mengatur jadwal, pasang prioritas,
            dan selesaikan pekerjaan tepat waktu.&rdquo;
          </p>
        </section>
      </WaveBackground>

      <section className="bg-brand px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          Kami Siap Membantu Kamu, Untuk
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-8 text-center shadow-lg"
            >
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color}`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/register"
            className="inline-block rounded-full border-2 border-white bg-white px-8 py-3 text-sm font-bold text-brand transition-opacity hover:opacity-90"
          >
            Coba Sekarang!
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
