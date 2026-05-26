import { useCallback, useEffect, useState } from 'react'
import { createPublicClient, http, type PublicClient } from 'viem'
import { mezoTestnet } from '../lib/chain'
import {
  COLLAT_VAULT_ADDRESS,
  MUSD_ADDRESS,
  COLLAT_VAULT_ABI,
  MUSD_ABI,
  isDeployed,
} from '../lib/contracts'

export interface VaultData {
  totalBtcDeposited: bigint
  totalMusdBorrowed: bigint
  maxLtvBps: bigint
  liquidationLtvBps: bigint
  liquidationPenaltyBps: bigint
  interestRateBps: bigint
  feeRateBps: bigint
  minCollateral: bigint
  vaultAddress: string
  priceFeedAddress: string
  musdAddress: string
  musdTotalSupply: bigint
  loading: boolean
  error: string | null
  deployed: boolean
}

const DEFAULTS: VaultData = {
  totalBtcDeposited: 0n,
  totalMusdBorrowed: 0n,
  maxLtvBps: 6000n,
  liquidationLtvBps: 7500n,
  liquidationPenaltyBps: 500n,
  interestRateBps: 500n,
  feeRateBps: 50n,
  minCollateral: 1_000_000_000_000n,
  vaultAddress: COLLAT_VAULT_ADDRESS,
  priceFeedAddress: '0x0000000000000000000000000000000000000000',
  musdAddress: MUSD_ADDRESS,
  musdTotalSupply: 0n,
  loading: false,
  error: null,
  deployed: false,
}

function createClient(): PublicClient {
  return createPublicClient({
    chain: mezoTestnet,
    transport: http(),
  })
}

export function useCollatData(): VaultData {
  const [data, setData] = useState<VaultData>({ ...DEFAULTS, loading: true })

  const fetchData = useCallback(async () => {
    if (!isDeployed) {
      setData({ ...DEFAULTS, loading: false, deployed: false })
      return
    }
    try {
      const client = createClient()
      const [
        totalBtcDeposited, totalMusdBorrowed, maxLtv, liqLtv, liqPenalty,
        interest, fee, minCol, priceFeedAddr, musdAddr, musdSupply,
      ] = await Promise.all([
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'totalBtcDeposited' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'totalMusdBorrowed' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'MAX_LTV_BPS' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'LIQUIDATION_LTV_BPS' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'LIQUIDATION_PENALTY_BPS' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'interestRateBps' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'feeRateBps' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'minCollateral' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'priceFeed' }),
        client.readContract({ address: COLLAT_VAULT_ADDRESS, abi: COLLAT_VAULT_ABI, functionName: 'musdToken' }),
        client.readContract({ address: MUSD_ADDRESS, abi: MUSD_ABI, functionName: 'totalSupply' }),
      ])
      setData({
        totalBtcDeposited: totalBtcDeposited as bigint,
        totalMusdBorrowed: totalMusdBorrowed as bigint,
        maxLtvBps: maxLtv as bigint,
        liquidationLtvBps: liqLtv as bigint,
        liquidationPenaltyBps: liqPenalty as bigint,
        interestRateBps: interest as bigint,
        feeRateBps: fee as bigint,
        minCollateral: minCol as bigint,
        vaultAddress: COLLAT_VAULT_ADDRESS,
        priceFeedAddress: priceFeedAddr as string,
        musdAddress: musdAddr as string,
        musdTotalSupply: musdSupply as bigint,
        loading: false,
        error: null,
        deployed: true,
      })
    } catch (err) {
      setData({ ...DEFAULTS, loading: false, error: err instanceof Error ? err.message : 'RPC fetch failed', deployed: true })
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return data
}

export function formatBtc(amount: bigint): string {
  return (Number(amount) / 1e18).toFixed(6)
}
export function formatMusd(amount: bigint): string {
  return (Number(amount) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 0 })
}
export function formatBps(amount: bigint): string {
  return (Number(amount) / 100).toFixed(2)
}
