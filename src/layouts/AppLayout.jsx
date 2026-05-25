import Navbar from '../components/Navbar'
import WaveBackground from '../components/WaveBackground'

export default function AppLayout({ children, active }) {
  return (
    <WaveBackground>
      <Navbar active={active} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </WaveBackground>
  )
}
