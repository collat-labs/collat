import AnimatedSection from './AnimatedSection'

const PHILOSOPHY_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4'

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
            <div className="rounded-3xl overflow-hidden aspect-[4/3]">
              <video
                src={PHILOSOPHY_VIDEO}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
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
