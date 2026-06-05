export default function WaveBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-white ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,21,41,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,21,41,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,102,255,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.84)_48%,rgba(255,255,255,1)_100%)]" />
      <div className="pointer-events-none absolute -left-28 top-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-navy/5 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
