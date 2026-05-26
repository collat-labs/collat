import { useState } from 'react'
import { motion } from 'framer-motion'
import { Repeat, Plus, Trash2, Clock } from 'lucide-react'

interface Schedule {
  id: string
  amount: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextRun: string
  status: 'active' | 'paused'
}

const mockSchedules: Schedule[] = [
  { id: '1', amount: '500', frequency: 'weekly', nextRun: '2026-06-03', status: 'active' },
  { id: '2', amount: '2000', frequency: 'monthly', nextRun: '2026-07-01', status: 'paused' },
]

const freqLabels: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

export default function RecurringPayments() {
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules)

  const addSchedule = () => {
    if (!amount) return
    const next = new Date()
    if (frequency === 'daily') next.setDate(next.getDate() + 1)
    else if (frequency === 'weekly') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + 1)
    setSchedules([...schedules, {
      id: String(Date.now()),
      amount,
      frequency,
      nextRun: next.toISOString().split('T')[0],
      status: 'active',
    }])
    setAmount('')
  }

  const remove = (id: string) => setSchedules(schedules.filter((s) => s.id !== id))

  const toggle = (id: string) => setSchedules(schedules.map((s) =>
    s.id === id ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const } : s
  ))

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="liquid-glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Repeat size={20} className="text-red-500" />
        <h2 className="text-lg font-semibold tracking-tight">Recurring Repayments</h2>
        <span className="text-[10px] text-amber-400/60 bg-amber-400/5 px-2 py-0.5 rounded-full font-mono uppercase">
          Coming Soon
        </span>
      </div>

      <p className="text-white/40 text-sm mb-6">
        Schedule automatic MUSD repayments. Set it once, your vault stays healthy.
      </p>

      <div className="liquid-glass rounded-xl p-4 mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (MUSD)"
            className="flex-1 bg-transparent outline-none text-white text-sm font-mono placeholder:text-white/20"
          />
          <span className="text-white/30 text-sm">MUSD</span>
        </div>
        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                frequency === f
                  ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                  : 'text-white/40 hover:text-white/60 border border-white/[0.04]'
              }`}
            >
              {freqLabels[f]}
            </button>
          ))}
        </div>
        <button
          onClick={addSchedule}
          disabled={!amount}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 transition-colors"
        >
          <Plus size={12} />
          Add Schedule
        </button>
      </div>

      {schedules.length > 0 && (
        <div className="space-y-2">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-white/30" />
                <div>
                  <p className="text-white text-sm font-mono font-medium">{s.amount} MUSD</p>
                  <p className="text-white/30 text-[10px]">
                    {freqLabels[s.frequency]} · Next: {s.nextRun}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(s.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                    s.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white/5 text-white/30 hover:text-white/50'
                  }`}
                >
                  {s.status === 'active' ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
