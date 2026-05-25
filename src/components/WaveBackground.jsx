export default function WaveBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-[#f8fafc] ${className}`}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <path
          d="M0 200 Q360 80 720 200 T1440 200 V900 H0 Z"
          fill="none"
          stroke="#0066ff"
          strokeWidth="1.5"
          opacity="0.25"
        />
        <path
          d="M0 350 Q400 250 800 350 T1440 350"
          fill="none"
          stroke="#0066ff"
          strokeWidth="1"
          opacity="0.15"
        />
        <path
          d="M0 500 Q300 400 600 500 T1200 480"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1"
          opacity="0.2"
        />
        <path
          d="M1440 100 Q1080 0 720 120 T0 80"
          fill="none"
          stroke="#0066ff"
          strokeWidth="1.5"
          opacity="0.2"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
