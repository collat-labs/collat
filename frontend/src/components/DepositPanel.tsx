import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'sonner'
import { ArrowDown, Loader2 } from 'lucide-react'
import {
  COLLAT_VAULT_ADDRESS,
  BTC_TOKEN_ADDRESS,
  COLLAT_VAULT_ABI,
  ERC20_ABI,
  isDeployed,
} from '../lib/contracts'

export default function DepositPanel() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing'>('idle')

  const { data: btcBalance, refetch: refetchBalance } = useReadContract({
    address: BTC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { data: position } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'positions',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BTC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, COLLAT_VAULT_ADDRESS] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { writeContractAsync } = useWriteContract()

  const depositAmount = amount ? parseUnits(amount, 8) : 0n
  const needsApproval = depositAmount > 0n && (allowance ?? 0n) < depositAmount

  const approve = async () => {
    if (!address || !depositAmount) return
    setStep('approving')
    try {
      await writeContractAsync({
        address: BTC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [COLLAT_VAULT_ADDRESS, depositAmount],
      })
      toast.success('Approval submitted')
      // Wait for receipt
      await new Promise((r) => setTimeout(r, 5000))
      refetchAllowance()
      setStep('idle')
      toast.success('BTC approved for deposit')
    } catch (e) {
      setStep('idle')
      toast.error(e instanceof Error ? e.message : 'Approval failed')
    }
  }

  const deposit = async () => {
    if (!address || !depositAmount) return
    setStep('depositing')
    try {
      await writeContractAsync({
        address: COLLAT_VAULT_ADDRESS,
        abi: COLLAT_VAULT_ABI,
        functionName: 'depositCollateral',
        args: [depositAmount],
      })
      toast.success('Deposit submitted')
      await new Promise((r) => setTimeout(r, 5000))
      refetchBalance()
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

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Deposit BTC</h2>

      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-white/40">Wallet Balance</span>
        <span className="text-white font-mono">
          {btcBalance != null ? formatUnits(btcBalance as bigint, 8) : '0'} BTC
        </span>
      </div>

      {btcDeposited > 0n && (
        <>
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="text-white/40">Deposited</span>
            <span className="text-red-400 font-mono">{formatUnits(btcDeposited, 8)} BTC</span>
          </div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-white/40">MUSD Debt</span>
            <span className="text-white/60 font-mono">{formatUnits(musdDebt, 18)}</span>
          </div>
        </>
      )}

      <div className="liquid-glass rounded-xl flex items-center gap-2 px-4 py-3 mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.001"
          min="0"
          className="flex-1 bg-transparent outline-none text-white text-lg font-mono placeholder:text-white/20"
        />
        <span className="text-white/40 text-sm font-medium">BTC</span>
      </div>

      {needsApproval ? (
        <button
          onClick={approve}
          disabled={step !== 'idle' || !isDeployed}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {step === 'approving' && <Loader2 size={14} className="animate-spin" />}
          {step === 'approving' ? 'Approving...' : 'Approve BTC'}
        </button>
      ) : (
        <button
          onClick={deposit}
          disabled={step !== 'idle' || !depositAmount || !isDeployed}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {step === 'depositing' && <Loader2 size={14} className="animate-spin" />}
          <ArrowDown size={14} />
          {step === 'depositing' ? 'Depositing...' : 'Deposit BTC'}
        </button>
      )}

      {!isDeployed && (
        <p className="text-amber-400/60 text-xs mt-3 text-center">
          Contract not yet deployed to Mezo testnet
        </p>
      )}

      <a
        href="https://faucet.test.mezo.org"
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 text-center text-xs text-red-500/60 hover:text-red-400 transition-colors"
      >
        Get testnet BTC from the Mezo Faucet →
      </a>
    </div>
  )
}
