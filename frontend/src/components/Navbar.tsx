import { Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Docs', href: '#docs' },
]

export default function Navbar() {
  return (
    <nav className="relative z-20 px-6 py-6">
      <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Globe size={24} className="text-white" />
            <span className="text-white font-semibold text-lg font-serif-display">Collat</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 ml-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  )
}
