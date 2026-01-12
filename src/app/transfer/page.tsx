"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { isAddress, type Address } from "viem"
import { PixelButton } from "@/components/pixel-button"
import { PixelCard } from "@/components/pixel-card"
import { PixelInput } from "@/components/pixel-input"
import { DepositDialog } from "@/components/deposit-dialog"
import { TransferDialog } from "@/components/transfer-dialog"
import { DepositSelector } from "@/components/deposit-selector"
import { FloatingParticles } from "@/components/floating-particles"
import { useDepositNative, useInitiateTransfer } from "@/hooks/usePrivateTransfer"
import { formatBalance, formatBalanceDisplay } from "@/lib/format"

const INGRESS_ADDRESS = (process.env.NEXT_PUBLIC_INGRESS_ADDRESS || process.env.INGRESS_ADDRESS) as Address
const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL || "http://localhost:42069/graphql"

interface Deposit {
  depositId: string
  remainingAmount: string
  isNative: boolean
}

interface Transfer {
  transferId: string
  status: string
  initiatedAt: number
  initiatedTxHash: string
}

export default function TransferPage() {
  const { address, isConnected } = useAccount()
  const [depositOpen, setDepositOpen] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [depositId, setDepositId] = useState<string>("")
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [memo, setMemo] = useState("")

  const { deposit: depositNative, isPending: isDepositing, isSuccess: isDepositSuccess } = useDepositNative()
  const { initiateTransfer, hash, isPending: isTransferring, isConfirming: isTransferConfirming, isSuccess: isTransferSuccess, error: transferError } = useInitiateTransfer()
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([])
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false)

  // Open transfer dialog when transfer starts
  useEffect(() => {
    if (isTransferring || isTransferConfirming) {
      setTransferDialogOpen(true)
    }
  }, [isTransferring, isTransferConfirming])

  // Reset form after successful transfer (but keep dialog open)
  useEffect(() => {
    if (isTransferSuccess) {
      // Reset form fields but keep dialog open
      setRecipient("")
      setAmount("")
      setMemo("")
      // Don't reset depositId, keep it selected
      // Don't close dialog, let user close manually
    }
  }, [isTransferSuccess])

  // Refresh deposit selector after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      // Deposit selector will auto-refresh
      // No toast here to avoid noisy UX
    }
  }, [isDepositSuccess])

  // Fetch recent transfers from Ponder
  const fetchRecentTransfers = async () => {
    if (!address || !isConnected) {
      setRecentTransfers([])
      return
    }

    setIsLoadingTransfers(true)
    try {
      const query = `
        query GetUserSentTransfers($user: String!) {
          transfers(
            where: { sender: $user }
          ) {
            items {
              transferId
              status
              initiatedAt
              initiatedTxHash
            }
            totalCount
          }
        }
      `

      const response = await fetch(PONDER_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { user: address.toLowerCase() },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transfers: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL error")
      }

      const transfers = result.data?.transfers?.items || []
      // Sort by initiatedAt descending (newest first)
      const sortedTransfers = transfers
        .sort((a: Transfer, b: Transfer) => b.initiatedAt - a.initiatedAt)
      setRecentTransfers(sortedTransfers)
    } catch (error: any) {
      // Don't show error toast, just log it (Ponder might not be running)
      console.error("Failed to fetch transfers:", error)
      setRecentTransfers([])
    } finally {
      setIsLoadingTransfers(false)
    }
  }

  // Fetch transfers on mount and when address changes
  useEffect(() => {
    fetchRecentTransfers()
    // Refresh every 10 seconds
    const interval = setInterval(fetchRecentTransfers, 10000)
    return () => clearInterval(interval)
  }, [address, isConnected])

  // Refresh transfers after successful transfer
  useEffect(() => {
    if (isTransferSuccess) {
      // Small delay to allow Ponder to index the new transfer
      setTimeout(() => {
        fetchRecentTransfers()
      }, 2000)
    }
  }, [isTransferSuccess])

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`
    return `${Math.floor(diff / 2592000)} months ago`
  }

  const handleTransfer = async () => {
    if (!isConnected) {
      // Wallet not connected; rely on disabled button + connect UI
      return
    }
    if (!recipient || !isAddress(recipient)) {
      // Invalid recipient; rely on form validation UX
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      // Invalid amount; rely on form validation UX
      return
    }
    if (!depositId) {
      // No deposit selected; rely on disabled state
      return
    }

    try {
      await initiateTransfer(depositId as Address, recipient as Address, amount, undefined, memo)
      // Dialog will open automatically via useEffect
    } catch (error: any) {
      // Dialog will show error automatically
      console.error("Transfer error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0118] scanlines relative overflow-hidden">
      <FloatingParticles />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl text-glow-purple mb-1 sm:mb-2">PRIVATE TRANSFER</h2>
            <p className="text-muted text-[10px] sm:text-xs">Send funds anonymously</p>
          </div>

          {/* Balance Card */}
          <PixelCard className="bg-gradient-to-br from-primary/20 to-accent/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="text-muted text-[10px] sm:text-xs mb-1 sm:mb-2">YOUR BALANCE</div>
                {selectedDeposit ? (
                  <div className="text-xl sm:text-2xl md:text-3xl text-primary text-glow-purple truncate">
                    {formatBalance(selectedDeposit.remainingAmount)} MNT
                  </div>
                ) : (
                  <div className="text-sm sm:text-lg text-muted">Select a deposit</div>
                )}
              </div>
              <PixelButton variant="primary" onClick={() => setDepositOpen(true)} className="w-full sm:w-auto text-[10px] sm:text-xs">
                DEPOSIT
              </PixelButton>
            </div>
          </PixelCard>

          {/* Transfer Form */}
          <PixelCard>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs text-muted mb-2 sm:mb-3">RECIPIENT ADDRESS</label>
                <PixelInput value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
              </div>

              <DepositSelector
                value={depositId}
                onChange={setDepositId}
                onDepositSelect={(deposit) => {
                  setSelectedDeposit(deposit)
                  // Don't auto-fill amount, let user input manually
                }}
              />

              <div>
                <label className="block text-[10px] sm:text-xs text-muted mb-2 sm:mb-3">AMOUNT (MNT)</label>
                <PixelInput
                  type="number"
                  step="0.000000000000000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                  <PixelButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (selectedDeposit) {
                        const balance = parseFloat(formatBalanceDisplay(selectedDeposit.remainingAmount))
                        setAmount((balance * 0.25).toFixed(4))
                      }
                    }}
                    disabled={!selectedDeposit}
                    className="text-[10px] sm:text-xs"
                  >
                    25%
                  </PixelButton>
                  <PixelButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (selectedDeposit) {
                        const balance = parseFloat(formatBalanceDisplay(selectedDeposit.remainingAmount))
                        setAmount((balance * 0.5).toFixed(4))
                      }
                    }}
                    disabled={!selectedDeposit}
                    className="text-[10px] sm:text-xs"
                  >
                    50%
                  </PixelButton>
                  <PixelButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (selectedDeposit) {
                        const balance = parseFloat(formatBalanceDisplay(selectedDeposit.remainingAmount))
                        setAmount((balance * 0.75).toFixed(4))
                      }
                    }}
                    disabled={!selectedDeposit}
                    className="text-[10px] sm:text-xs"
                  >
                    75%
                  </PixelButton>
                  <PixelButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (selectedDeposit) {
                        setAmount(formatBalanceDisplay(selectedDeposit.remainingAmount))
                      }
                    }}
                    disabled={!selectedDeposit}
                    className="text-[10px] sm:text-xs"
                  >
                    MAX
                  </PixelButton>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-muted mb-2 sm:mb-3">MEMO (Optional)</label>
                <PixelInput
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Private message..."
                />
              </div>

              {/* Privacy Info */}
              <div className="border-4 border-accent/30 bg-accent/10 p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-accent text-base sm:text-xl flex-shrink-0">ℹ️</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-accent text-[10px] sm:text-xs mb-1 sm:mb-2">PRIVACY MODE</div>
                    <p className="text-muted text-[10px] sm:text-xs leading-relaxed">
                      This transfer will be processed through Oasis Sapphire, ensuring complete confidentiality.
                    </p>
                  </div>
                </div>
              </div>

              <PixelButton
                variant="primary"
                size="lg"
                className="w-full text-[10px] sm:text-xs"
                onClick={handleTransfer}
                disabled={!isConnected || !recipient || !amount || !depositId || isTransferring}
              >
                {isTransferring ? "PROCESSING..." : "SEND TRANSFER"}
              </PixelButton>
            </div>
          </PixelCard>

          {/* Transaction History */}
          <PixelCard>
            <h3 className="text-xs sm:text-sm text-primary mb-3 sm:mb-4">RECENT TRANSFERS</h3>
            {isLoadingTransfers ? (
              <div className="text-center py-3 sm:py-4">
                <div className="text-muted text-[10px] sm:text-xs">Loading transfers...</div>
              </div>
            ) : recentTransfers.length === 0 ? (
              <div className="text-center py-3 sm:py-4">
                <div className="text-muted text-[10px] sm:text-xs">No transfers yet</div>
              </div>
            ) : (
              <div className="max-h-[100px] sm:max-h-[120px] overflow-y-auto pr-1 sm:pr-2 scrollbar-hide">
                <div className="space-y-2 sm:space-y-3">
                  {recentTransfers.map((transfer, index) => (
                    <div
                      key={transfer.transferId}
                      className={`flex justify-between items-center text-[10px] sm:text-xs ${
                        index < recentTransfers.length - 1 ? "border-b-2 border-border pb-2 sm:pb-3" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://sepolia.mantlescan.xyz/tx/${transfer.initiatedTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-primary hover:underline truncate block text-[10px] sm:text-xs"
                        >
                          {transfer.initiatedTxHash.slice(0, 10)}...{transfer.initiatedTxHash.slice(-8)}
                        </a>
                        <div className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                          {formatTimeAgo(transfer.initiatedAt)}
                        </div>
                        {transfer.status && (
                          <div className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                            Status: {transfer.status}
                          </div>
                        )}
                      </div>
                      <div className="text-accent ml-2 sm:ml-4 flex-shrink-0">
                        <a
                          href={`https://sepolia.mantlescan.xyz/tx/${transfer.initiatedTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary text-[10px] sm:text-xs"
                        >
                          ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PixelCard>
        </div>
      </div>

      <DepositDialog open={depositOpen} onClose={() => setDepositOpen(false)} />
      
      <TransferDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false)
          // Reset form if transfer failed
          if (transferError) {
            // Keep form data for retry
          }
        }}
        recipient={recipient}
        amount={amount}
        depositId={depositId}
        hash={hash}
        isPending={isTransferring}
        isConfirming={isTransferConfirming}
        isSuccess={isTransferSuccess}
        error={transferError}
      />
    </div>
  )
}
