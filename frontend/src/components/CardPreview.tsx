import { motion } from 'framer-motion'
import { CreditCard, Shield, Zap } from 'lucide-react'

export default function CardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="liquid-glass rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight mb-6">Collat Card</h2>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-6 mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(255,255,255,0.03)_25%,_transparent_25%,_transparent_75%,_rgba(255,255,255,0.03)_75%)] bg-[length:8px_8px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <CreditCard size={28} className="text-white/90" />
            <span className="text-white/60 text-xs font-mono tracking-wider uppercase">Debit</span>
          </div>

          <p className="text-white/70 text-lg font-mono tracking-[0.3em] mb-6">
            4532 **** **** 7891
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Card Holder</p>
              <p className="text-white/80 text-sm font-medium">Collat User</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Expires</p>
              <p className="text-white/80 text-sm font-medium">12/28</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Spending Limit</span>
          <span className="text-white text-sm font-mono">$5,000 / day</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Network</span>
          <span className="text-white/60 text-sm">Mezo</span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-red-500" />
          <span className="text-xs text-white/50">Available with Collat Card (Phase 4)</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-red-500" />
          <span className="text-xs text-white/50">Tap-to-pay via NFC secure chip</span>
        </div>
      </div>

      <button
        disabled
        className="w-full mt-4 bg-white/[0.03] text-white/20 rounded-xl py-2.5 text-xs font-medium border border-white/[0.04] cursor-not-allowed"
      >
        Order Physical Card — Coming Soon
      </button>
    </motion.div>
  )
}
