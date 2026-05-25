import AnimatedSection from './AnimatedSection'

function VaultShield() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E53935" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E53935" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E53935" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E53935" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="300" rx="24" fill="url(#vaultGrad)" stroke="#E53935" strokeWidth="0.5" strokeOpacity="0.2" />

      <g transform="translate(200,130)">
        <path d="M-50,-60 L50,-60 L70,-30 L70,30 L50,60 L-50,60 L-70,30 L-70,-30 Z" fill="none" stroke="url(#lineGrad)" strokeWidth="1.2">
          <animate attributeName="strokeOpacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
        </path>
        <circle cx="0" cy="0" r="15" fill="none" stroke="#E53935" strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="0" y="90" textAnchor="middle" fill="#E53935" opacity="0.15" fontSize="14" fontFamily="monospace">
          tBTC
        </text>
      </g>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8
        const startR = 50
        const endR = 100
        return (
          <line
            key={i}
            x1={200 + startR * Math.cos(angle)}
            y1={130 + startR * Math.sin(angle)}
            x2={200 + endR * Math.cos(angle)}
            y2={130 + endR * Math.sin(angle)}
            stroke="#E53935"
            strokeWidth="0.4"
            opacity="0.15"
          >
            <animate attributeName="opacity" values="0.1;0.25;0.1" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </line>
        )
      })}

      {Array.from({ length: 6 }).map((_, i) => {
        const x = 50 + Math.random() * 300
        const y = 20 + Math.random() * 260
        return (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#E53935" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${1 + (i % 2) * 1.5}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        )
      })}
    </svg>
  )
}

export default function PhilosophySection() {
  return (
    <section className="bg-black py-28 md:py-40 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <h2 className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24">
            Security{' '}
            <em className="font-serif-display italic text-red-500">x</em>{' '}
            Freedom
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <AnimatedSection
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
            }}
          >
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#0a0000] via-black to-[#000a0a] border border-white/[0.04]">
              <VaultShield />
            </div>
          </AnimatedSection>

          <AnimatedSection
            variants={{
              hidden: { opacity: 0, x: 40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
            }}
          >
            <div className="space-y-8">
              <div>
                <p className="text-white/40 text-xs tracking-widest uppercase mb-4">
                  Self-custody first
                </p>
                <p className="text-white/70 text-base md:text-lg leading-relaxed">
                  Your Bitcoin stays in your vault, always on-chain, always yours. Collat is
                  built on Mezo — a Bitcoin layer 2 — so your collateral never leaves the
                  Bitcoin ecosystem. No wrapped tokens, no bridges, no custodians.
                </p>
              </div>

              <div className="w-full h-px bg-white/10" />

              <div>
                <p className="text-white/40 text-xs tracking-widest uppercase mb-4">
                  Spend without selling
                </p>
                <p className="text-white/70 text-base md:text-lg leading-relaxed">
                  The best investment is one you never have to sell. Collat lets you unlock
                  the value of your Bitcoin at the point of sale, auto-borrowing MUSD in a
                  single atomic transaction. Keep your upside. Use your wealth.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
