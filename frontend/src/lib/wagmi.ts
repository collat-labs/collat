import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

const mezoTestnet = defineChain({
  id: 31611,
  name: 'Mezo Matsnet',
  nativeCurrency: { name: 'BTC', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.test.mezo.org'] },
  },
  blockExplorers: {
    default: { name: 'Mezo Explorer', url: 'https://explorer.test.mezo.org' },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: 'Collat',
  projectId: 'collat-mezo-app',
  chains: [mezoTestnet],
})
