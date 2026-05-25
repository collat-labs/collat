import { ArrowUpRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const SERVICE_VIDEO_1 =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'

const SERVICE_VIDEO_2 =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4'

const cards = [
  {
    video: SERVICE_VIDEO_1,
    tag: 'Deposit',
    title: 'BTC Collateral Vault',
    description:
      'Deposit Bitcoin into your non-custodial vault on Mezo. Your BTC stays on-chain — always yours, always verifiable. Earn yield while you hold.',
  },
  {
    video: SERVICE_VIDEO_2,
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
                <div className="aspect-video overflow-hidden">
                  <video
                    src={card.video}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
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
