import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { Loader2 } from 'lucide-react'
import {
  COLLAT_VAULT_ADDRESS,
  COLLAT_VAULT_ABI,
  isDeployed,
} from '../lib/contracts'

export default function PositionTable() {
  const { address, isConnected } = useAccount()

  const { data: position, isLoading } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'positions',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { data: ltv } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'getCurrentLtv',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { data: healthFactor } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'getHealthFactor',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  const { data: maxBorrow } = useReadContract({
    address: COLLAT_VAULT_ADDRESS,
    abi: COLLAT_VAULT_ABI,
    functionName: 'getMaxBorrow',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isDeployed },
  })

  if (!isConnected) {
    return (
      <div className="liquid-glass rounded-2xl p-6 text-center">
        <p className="text-white/30 text-sm">Connect wallet to view your position</p>
      </div>
    )
  }

  const btcDeposited = position ? (position as [bigint, bigint, bigint])[0] : 0n
  const musdBorrowed = position ? (position as [bigint, bigint, bigint])[1] : 0n
  const exists = btcDeposited > 0n || musdBorrowed > 0n

  const ltvPercent = ltv ? ((Number(ltv as bigint)) / 100).toFixed(2) : '0'
  const hfRaw = healthFactor ? Number(healthFactor as bigint) / 1e27 : 0
  const hfDisplay = hfRaw > 999999 ? '∞' : hfRaw.toFixed(2)

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Your Position</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-red-500" />
        </div>
      ) : !exists ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm mb-2">No active position</p>
          <p className="text-white/20 text-xs">Deposit BTC to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="liquid-glass rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">BTC Deposited</p>
              <p className="text-white text-lg font-mono font-bold">
                {formatUnits(btcDeposited, 8)}
              </p>
              <p className="text-white/30 text-[10px]">BTC</p>
            </div>
            <div className="liquid-glass rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">MUSD Borrowed</p>
              <p className="text-white text-lg font-mono font-bold">
                {Number(formatUnits(musdBorrowed, 18)).toLocaleString()}
              </p>
              <p className="text-white/30 text-[10px]">MUSD</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-white/30 text-xs mb-1">LTV</p>
              <p className={`text-sm font-mono font-medium ${
                Number(ltvPercent) > 75 ? 'text-red-500' : Number(ltvPercent) > 60 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {ltvPercent}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/30 text-xs mb-1">Health</p>
              <p className={`text-sm font-mono font-medium ${
                hfRaw > 2 ? 'text-emerald-400' : hfRaw > 1.1 ? 'text-amber-400' : 'text-red-500'
              }`}>
                {hfDisplay}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/30 text-xs mb-1">Available</p>
              <p className="text-sm font-mono text-white/80">
                {maxBorrow ? Number(formatUnits(maxBorrow as bigint, 18)).toLocaleString() : '0'}
              </p>
            </div>
          </div>

          {!isDeployed && (
            <p className="text-amber-400/60 text-xs text-center mt-2">
              Contract not yet deployed — showing mock data
            </p>
          )}
        </div>
      )}
    </div>
  )
}
