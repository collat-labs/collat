import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  ArrowLeft,
  BarChart3,
  Wallet,
  Shield,
  Globe,
  Loader2,
  ChevronDown,
  Code2,
} from 'lucide-react'
import { useCollatData, formatBtc, formatMusd, formatBps } from '../hooks/useCollatData'
import { isDeployed } from '../lib/contracts'
import DepositPanel from '../components/DepositPanel'
import CardPreview from '../components/CardPreview'
import PositionTable from '../components/PositionTable'
import SDKSection from '../components/SDKSection'
import RecurringPayments from '../components/RecurringPayments'
import YieldStrategies from '../components/YieldStrategies'

export default function Dashboard() {
  const vaultData = useCollatData()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const tvlUsd = vaultData.totalBtcDeposited > 0n
    ? (Number(vaultData.totalBtcDeposited) / 1e18 * 60000).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : '0'

  const collateralRatio = vaultData.totalBtcDeposited > 0n && vaultData.totalMusdBorrowed > 0n
    ? Math.round((Number(vaultData.totalBtcDeposited) / 1e18 * 60000) / (Number(vaultData.totalMusdBorrowed) / 1e6) * 100)
    : 0

  const stats = [
    { label: 'TVL', value: `$${tvlUsd}`, sub: `${formatBtc(vaultData.totalBtcDeposited)} BTC`, icon: BarChart3 },
    { label: 'MUSD Borrowed', value: formatMusd(vaultData.totalMusdBorrowed), sub: `${collateralRatio}% collateralized`, icon: Wallet },
    { label: 'Max LTV', value: `${formatBps(vaultData.maxLtvBps)}%`, sub: `Liq. threshold ${formatBps(vaultData.liquidationLtvBps)}%`, icon: Shield },
    { label: 'Borrow Rate', value: `${formatBps(vaultData.interestRateBps)}%`, sub: `${formatBps(vaultData.feeRateBps)}% origination fee`, icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-px h-4 bg-white/[0.08]" />
            <Globe size={18} className="text-red-500" />
            <span className="font-semibold font-serif-display">Collat</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://faucet.test.mezo.org" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-red-500/80 hover:text-red-400 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Faucet
            </a>
            <span className="hidden sm:inline text-[10px] text-white/20 font-mono uppercase tracking-wider">
              Matsnet
            </span>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-serif-display tracking-tight mb-1">Dashboard</h1>
          <p className="text-white/30 text-sm">
            {isDeployed ? 'Live protocol data from Mezo Matsnet' : 'Protocol overview'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="liquid-glass rounded-2xl p-5 relative"
            >
              {vaultData.loading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-red-500" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <stat.icon size={16} className="text-red-500/70" />
                <span className="text-white/20 text-[10px] uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-white/30 text-[11px] mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <DepositPanel />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <PositionTable />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-3"
        >
          <CardPreview />
        </motion.div>

        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3 text-white/15 text-[10px] font-mono">
            <span>Vault: {vaultData.vaultAddress.slice(0, 6)}...{vaultData.vaultAddress.slice(-4)}</span>
            <span className="w-px h-3 bg-white/[0.06]" />
            <span>MUSD: {vaultData.musdAddress.slice(0, 6)}...{vaultData.musdAddress.slice(-4)}</span>
            <span className="w-px h-3 bg-white/[0.06]" />
            <span>Chain 31611</span>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <Code2 size={12} />
            Developer Tools
            <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <SDKSection />
                <RecurringPayments />
              </div>
              <div className="mt-3">
                <YieldStrategies />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
