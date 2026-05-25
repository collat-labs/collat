import AnimatedSection from './AnimatedSection'

function NodeMesh() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06]"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="nodeDot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E53935" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E53935" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 50 + ((i * 137) % 700)
        const y = 50 + ((i * 89) % 300)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="url(#nodeDot)">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
            {i < 10 && (
              <line
                x1={x}
                y1={y}
                x2={50 + (((i + 1) * 137) % 700)}
                y2={50 + (((i + 1) * 89) % 300)}
                stroke="#E53935"
                strokeWidth="0.5"
                opacity="0.3"
              >
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${3 + (i % 2)}s`} repeatCount="indefinite" />
              </line>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function AboutSection() {
  return (
    <section className="bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,57,53,0.06)_0%,_transparent_70%)]" />
      <NodeMesh />

      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
          <p className="text-white/40 text-sm tracking-widest uppercase mb-8">
            What is Collat
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
            Redefining{' '}
            <em className="font-serif-display italic text-red-500">wealth</em>{' '}
            <br className="hidden md:block" />
            for a world that{' '}
            <em className="font-serif-display italic text-red-500">spends, earns, and lives</em> on Bitcoin.
          </h2>
        </AnimatedSection>
      </div>
    </section>
  )
}
