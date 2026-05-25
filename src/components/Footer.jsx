import Logo from './Logo'

const socialLinks = [
  { label: 'Facebook', letter: 'f' },
  { label: 'Instagram', letter: 'in' },
  { label: 'LinkedIn', letter: 'in' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Logo variant="light" to="/" />
          <p className="text-sm text-white/70">
            Pengingat Harianmu, Sederhana & Cepat.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Layanan</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Personal</li>
            <li>Pendidikan</li>
            <li>Pekerjaan</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Bantuan</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>FAQ</li>
            <li>Kontak</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Ikuti Kami</h4>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <button
                key={social.label}
                type="button"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-xs font-bold transition-colors hover:bg-white/10"
              >
                {social.letter}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-white/60">
        © 2026 JanganLupa.id. All rights reserved.
      </div>
    </footer>
  )
}
