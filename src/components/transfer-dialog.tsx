"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { formatBalance } from "@/lib/format"
import type { Hex } from "viem"
import { PixelButton } from "./pixel-button"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  recipient: string
  amount: string
  depositId: string
  hash?: Hex
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error: Error | null
}

const MANTLE_EXPLORER = "https://sepolia.mantlescan.xyz/tx"

function getFriendlyErrorMessage(error: Error | null): string {
  if (!error) return "Something went wrong while sending your transfer."

  const msg = error.message || ""

  if (/user rejected|user denied|rejected the request|Request rejected/i.test(msg)) {
    return "Transaction was cancelled in your wallet."
  }

  if (/insufficient funds|insufficient balance/i.test(msg)) {
    return "Insufficient balance to complete this transfer."
  }

  if (/execution reverted/i.test(msg)) {
    return "The transaction was reverted by the contract. Please check your inputs and try again."
  }

  // Fallback: truncate very long messages so they don't fill the whole screen
  const cleaned = msg.replace(/\s+/g, " ").trim()
  if (cleaned.length > 220) {
    return cleaned.slice(0, 200) + "..."
  }

  return cleaned || "Unknown error occurred."
}

export function TransferDialog({
  open,
  onClose,
  recipient,
  amount,
  depositId,
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
}: TransferDialogProps) {
  const { address } = useAccount()

  if (!open) return null

  const getStatus = () => {
    if (error) return "failed"
    if (isSuccess) return "success"
    if (isConfirming) return "confirming"
    if (isPending) return "pending"
    return "idle"
  }

  const status = getStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop - don't allow closing by clicking backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
      />

      {/* Dialog - responsive */}
      <div
        className={cn(
          "relative bg-card border-4 border-primary p-4 sm:p-6 w-full max-w-md",
          "animate-slide-up pixel-glow-purple",
          "scanlines",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-primary text-sm sm:text-lg text-glow-purple mb-1 sm:mb-2">PRIVATE TRANSFER</h3>
            <p className="text-muted text-[10px] sm:text-xs">Processing your encrypted transfer</p>
          </div>
          {(status === "success" || status === "failed") && (
            <button onClick={onClose} className="text-muted hover:text-foreground text-xl sm:text-2xl leading-none w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
              ×
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Transfer Details */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-muted">Recipient:</span>
              <span className="text-foreground font-mono truncate ml-2">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-muted">Amount:</span>
              <span className="text-foreground">{amount} MNT</span>
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-muted">Deposit ID:</span>
              <span className="text-foreground font-mono truncate ml-2">{depositId.slice(0, 8)}...{depositId.slice(-6)}</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="border-4 border-border p-3 sm:p-4">
            {status === "pending" && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-primary text-[10px] sm:text-xs font-bold">SENDING TRANSACTION</div>
                  <div className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1">Waiting for wallet confirmation...</div>
                </div>
              </div>
            )}

            {status === "confirming" && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-accent border-t-transparent animate-spin flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-accent text-[10px] sm:text-xs font-bold">CONFIRMING</div>
                  <div className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1">Transaction submitted, waiting for confirmation...</div>
                  {hash && (
                    <a
                      href={`${MANTLE_EXPLORER}/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-[10px] sm:text-xs mt-1 sm:mt-2 flex items-center gap-1 hover:underline"
                    >
                      View on Explorer <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-background text-[8px] sm:text-xs">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-accent text-[10px] sm:text-xs font-bold">TRANSACTION CONFIRMED</div>
                  <div className="text-muted text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    Your encrypted transfer has been submitted to Mantle. It will now be processed on Oasis Sapphire. The recipient will receive funds shortly.
                  </div>
                  {hash && (
                    <a
                      href={`${MANTLE_EXPLORER}/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-[10px] sm:text-xs mt-1 sm:mt-2 flex items-center gap-1 hover:underline"
                    >
                      View Transaction <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-background text-[8px] sm:text-xs">✕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-destructive text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1">
                    TRANSFER FAILED
                  </div>
                  <div className="text-muted text-[10px] sm:text-xs leading-relaxed max-h-24 sm:max-h-32 overflow-y-auto pr-1 sm:pr-2 scrollbar-hide">
                    {getFriendlyErrorMessage(error)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          {(status === "pending" || status === "confirming") && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-muted text-[10px] sm:text-xs font-bold">PROGRESS</div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className={cn("flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs", status === "pending" || status === "confirming" ? "text-accent" : "text-muted")}>
                  <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 border-2 flex-shrink-0", status === "pending" || status === "confirming" ? "border-accent bg-accent" : "border-muted")} />
                  <span>Encrypting payload</span>
                </div>
                <div className={cn("flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs", status === "confirming" ? "text-accent" : "text-muted")}>
                  <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 border-2 flex-shrink-0", status === "confirming" ? "border-accent bg-accent" : "border-muted")} />
                  <span>Submitting to Mantle</span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Info
          {status === "success" && (
            <div className="border-4 border-accent/30 bg-accent/10 p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-accent text-base sm:text-xl flex-shrink-0">🔒</div>
                <div className="min-w-0 flex-1">
                  <div className="text-accent text-[10px] sm:text-xs mb-1 sm:mb-2">PRIVACY PROTECTED</div>
                  <p className="text-muted text-[10px] sm:text-xs leading-relaxed">
                    Your transfer details are encrypted and will be processed on Oasis Sapphire. Only the encrypted hash is visible on Mantle. The recipient will receive funds after confidential processing completes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {status !== "success" && (
            <div className="border-4 border-primary/30 bg-primary/10 p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-primary text-base sm:text-xl flex-shrink-0">ℹ️</div>
                <div className="min-w-0 flex-1">
                  <div className="text-primary text-[10px] sm:text-xs mb-1 sm:mb-2">INFO</div>
                  <p className="text-muted text-[10px] sm:text-xs leading-relaxed">
                    Your transfer will be encrypted and processed through Oasis Sapphire for complete privacy.
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            {status === "failed" && (
              <>
                <PixelButton variant="secondary" className="flex-1 text-[10px] sm:text-xs" onClick={onClose}>
                  CLOSE
                </PixelButton>
                <PixelButton variant="primary" className="flex-1 text-[10px] sm:text-xs" onClick={onClose}>
                  TRY AGAIN
                </PixelButton>
              </>
            )}
            {status === "success" && (
              <PixelButton variant="primary" className="flex-1 text-[10px] sm:text-xs" onClick={onClose}>
                CLOSE
              </PixelButton>
            )}
            {(status === "pending" || status === "confirming") && (
              <PixelButton variant="secondary" className="flex-1 text-[10px] sm:text-xs" onClick={onClose} disabled>
                {status === "pending" ? "WAITING..." : "PROCESSING..."}
              </PixelButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

