import { useAccount, useReadContract } from 'wagmi'
import { formatEther, formatUnits } from 'viem'
import { Loader2 } from 'lucide-react'
import { COLLAT_VAULT_ADDRESS, COLLAT_VAULT_ABI, isDeployed } from '../lib/contracts'

export default function PositionTable() {
  const { address, isConnected } = useAccount()

  const { data: position, isLoading } = useReadContract({
    address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'positions',
    args: address ? [address] : undefined, query: { enabled: isConnected && isDeployed },
  })
  const { data: ltv } = useReadContract({
    address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'getCurrentLtv',
    args: address ? [address] : undefined, query: { enabled: isConnected && isDeployed },
  })
  const { data: healthFactor } = useReadContract({
    address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'getHealthFactor',
    args: address ? [address] : undefined, query: { enabled: isConnected && isDeployed },
  })
  const { data: maxBorrow } = useReadContract({
    address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'getMaxBorrow',
    args: address ? [address] : undefined, query: { enabled: isConnected && isDeployed },
  })

  if (!isConnected) {
    return (
      <div className="liquid-glass rounded-2xl p-6 flex items-center justify-center h-full min-h-[200px]">
        <p className="text-white/20 text-sm">Connect wallet to view position</p>
      </div>
    )
  }

  const btc = position ? (position as [bigint, bigint, bigint])[0] : 0n
  const debt = position ? (position as [bigint, bigint, bigint])[1] : 0n
  const hasPosition = btc > 0n || debt > 0n
  const ltvPercent = ltv ? ((Number(ltv as bigint)) / 100).toFixed(1) : '0'
  const hfRaw = healthFactor ? Number(healthFactor as bigint) / 1e27 : 0
  const hfDisplay = hfRaw > 999999 ? '∞' : hfRaw.toFixed(2)

  const ltvColor = Number(ltvPercent) > 75 ? 'text-red-500' : Number(ltvPercent) > 60 ? 'text-amber-400' : 'text-emerald-400'
  const hfColor = hfRaw > 2 ? 'text-emerald-400' : hfRaw > 1.1 ? 'text-amber-400' : 'text-red-500'

  return (
    <div className="liquid-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 text-white/20 text-[10px] uppercase tracking-wider mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Your Position
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-red-500" /></div>
      ) : !hasPosition ? (
        <div className="text-center py-10">
          <p className="text-white/20 text-sm">No active position</p>
          <p className="text-white/10 text-xs mt-1">Deposit BTC to get started</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="liquid-glass rounded-xl p-4 text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Deposited</p>
              <p className="text-white text-lg font-mono font-bold">{Number(formatEther(btc)).toFixed(4)}</p>
              <p className="text-white/20 text-[10px]">BTC</p>
            </div>
            <div className="liquid-glass rounded-xl p-4 text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Borrowed</p>
              <p className="text-white text-lg font-mono font-bold">{Number(formatUnits(debt, 6)).toLocaleString()}</p>
              <p className="text-white/20 text-[10px]">MUSD</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-2 rounded-lg bg-white/[0.02]">
              <p className={`text-sm font-mono font-bold ${ltvColor}`}>{ltvPercent}%</p>
              <p className="text-white/20 text-[10px]">LTV</p>
            </div>
            <div className="text-center py-2 rounded-lg bg-white/[0.02]">
              <p className={`text-sm font-mono font-bold ${hfColor}`}>{hfDisplay}</p>
              <p className="text-white/20 text-[10px]">Health</p>
            </div>
            <div className="text-center py-2 rounded-lg bg-white/[0.02]">
              <p className="text-sm font-mono font-bold text-white/70">
                {maxBorrow ? Number(formatUnits(maxBorrow as bigint, 6)).toLocaleString() : '0'}
              </p>
              <p className="text-white/20 text-[10px]">Available</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
