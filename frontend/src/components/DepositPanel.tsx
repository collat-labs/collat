import { useState } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { toast } from 'sonner'
import { ArrowDown, Loader2 } from 'lucide-react'
import { COLLAT_VAULT_ADDRESS, COLLAT_VAULT_ABI, isDeployed } from '../lib/contracts'

export default function DepositPanel() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'idle' | 'depositing'>('idle')

  const { data: nativeBalance } = useBalance({ address, query: { enabled: isConnected } })
  const { data: position } = useReadContract({
    address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'positions',
    args: address ? [address] : undefined, query: { enabled: isConnected && isDeployed },
  })
  const { writeContractAsync } = useWriteContract()

  const depositAmount = amount ? parseEther(amount) : 0n
  const btcDeposited = position ? (position as [bigint, bigint, bigint])[0] : 0n
  const exceedsBalance = depositAmount > (nativeBalance?.value ?? 0n)

  const deposit = async () => {
    if (!address || !depositAmount) return
    setStep('depositing')
    try {
      await writeContractAsync({
        address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI,
        functionName: 'depositCollateral', value: depositAmount,
      })
      toast.success('Deposit submitted')
      await new Promise((r) => setTimeout(r, 5000))
      setAmount(''); setStep('idle')
      toast.success('BTC deposited')
    } catch (e) {
      setStep('idle')
      toast.error(e instanceof Error ? e.message : 'Deposit failed')
    }
  }

  if (!isConnected) {
    return (
      <div className="liquid-glass rounded-2xl p-6 flex items-center justify-center h-full min-h-[200px]">
        <p className="text-white/20 text-sm">Connect your wallet to deposit BTC</p>
      </div>
    )
  }

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-white/20 text-[10px] uppercase tracking-wider">
          <ArrowDown size={12} className="text-red-500" />
          Deposit
        </div>
        <span className={`text-sm font-mono ${nativeBalance && nativeBalance.value > 0n ? 'text-white/60' : 'text-white/20'}`}>
          {nativeBalance ? Number(formatEther(nativeBalance.value)).toFixed(4) : '0'} BTC
        </span>
      </div>

      <div className="liquid-glass rounded-xl flex items-center gap-2 px-4 py-3 mb-2">
        <input
          type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00" step="0.0001" min="0"
          className="flex-1 bg-transparent outline-none text-white text-xl font-mono placeholder:text-white/10"
        />
        <span className="text-white/20 text-sm font-medium">BTC</span>
      </div>

      {btcDeposited > 0n && (
        <p className="text-white/20 text-[11px] mb-3">
          Vault: {formatEther(btcDeposited)} BTC deposited
        </p>
      )}

      {(!nativeBalance || nativeBalance.value === 0n) ? (
        <a href="https://faucet.test.mezo.org" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors text-[11px] text-amber-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Get testnet BTC from Mezo Faucet
        </a>
      ) : (
        <button onClick={deposit} disabled={step !== 'idle' || !depositAmount || exceedsBalance}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white rounded-xl py-3 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1">
          {step === 'depositing' && <Loader2 size={14} className="animate-spin" />}
          <ArrowDown size={14} />
          {step === 'depositing' ? 'Depositing...' : exceedsBalance ? 'Insufficient Balance' : 'Deposit BTC'}
        </button>
      )}
    </div>
  )
}
