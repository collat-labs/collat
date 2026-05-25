import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function HexGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.05]"
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 20 }).map((_, i) => {
        const cx = 40 + (i * 100) % 720
        const cy = 50 + Math.floor(i / 7) * 90
        const r = 35
        return (
          <polygon
            key={i}
            points={Array.from({ length: 6 })
              .map((_, j) => {
                const angle = (Math.PI / 3) * j - Math.PI / 6
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
              })
              .join(' ')}
            fill="none"
            stroke="#E53935"
            strokeWidth="0.6"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.15}s`} />
          </polygon>
        )
      })}
    </svg>
  )
}

export default function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-3xl overflow-hidden aspect-video relative bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a0505]"
        >
          <HexGrid />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="0.5" className="opacity-20">
              <circle cx="12" cy="12" r="10">
                <animate attributeName="r" values="10;11;10" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="12" cy="12" r="6">
                <animate attributeName="r" values="6;7;6" dur="3s" repeatCount="indefinite" />
              </circle>
              <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" strokeWidth="1">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">
                How it Works
              </p>
              <p className="text-white text-sm md:text-base leading-relaxed">
                Deposit BTC into your vault. When you spend, Collat auto-borrows the
                exact MUSD needed, settles instantly, and lets you repay on your own schedule.
                No selling. No manual loans. No KYC.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium cursor-pointer"
            >
              Get started
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
