import { useState } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther, formatUnits } from 'viem'
import { toast } from 'sonner'
import { ArrowDown, Loader2, Wallet } from 'lucide-react'
import {
  COLLAT_VAULT_ADDRESS,
  COLLAT_VAULT_ABI,
  isDeployed,
} from '../lib/contracts'

export default function DepositPanel() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'idle' | 'depositing'>('idle')

  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: isConnected },
  })

  const { data: position } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'positions',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { writeContractAsync } = useWriteContract()

  const depositAmount = amount ? parseEther(amount) : 0n

  const deposit = async () => {
    if (!address || !depositAmount) return
    setStep('depositing')
    try {
      await writeContractAsync({
        address: COLLAT_VAULT_ADDRESS,
        abi: COLLAT_VAULT_ABI,
        functionName: 'depositCollateral',
        value: depositAmount,
      })
      toast.success('Deposit submitted')
      await new Promise((r) => setTimeout(r, 5000))
      setAmount('')
      setStep('idle')
      toast.success('BTC deposited')
    } catch (e) {
      setStep('idle')
      toast.error(e instanceof Error ? e.message : 'Deposit failed')
    }
  }

  if (!isConnected) {
    return (
      <div className="liquid-glass rounded-2xl p-6 text-center">
        <p className="text-white/30 text-sm">Connect your wallet to deposit BTC</p>
      </div>
    )
  }

  const btcDeposited = position ? (position as [bigint, bigint, bigint])[0] : 0n
  const musdDebt = position ? (position as [bigint, bigint, bigint])[1] : 0n
  const hasBalance = nativeBalance && nativeBalance.value > 0n
  const exceedsBalance = depositAmount > (nativeBalance?.value ?? 0n)

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Deposit BTC</h2>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40 flex items-center gap-1.5">
            <Wallet size={12} />
            Wallet Balance
          </span>
          <span className={`font-mono ${hasBalance ? 'text-emerald-400' : 'text-white/30'}`}>
            {nativeBalance ? Number(formatEther(nativeBalance.value)).toFixed(6) : '0'} BTC
          </span>
        </div>
        {!hasBalance && (
          <a
            href="https://faucet.test.mezo.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors text-xs text-amber-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            No BTC in wallet. Get testnet BTC from the Mezo Faucet
          </a>
        )}
      </div>

      {btcDeposited > 0n && (
        <div className="mb-4 border-t border-white/[0.06] pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">Deposited</span>
            <span className="text-red-400 font-mono">{formatEther(btcDeposited)} BTC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">MUSD Debt</span>
            <span className="text-white/60 font-mono">{formatUnits(musdDebt, 6)}</span>
          </div>
        </div>
      )}

      <div className="liquid-glass rounded-xl flex items-center gap-2 px-4 py-3 mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.000001"
          min="0"
          className="flex-1 bg-transparent outline-none text-white text-lg font-mono placeholder:text-white/20"
        />
        <span className="text-white/40 text-sm font-medium">BTC</span>
      </div>

      <button
        onClick={deposit}
        disabled={step !== 'idle' || !depositAmount || exceedsBalance || !isDeployed}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        {step === 'depositing' && <Loader2 size={14} className="animate-spin" />}
        <ArrowDown size={14} />
        {step === 'depositing'
          ? 'Depositing...'
          : exceedsBalance
            ? 'Insufficient Balance'
            : 'Deposit BTC'}
      </button>
    </div>
  )
}
