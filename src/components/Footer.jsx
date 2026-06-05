import { BriefcaseBusiness, Camera, Heart, Share2 } from 'lucide-react'
import Logo from './Logo'

const socialLinks = [
  { label: 'Facebook', icon: Share2, href: 'https://facebook.com' },
  { label: 'Instagram', icon: Camera, href: 'https://instagram.com' },
  { label: 'LinkedIn', icon: BriefcaseBusiness, href: 'https://linkedin.com' },
]

export default function Footer() {
  return (
    <footer id="kontak" className="relative overflow-hidden bg-[linear-gradient(135deg,#001529_0%,#003366_58%,#0066ff_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"></div>
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.25fr_0.85fr_0.85fr_1fr]">
        <div className="space-y-4">
          <Logo variant="light" to="/" className="transition-transform duration-300 hover:scale-105" />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Pengingat harian yang sederhana dan cepat. Mengatur tugas personal, target belajar, dan deadline kerja kini jauh lebih mudah.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-cyan-200">Layanan</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <a href="#pribadi" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>Personal Schedule</span>
              </a>
            </li>
            <li>
              <a href="#belajar" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>Target Belajar</span>
              </a>
            </li>
            <li>
              <a href="#pekerjaan" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>Deadline Kerja</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-cyan-200">Bantuan</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <a href="#faq" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>FAQ / Tanya Jawab</span>
              </a>
            </li>
            <li>
              <a href="#kontak" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>Hubungi Kami</span>
              </a>
            </li>
            <li>
              <a href="#panduan" className="group flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 opacity-60 transition-opacity group-hover:opacity-100"></span>
                <span>Panduan Pengguna</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-cyan-200">Ikuti Kami</h4>
          <div className="flex flex-col gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white hover:text-brand-navy"
                >
                  <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">{social.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-8 text-center text-xs text-white/55 sm:flex-row">
        <span>&copy; 2026 JanganLupa.id. Hak Cipta Dilindungi.</span>
        <span className="flex items-center gap-1">
          Dibuat dengan <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> untuk Produktivitas Harian
        </span>
      </div>
    </footer>
  )
}
