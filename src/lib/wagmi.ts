import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { defineChain } from "viem"

// Mantle Sepolia Testnet
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Mantle",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantlescan",
      url: "https://sepolia.mantlescan.xyz",
    },
  },
  testnet: true,
})

// Oasis Sapphire Testnet
export const sapphireTestnet = defineChain({
  id: 23295,
  name: "Sapphire Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "TEST",
    symbol: "TEST",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.sapphire.oasis.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Oasis Explorer",
      url: "https://explorer.oasis.io/testnet/sapphire",
    },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: "c0gito",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mantleSepolia, sapphireTestnet],
  ssr: true,
})

