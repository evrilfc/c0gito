"use client"

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther, parseUnits, hexToBytes, type Address, type Hex } from "viem"
import { PrivateTransferIngressAbi } from "@/lib/abis/PrivateTransferIngress"
import { encryptTransferPayload, encodeEnvelope } from "@/lib/encryption"
import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"

const INGRESS_ADDRESS = (process.env.NEXT_PUBLIC_INGRESS_ADDRESS || process.env.INGRESS_ADDRESS) as Address
const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS || process.env.VAULT_ADDRESS) as Address
const VAULT_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY || process.env.VAULT_PUBLIC_KEY) as Hex
const SAPPHIRE_DOMAIN = 23295

/**
 * Hook untuk deposit native MNT
 */
export function useDepositNative() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const deposit = useCallback(
    async (amount: string) => {
      try {
        const amountWei = parseEther(amount)
        await writeContract({
          address: INGRESS_ADDRESS,
          abi: PrivateTransferIngressAbi,
          functionName: "depositNative",
          value: amountWei,
        })
      } catch (err) {
        console.error("Deposit error:", err)
        throw err
      }
    },
    [writeContract]
  )

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook untuk deposit ERC20
 */
export function useDepositErc20() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const deposit = useCallback(
    async (tokenAddress: Address, amount: string, decimals: number = 6) => {
      try {
        const amountWei = parseUnits(amount, decimals)
        await writeContract({
          address: INGRESS_ADDRESS,
          abi: PrivateTransferIngressAbi,
          functionName: "depositErc20",
          args: [tokenAddress, amountWei],
        })
      } catch (err) {
        console.error("Deposit ERC20 error:", err)
        throw err
      }
    },
    [writeContract]
  )

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook untuk initiate private transfer
 */
export function useInitiateTransfer() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const [transferId, setTransferId] = useState<Hex | null>(null)

  // Extract transferId from transaction receipt
  useEffect(() => {
    if (isSuccess && hash) {
      // TODO: Query contract untuk get transferId dari encryptedDataHash
      // Atau parse dari transaction receipt events
    }
  }, [isSuccess, hash])

  const initiateTransfer = useCallback(
    async (depositId: Hex, receiver: Address, amount: string, tokenAddress?: Address, memo: string = "") => {
      if (!VAULT_PUBLIC_KEY) {
        throw new Error("Vault public key not configured. Please set NEXT_PUBLIC_VAULT_PUBLIC_KEY env var.")
      }
      if (!address) {
        throw new Error("Wallet not connected")
      }

      try {
        // Parse amount sesuai referensi
        // Decimals: 18 for native, 6 for ERC20 (sesuai referensi)
        const decimals = tokenAddress ? 6 : 18
        const amountWei = parseUnits(amount, decimals)

        if (amountWei === BigInt(0)) {
          throw new Error("Amount must be greater than zero")
        }

        // Create payload sesuai referensi
        // token: isNative ? ethers.ZeroAddress : tokenAddress
        // memo: ethers.toUtf8Bytes(memo) -> TextEncoder().encode(memo)
        const payload = {
          receiver,
          token: tokenAddress || ("0x0000000000000000000000000000000000000000" as Address),
          amount: amountWei,
          isNative: !tokenAddress,
          memo: new TextEncoder().encode(memo), // ethers.toUtf8Bytes(memo)
        }

        // Encrypt payload sesuai referensi
        // Menggunakan vault public key dari environment variable
        const envelope = encryptTransferPayload(VAULT_PUBLIC_KEY, payload)

        // Encode envelope sebagai ABI tuple (sesuai ReferensiService.md line 226-229)
        // Format: tuple(bytes32 senderPublicKey, bytes16 nonce, bytes ciphertext)
        const encodedEnvelope = encodeEnvelope(envelope)

        // Sesuai referensi line 248: const envelopeBytes = ethers.getBytes(encodedEnvelope);
        // Sesuai referensi line 357: contract.initiateTransfer(..., ethers.getBytes(encodedEnvelope))
        // Di viem/wagmi: untuk parameter bytes, kita pass Hex string langsung
        // encodedEnvelope sudah Hex string dari encodeEnvelope(), jadi langsung pass
        // Contract expect: bytes calldata ciphertext
        await writeContract({
          address: INGRESS_ADDRESS,
          abi: PrivateTransferIngressAbi,
          functionName: "initiateTransfer",
          args: [SAPPHIRE_DOMAIN, depositId, encodedEnvelope],
        })

        toast.success("Transfer initiated! Processing on Sapphire...")
      } catch (err: any) {
        console.error("Initiate transfer error:", err)
        toast.error(err?.message || "Failed to initiate transfer")
        throw err
      }
    },
    [address, writeContract]
  )

  return {
    initiateTransfer,
    hash,
    transferId,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook untuk get deposit info by depositId
 */
export function useDeposit(depositId: Hex | undefined) {
  const { data: deposit, isLoading, error } = useReadContract({
    address: INGRESS_ADDRESS,
    abi: PrivateTransferIngressAbi,
    functionName: "deposits",
    args: depositId ? [depositId] : undefined,
    query: {
      enabled: !!depositId,
    },
  })

  return {
    deposit,
    isLoading,
    error,
  }
}

