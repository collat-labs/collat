import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, Shield, Lock } from 'lucide-react'

const pools = [
  {
    name: 'MUSD Savings Vault',
    apy: '4.2%',
    tvl: '$1.2M',
    risk: 'Low',
    description: 'Deposit idle MUSD into a low-risk savings pool. Earn yield while keeping funds available for repayment.',
  },
  {
    name: 'MUSD / BTC Liquidity',
    apy: '8.7%',
    tvl: '$890K',
    risk: 'Medium',
    description: 'Provide liquidity to the MUSD/BTC pair on Mezo DEX. Earn trading fees plus LP rewards.',
  },
  {
    name: 'Collat Boost',
    apy: '12.4%',
    tvl: '$420K',
    risk: 'High',
    description: 'Lock MUSD in the Collat Boost pool. Higher yield for longer lock periods. Supports protocol stability.',
  },
]

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  High: 'text-red-400 bg-red-500/10',
}

export default function YieldStrategies() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="liquid-glass rounded-2xl p-6 lg:col-span-3"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold tracking-tight">Yield Strategies</h2>
          <span className="text-[10px] text-amber-400/60 bg-amber-400/5 px-2 py-0.5 rounded-full font-mono uppercase">
            Coming Soon
          </span>
        </div>
        <a
          href="#"
          className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          View all pools <ArrowUpRight size={12} />
        </a>
      </div>

      <p className="text-white/40 text-sm mb-6">
        Put your idle MUSD to work. Earn yield from Mezo protocol pools while maintaining your vault health.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pools.map((pool) => (
          <div
            key={pool.name}
            className="liquid-glass rounded-xl p-5 group hover:border-red-500/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white text-sm font-medium mb-1">{pool.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${riskColors[pool.risk]}`}>
                    {pool.risk} Risk
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-400 text-xl font-bold">{pool.apy}</p>
                <p className="text-white/20 text-[10px]">APY</p>
              </div>
            </div>

            <p className="text-white/40 text-xs leading-relaxed mb-3">
              {pool.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[10px]">TVL: {pool.tvl}</span>
              <button className="flex items-center gap-1 text-xs text-white/50 group-hover:text-red-400 transition-colors">
                <Lock size={10} />
                Deposit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
        <Shield size={16} className="text-red-500/60" />
        <div>
          <p className="text-white/60 text-xs">Yield strategies coming with Mezo mainnet.</p>
          <p className="text-white/20 text-[10px]">
            Integrating with Mezo native yield protocols for MUSD lending and liquidity provision.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
