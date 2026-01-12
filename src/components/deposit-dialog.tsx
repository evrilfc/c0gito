"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { PixelButton } from "./pixel-button"
import { PixelInput } from "./pixel-input"
import { cn } from "@/lib/utils"
import { useDepositNative } from "@/hooks/usePrivateTransfer"
import { toast } from "sonner"
import { formatEther } from "viem"

interface DepositDialogProps {
  open: boolean
  onClose: () => void
  onDepositSuccess?: (depositId: string) => void
}

const INGRESS_ADDRESS = (process.env.NEXT_PUBLIC_INGRESS_ADDRESS || process.env.INGRESS_ADDRESS)

const DEPOSIT_TOAST_ID = "deposit-status"

function showDepositToast(type: "success" | "error", message: string) {
  // Always replace previous deposit toast so only one is visible
  toast.dismiss(DEPOSIT_TOAST_ID)

  const commonOptions = {
    id: DEPOSIT_TOAST_ID,
    duration: 8000,
    dismissible: true,
  } as const

  if (type === "success") {
    toast.success(message, commonOptions)
  } else {
    toast.error(message, commonOptions)
  }
}

export function DepositDialog({ open, onClose, onDepositSuccess }: DepositDialogProps) {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const { deposit, hash, isPending, isConfirming, isSuccess, error } = useDepositNative()

  // Reset on close
  useEffect(() => {
    if (!open) {
      setAmount("")
    }
  }, [open])

  // Handle success
  useEffect(() => {
    if (isSuccess && hash) {
      showDepositToast("success", "Deposit successful!")
      // TODO: Extract depositId from transaction receipt events
      // For now, user needs to check transaction manually
      onClose()
    }
  }, [isSuccess, hash, onClose])

  // Handle error
  useEffect(() => {
    if (error) {
      showDepositToast("error", error.message || "Deposit failed")
    }
  }, [error])

  const handleDeposit = async () => {
    if (!isConnected) {
      showDepositToast("error", "Please connect your wallet")
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      showDepositToast("error", "Please enter a valid amount")
      return
    }

    try {
      await deposit(amount)
    } catch (err: any) {
      showDepositToast("error", err?.message || "Failed to deposit")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop - transparent */}
      <div 
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={onClose}
        style={{ backdropFilter: 'none' }}
      />
      
      {/* Dialog - centered, transparent */}
      <div
        className={cn(
          "relative w-full max-w-sm bg-card/90 border-4 border-primary",
          "p-4 sm:p-6 animate-slide-up pixel-glow-purple pointer-events-auto",
          "scanlines",
        )}
        style={{ backdropFilter: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-primary text-sm sm:text-lg text-glow-purple mb-1 sm:mb-2">DEPOSIT</h3>
            <p className="text-muted text-[10px] sm:text-xs">Add MNT to your private balance</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground text-xl sm:text-2xl leading-none w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-muted hover:border-primary transition-colors flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Info */}
          {!isConnected && (
            <div className="border-4 border-accent/30 bg-accent/10 p-3 sm:p-4">
              <div className="text-accent text-[10px] sm:text-xs">Please connect your wallet to deposit</div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-[10px] sm:text-xs text-muted mb-2 sm:mb-3">AMOUNT (MNT)</label>
            <PixelInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
              <PixelButton size="sm" variant="secondary" onClick={() => setAmount("1.0")} className="text-[10px] sm:text-xs">
                1.0
              </PixelButton>
              <PixelButton size="sm" variant="secondary" onClick={() => setAmount("5.0")} className="text-[10px] sm:text-xs">
                5.0
              </PixelButton>
              <PixelButton size="sm" variant="secondary" onClick={() => setAmount("10.0")} className="text-[10px] sm:text-xs">
                10.0
              </PixelButton>
            </div>
          </div>

          {/* Info Box */}
          {/* <div className="border-4 border-primary/30 bg-primary/10 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-primary text-base sm:text-xl flex-shrink-0">ℹ️</div>
              <div className="min-w-0 flex-1">
                <div className="text-primary text-[10px] sm:text-xs mb-1 sm:mb-2">INFO</div>
                <p className="text-muted text-[10px] sm:text-xs leading-relaxed">
                  Deposit MNT to the Ingress contract. You'll receive a deposit ID that you can use for transfers.
                  {isConfirming && (
                    <span className="block mt-1 sm:mt-2 text-accent">Confirming transaction...</span>
                  )}
                </p>
              </div>
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <PixelButton
              variant="primary"
              className="flex-1 text-[10px] sm:text-xs"
              onClick={handleDeposit}
              disabled={!isConnected || !amount || isPending || isConfirming}
            >
              {isPending ? "SENDING..." : isConfirming ? "CONFIRMING..." : "DEPOSIT"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}
