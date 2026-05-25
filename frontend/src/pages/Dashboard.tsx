import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  ArrowLeft,
  BarChart3,
  Wallet,
  Shield,
  Globe,
  Loader2,
} from 'lucide-react'
import { useCollatData, formatBtc, formatMusd, formatBps } from '../hooks/useCollatData'
import { isDeployed } from '../lib/contracts'
import DepositPanel from '../components/DepositPanel'
import CardPreview from '../components/CardPreview'
import PositionTable from '../components/PositionTable'

export default function Dashboard() {
  const vaultData = useCollatData()

  const tvlUsd = vaultData.totalBtcDeposited > 0n
    ? (Number(vaultData.totalBtcDeposited) / 1e8 * 60000).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : '0'

  const borrowedMusd = formatMusd(vaultData.totalMusdBorrowed)
  const collateralRatio = vaultData.totalBtcDeposited > 0n && vaultData.totalMusdBorrowed > 0n
    ? Math.round((Number(vaultData.totalBtcDeposited) * 60000) / (Number(vaultData.totalMusdBorrowed) / 1e18) * 100)
    : 0

  const stats = [
    { label: 'Total Value Locked', value: `$${tvlUsd}`, sub: `${formatBtc(vaultData.totalBtcDeposited)} BTC`, icon: BarChart3 },
    { label: 'MUSD Borrowed', value: borrowedMusd, sub: `${collateralRatio}% collateral ratio`, icon: Wallet },
    { label: 'Max LTV', value: `${formatBps(vaultData.maxLtvBps)}%`, sub: `Liq. at ${formatBps(vaultData.liquidationLtvBps)}%`, icon: Shield },
    { label: 'Interest Rate', value: `${formatBps(vaultData.interestRateBps)}% APR`, sub: `${formatBps(vaultData.feeRateBps)}% borrow fee`, icon: Globe },
  ]

  const addresses = [
    { label: 'CollatVault', addr: vaultData.vaultAddress },
    { label: 'PriceFeed', addr: vaultData.priceFeedAddress },
    { label: 'BTC Token', addr: vaultData.btcTokenAddress },
    { label: 'MUSD', addr: vaultData.musdAddress },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-red-500" />
              <span className="font-semibold text-lg font-serif-display">Collat</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://faucet.test.mezo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Faucet
            </a>
            <span className="hidden sm:inline text-xs text-white/30 font-mono bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/[0.04]">
              Mezo Matsnet
            </span>
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-serif-display tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm">
            {isDeployed ? 'Live on-chain data from CollatVault' : 'Protocol overview — deploy contracts to Mezo for live data'}
          </p>
        </motion.div>

        {!isDeployed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 liquid-glass rounded-2xl p-4 flex items-center gap-3 text-amber-400/80 text-sm"
          >
            <Shield size={16} />
            <span>Contracts not yet deployed. Run the deployment script to go live.</span>
            <button
              onClick={() => window.open('https://docs.mezo.org', '_blank')}
              className="ml-auto text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Mezo Docs →
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="liquid-glass rounded-2xl p-6 relative"
            >
              {vaultData.loading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-red-500" />
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={20} className="text-red-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{stat.value}</p>
              <p className="text-white/50 text-xs">{stat.sub}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <DepositPanel />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CardPreview />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <PositionTable />

            <div className="liquid-glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold tracking-tight mb-4">Contracts</h2>
              <div className="space-y-3">
                {addresses.map(({ label, addr }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/30 text-xs">{label}</span>
                    <code className="text-[10px] text-white/40 font-mono">
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                    </code>
                  </div>
                ))}
              </div>
              <p className="text-white/10 text-[10px] text-center mt-4 font-mono">Chain ID: 31611</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
