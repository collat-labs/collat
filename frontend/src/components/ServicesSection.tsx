import { ArrowUpRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

function BtcIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="opacity-[0.06]">
      <circle cx="12" cy="12" r="11" fill="currentColor" className="text-white">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="5s" repeatCount="indefinite" />
      </circle>
      <text x="12" y="17" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold" fontFamily="serif">B</text>
    </svg>
  )
}

const cards = [
  {
    tag: 'Deposit',
    title: 'BTC Collateral Vault',
    description:
      'Deposit Bitcoin into your non-custodial vault on Mezo. Your BTC stays on-chain — always yours, always verifiable. Earn yield while you hold.',
  },
  {
    tag: 'Spend',
    title: 'Auto-Borrow at Checkout',
    description:
      'Spend MUSD anywhere, anytime. Collat auto-borrows the exact amount at checkout in one atomic transaction. No manual loan steps, no selling, no delays.',
  },
]

export default function ServicesSection() {
  return (
    <section className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,57,53,0.04)_0%,_transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
          }}
        >
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl text-white tracking-tight">
              Core Features
            </h2>
            <p className="hidden md:block text-white/40 text-sm">Built on Mezo</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((card, i) => (
            <AnimatedSection
              key={card.title}
              delay={i * 0.15}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, delay: i * 0.15 },
                },
              }}
            >
              <div className="liquid-glass rounded-3xl overflow-hidden group cursor-pointer">
                <div className="aspect-video overflow-hidden relative bg-gradient-to-br from-[#0a0000] via-black to-[#000a0a] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 600 338" preserveAspectRatio="xMidYMid slice">
                    {Array.from({ length: 30 }).map((_, j) => (
                      <line
                        key={j}
                        x1={Math.random() * 600}
                        y1={Math.random() * 338}
                        x2={Math.random() * 600}
                        y2={Math.random() * 338}
                        stroke="white"
                        strokeWidth="0.3"
                      >
                        <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + j % 3}s`} repeatCount="indefinite" begin={`${j * 0.1}s`} />
                      </line>
                    ))}
                  </svg>
                  <BtcIcon size={120} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="p-6 md:p-8 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="uppercase tracking-widest text-white/40 text-xs">
                      {card.tag}
                    </span>
                    <span className="liquid-glass rounded-full p-2">
                      <ArrowUpRight size={16} className="text-white" />
                    </span>
                  </div>
                  <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
