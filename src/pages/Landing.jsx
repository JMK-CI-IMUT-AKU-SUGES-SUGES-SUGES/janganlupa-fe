import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Briefcase,
  User,
  Flame,
  ChevronDown,
  ChevronUp,
  Quote,
  CheckCircle2,
  Clock3,
  Sparkles,
  LogIn,
} from 'lucide-react'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import heroArt from '../assets/hero.png'

const landingNavLinks = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Panduan', href: '#panduan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
]

const landingSectionIds = landingNavLinks.map((link) => link.href.slice(1))

const features = [
  {
    id: 'pribadi',
    icon: User,
    color: 'bg-purple-100 text-purple-600',
    title: 'Pribadi',
    desc: 'Buat jadwal mu sendiri',
  },
  {
    id: 'belajar',
    icon: BookOpen,
    color: 'bg-red-100 text-red-600',
    title: 'Belajar',
    desc: 'Atur target belajar',
  },
  {
    id: 'pekerjaan',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
    title: 'Pekerjaan',
    desc: 'Atur deadline kerja',
  },
]

const testimonials = [
  {
    name: 'Samuel Christian',
    role: 'Freelancer',
    text: 'Sangat terbantu untuk memantau deadline klien dan pekerjaan harian yang sering datang bersamaan. Tampilannya bersih dan mudah dipakai!',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samuel'
  },
  {
    name: 'Lefi Herdiansyah',
    role: 'Tim Operasional',
    text: 'Dulu sering lupa follow-up kecil yang ternyata penting. Dengan kalender JanganLupa, saya bisa menata jadwal dan prioritas lebih rapi.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lefi'
  },
  {
    name: 'Abby Abigail',
    role: 'Content Creator',
    text: 'Checklist kepuasan psikologisnya nyata! Setiap kali mengubah tugas menjadi Selesai, rasanya beban pikiran langsung berkurang drastis.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Abby'
  }
]

const faqs = [
  {
    q: 'Apakah JanganLupa.id berbayar?',
    a: 'Tidak sama sekali. Semua fitur pencatatan tugas, kalender visual, dan pemantauan progress dapat digunakan gratis untuk kebutuhan personal maupun kerja.'
  },
  {
    q: 'Bagaimana cara menambahkan kategori dan tugas baru?',
    a: 'Cukup masuk ke Dashboard atau Daftar Tugas, klik tombol "Tambah Tugas", isi detail tugas beserta kategori dan due-date, lalu klik Simpan.'
  },
  {
    q: 'Apakah saya bisa memakai ini untuk kerja tim?',
    a: 'Saat ini JanganLupa dirancang sebagai asisten personal untuk membantu kamu menjaga fokus dan ritme kerja secara mandiri.'
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Tentu saja. Data tugas Anda tersimpan aman secara privat di akun Anda sendiri dan tidak akan dibagikan ke pihak ketiga.'
  }
]

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null)
  const [activeSection, setActiveSection] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const updateActiveSection = () => {
      const marker = window.scrollY + window.innerHeight * 0.35
      let currentSection = ''

      setShowBackToTop(window.scrollY > 420)

      landingSectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId)
        if (!section) return

        const top = section.offsetTop
        const bottom = top + section.offsetHeight

        if (marker >= top && marker < bottom) {
          currentSection = sectionId
        } else if (marker >= top) {
          currentSection = sectionId
        }
      })

      setActiveSection(currentSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const handleNavClick = (event, href) => {
    event.preventDefault()

    const section = document.querySelector(href)
    if (!section) return

    setActiveSection(href.slice(1))
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', href)
  }

  const scrollToTop = () => {
    setActiveSection('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.history.pushState(null, '', window.location.pathname)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 bg-brand-navy/95 shadow-lg shadow-brand-navy/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Logo variant="light" className="transition-transform duration-300 hover:scale-105" />
          <nav className="hidden items-center rounded-full border border-white/10 bg-white/10 p-1 md:flex">
            {landingNavLinks.map((link) => {
              const sectionId = link.href.slice(1)
              const isActive = activeSection === sectionId

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-brand-navy shadow-md shadow-black/15'
                      : 'text-white/75 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-navy shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Mulai
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#001529_0%,#0052cc_55%,#14b8a6_100%)] px-6 py-12 text-white md:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,21,41,0.35))]"></div>
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-50 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Anti panik deadline
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] text-white md:text-6xl">
              Taklukkan Deadline, Satu Centang Sekali Jalan.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Susun tugas harian, prioritas, dan progress dalam satu tempat yang cepat dibuka saat jadwal mulai padat.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-brand-navy shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Mulai Produktif
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#panduan"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                Lihat Alurnya
              </a>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-black">95%</p>
                <p className="mt-1 text-xs text-white/70">Tepat waktu</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-black">3x</p>
                <p className="mt-1 text-xs text-white/70">Lebih fokus</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-black">5m</p>
                <p className="mt-1 text-xs text-white/70">Setup awal</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroArt}
              alt=""
              className="pointer-events-none absolute -right-4 -top-10 hidden w-36 opacity-80 drop-shadow-2xl md:block"
            />
            <div className="relative rounded-[28px] border border-white/15 bg-white/15 p-4 shadow-2xl shadow-black/25 backdrop-blur-md">
              <div className="rounded-2xl bg-white p-5 text-brand-navy shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand">Hari ini</p>
                    <h2 className="mt-1 text-xl font-black">Sprint Tugas Hari Ini</h2>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    3 selesai
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-slate-900">Review Brief Proyek</p>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Done</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Catatan kebutuhan dan prioritas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-slate-900">Laporan Mingguan</p>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-brand">85%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full w-[85%] rounded-full bg-brand"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                    <Flame className="mt-0.5 h-5 w-5 shrink-0 fill-orange-500 text-orange-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">Deadline Proposal</p>
                      <p className="mt-1 text-sm text-slate-500">Besok, 23.59 WIB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 bg-[#eef7ff] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand shadow-sm">
              Fitur utama
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-brand-navy md:text-4xl">
              Ruang kerja tugas yang tetap rapi saat hari mulai padat.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              JanganLupa menjaga semua deadline, prioritas, dan progres tetap terlihat tanpa membuat kamu membuka banyak catatan terpisah.
            </p>
            <a
              href="#panduan"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand"
            >
              Lihat cara pakainya
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ id, icon: Icon, color, title, desc }) => (
              <div
                id={id}
                key={title}
                className="group border border-white bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/10"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-950 transition-colors duration-300 group-hover:text-brand">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand">
                Statistik produktivitas
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight text-brand-navy md:text-4xl">
                Progress mingguan yang gampang dibaca, bukan cuma angka kosong.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Pecah tugas besar jadi bagian kecil, pantau statusnya, lalu lihat mana yang harus dikejar lebih dulu sebelum deadline menumpuk.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="border-l-4 border-brand bg-[#f8fafc] p-5">
                  <h4 className="text-3xl font-black text-brand-navy">95%</h4>
                  <p className="mt-1 text-sm font-medium text-slate-500">Tugas selesai tepat waktu</p>
                </div>
                <div className="border-l-4 border-emerald-500 bg-[#f8fafc] p-5">
                  <h4 className="text-3xl font-black text-brand-navy">4.8/5</h4>
                  <p className="mt-1 text-sm font-medium text-slate-500">Rating kepuasan pengguna</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 bg-[#f8fafc] p-6 shadow-xl shadow-slate-200/70">
              <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand">Pratinjau</p>
                  <h3 className="mt-1 text-xl font-black text-brand-navy">Progress Mingguan Kamu</h3>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                  <Flame className="h-4 w-4 fill-orange-500" />
                  5 hari beruntun
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between gap-3 text-xs font-bold">
                    <span className="text-slate-700">Proposal Klien</span>
                    <span className="text-brand">85%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between gap-3 text-xs font-bold">
                    <span className="text-slate-700">Laporan Mingguan</span>
                    <span className="text-emerald-600">50%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between gap-3 text-xs font-bold">
                    <span className="text-slate-700">Rencana Konten</span>
                    <span className="text-amber-600">20%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-slate-500">Prioritas hari ini sudah terkunci.</span>
                <span className="font-black text-brand">3 tugas selesai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="panduan" className="scroll-mt-24 bg-[#f8fafc] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand shadow-sm">
              Alur singkat
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-navy md:text-4xl">
              Cara kerja yang cukup simpel untuk dipakai setiap hari.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Tiga langkah inti yang bikin daftar tugas tidak cuma tercatat, tapi benar-benar bergerak sampai selesai.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <div className="group border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-lg font-black text-white transition-transform duration-300 group-hover:scale-105">1</div>
              <h3 className="text-lg font-black text-slate-950">Catat Tugas</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Tulis detail tugas beserta kategori, prioritas, dan tenggat waktu penyelesaian.
              </p>
            </div>

            <div className="group border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-black text-white transition-transform duration-300 group-hover:scale-105">2</div>
              <h3 className="text-lg font-black text-slate-950">Pantau Progress</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Perbarui status dari &ldquo;Belum Selesai&rdquo;, &ldquo;Berjalan&rdquo;, hingga &ldquo;Selesai&rdquo; secara real-time.
              </p>
            </div>

            <div className="group border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-white transition-transform duration-300 group-hover:scale-105">3</div>
              <h3 className="text-lg font-black text-slate-950">Dapatkan Checklist</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Nikmati kepuasan psikologis saat mencentang tugas yang sudah selesai dan kurangi beban pikiran.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimoni" className="scroll-mt-24 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand">
                Testimoni
              </span>
              <h2 className="mt-5 text-3xl font-black text-brand-navy md:text-4xl">Apa kata pengguna?</h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-slate-600">
              Cerita singkat dari pengguna yang mulai menata tugas dan deadline dengan ritme yang lebih tenang.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="group flex min-h-[260px] flex-col justify-between border border-slate-100 bg-[#f8fafc] p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-200/80">
                <div>
                  <Quote className="mb-5 h-8 w-8 text-brand/25 transition-colors duration-300 group-hover:text-brand/50" />
                  <p className="text-sm italic leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                </div>
                <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-5">
                  <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full border border-slate-200 bg-blue-50 transition-transform duration-300 group-hover:scale-105" />
                  <div>
                    <h4 className="text-sm font-black text-slate-950">{t.name}</h4>
                    <p className="text-xs font-medium text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-[#eef7ff] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand shadow-sm">
              FAQ
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-brand-navy md:text-4xl">Pertanyaan umum sebelum mulai.</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              Jawaban cepat untuk hal-hal yang biasanya ditanyakan sebelum memakai JanganLupa.id.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className={`overflow-hidden border bg-white transition-all duration-300 ${
                  isOpen ? 'border-brand/30 shadow-lg shadow-brand/10' : 'border-white shadow-sm'
                }`}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-black text-brand-navy transition-colors hover:bg-slate-50"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-brand" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-44 border-t border-slate-100' : 'max-h-0'
                    }`}
                  >
                    <p className="bg-white px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-white shadow-xl shadow-brand-navy/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand ${
          showBackToTop
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <Footer />
    </div>
  )
}


