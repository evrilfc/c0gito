import { createConfig } from "ponder";

import { PrivateTransferIngressAbi } from "./abis/PrivateTransferIngress";
import { PrivateTransferVaultAbi } from "./abis/PrivateTransferVault";

export default createConfig({
  chains: {
    mantleSepolia: {
      id: 5003,
      rpc: process.env.PONDER_RPC_URL_MANTLE_SEPOLIA || process.env.MANTLE_SEPOLIA_RPC || "https://rpc.sepolia.mantle.xyz",
      ethGetLogsBlockRange: 100,
    },
    sapphireTestnet: {
      id: 23295,
      rpc: process.env.PONDER_RPC_URL_SAPPHIRE_TESTNET || process.env.SAPPHIRE_TESTNET_RPC || "https://oasis-sapphire-testnet.core.chainstack.com/2e3442bd8c763c2666d4fb5a93f27d2c",
      ethGetLogsBlockRange: 100,
    },
  },
  contracts: {
    PrivateTransferIngress: {
      chain: "mantleSepolia",
      abi: PrivateTransferIngressAbi,
      address: (process.env.NEXT_PUBLIC_INGRESS_ADDRESS || process.env.INGRESS_ADDRESS || "0xEE5F31d28F08a011f638fd2b82CCbcb5ce04ab48") as `0x${string}`,
      startBlock: 32813577, // TODO: Set to actual deployment block
    },
    PrivateTransferVault: {
      chain: "sapphireTestnet",
      abi: PrivateTransferVaultAbi,
      address: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || process.env.VAULT_ADDRESS || "0x418A949474971a1947d932f856FB3eAA695BDdE5") as `0x${string}`,
      startBlock: 15058508, // TODO: Set to actual deployment block
    },
  },
});