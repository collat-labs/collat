import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, Check, ArrowUpRight, Terminal } from 'lucide-react'

const JS_SNIPPET = `// Install
npm install @collat/pay-sdk

// Initialize
import { CollatPay } from '@collat/pay-sdk'

const collat = new CollatPay({
  apiKey: 'collat_live_...',
  network: 'matsnet'
})

// One-line checkout
await collat.checkout({
  amount: '25.00',
  currency: 'USD',
  merchantId: 'merchant_abc123'
})
// Collat auto-borrows MUSD against user's BTC
// Merchant receives MUSD instantly`

const REACT_SNIPPET = `import { CollatButton } from '@collat/pay-sdk/react'

function ProductPage() {
  return (
    <CollatButton
      amount={product.price}
      currency="USD"
      onSuccess={(tx) => console.log(tx)}
      theme="dark"
    />
  )
}`

export default function SDKSection() {
  const [copied, setCopied] = useState('')

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="liquid-glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Code2 size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold tracking-tight">Collat Pay SDK</h2>
          <span className="text-[10px] text-amber-400/60 bg-amber-400/5 px-2 py-0.5 rounded-full font-mono uppercase">
            Developer Preview
          </span>
        </div>
        <a
          href="#"
          className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          Docs <ArrowUpRight size={12} />
        </a>
      </div>

      <p className="text-white/40 text-sm mb-6">
        Embed Collat checkout into any website. One line of code, instant BTC-backed payments at your store.
      </p>

      <div className="grid grid-cols-1 gap-3">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} className="text-white/30" />
              <span className="text-white/30 text-xs font-mono">Node.js / TypeScript</span>
            </div>
            <button
              onClick={() => copy(JS_SNIPPET, 'js')}
              className="text-white/30 hover:text-white transition-colors"
            >
              {copied === 'js' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <pre className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 overflow-x-auto text-xs font-mono text-white/60 leading-relaxed">
{JS_SNIPPET}
          </pre>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} className="text-white/30" />
              <span className="text-white/30 text-xs font-mono">React Component</span>
            </div>
            <button
              onClick={() => copy(REACT_SNIPPET, 'react')}
              className="text-white/30 hover:text-white transition-colors"
            >
              {copied === 'react' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <pre className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 overflow-x-auto text-xs font-mono text-white/60 leading-relaxed">
{REACT_SNIPPET}
          </pre>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'SDK Size', value: '12 KB' },
          { label: 'Integration Time', value: '< 5 min' },
          { label: 'Networks', value: 'Mezo' },
        ].map((stat) => (
          <div key={stat.label} className="text-center py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-white text-sm font-bold">{stat.value}</p>
            <p className="text-white/30 text-[10px]">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
