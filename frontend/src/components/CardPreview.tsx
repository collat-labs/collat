import { motion } from 'framer-motion'
import { CreditCard, Shield, Zap } from 'lucide-react'

export default function CardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="liquid-glass rounded-2xl overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="md:col-span-2 relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <CreditCard size={28} className="text-white/80" />
              <span className="text-white/40 text-xs font-mono tracking-wider uppercase">Debit</span>
            </div>

            <p className="text-white/50 text-lg font-mono tracking-[0.25em] mb-8">
              4532 **** **** 7891
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Holder</p>
                <p className="text-white/70 text-sm font-medium">Collat User</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Expires</p>
                <p className="text-white/70 text-sm font-medium">12/28</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-red-500" />
              <span className="text-white/40 text-xs">Tap-to-pay via NFC secure chip</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-red-500" />
              <span className="text-white/40 text-xs">Auto-borrow MUSD at checkout</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/30 text-[10px]">Status</span>
              <span className="text-emerald-400 text-[10px]">Active</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/30 text-[10px]">Spending Limit</span>
              <span className="text-white/60 text-[10px] font-mono">$5,000/day</span>
            </div>
            <button disabled
              className="w-full bg-white/[0.03] text-white/20 rounded-xl py-2 text-[11px] font-medium border border-white/[0.04] cursor-not-allowed">
              Order physical card
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
