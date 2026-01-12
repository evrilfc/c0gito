"use client"

import { useState, useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { formatBalance, formatBalanceDisplay } from "@/lib/format"

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL || "http://localhost:42069/graphql"

interface Deposit {
  depositId: string
  depositor: string
  token: string
  initialAmount: string
  remainingAmount: string
  isNative: boolean
  released: boolean
}

interface DepositSelectorProps {
  value: string
  onChange: (depositId: string) => void
  onDepositSelect?: (deposit: Deposit | null) => void
}

export function DepositSelector({ value, onChange, onDepositSelect }: DepositSelectorProps) {
  const { address, isConnected } = useAccount()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  // Fetch deposits from Ponder
  const fetchDeposits = async () => {
    if (!address || !isConnected) {
      setDeposits([])
      return
    }

    setIsLoading(true)
    try {
      const query = `
        query GetUserDeposits($user: String!) {
          deposits(
            where: { depositor: $user }
            limit: 100
          ) {
            items {
              depositId
              depositor
              token
              initialAmount
              remainingAmount
              isNative
              released
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
        throw new Error(`Failed to fetch deposits: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL error")
      }

      const allItems = result.data?.deposits?.items || []
      const userAddressLower = address?.toLowerCase()
      
      // Filter: only active deposits (not released and has remaining amount)
      const depositItems = allItems.filter((d: Deposit) => {
        const notReleased = !d.released
        const hasRemaining = BigInt(d.remainingAmount) > BigInt(0)
        const matchesUser = d.depositor?.toLowerCase() === userAddressLower
        return notReleased && hasRemaining && matchesUser
      })
      
      setDeposits(depositItems)

      // Auto-select first deposit if available and no value set
      if (depositItems.length > 0 && !value) {
        const firstDeposit = depositItems[0]
        onChange(firstDeposit.depositId)
        setSelectedDeposit(firstDeposit)
        onDepositSelect?.(firstDeposit)
      }
    } catch (error: any) {
      // Silently fail if Ponder is not running
      setDeposits([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address && isConnected) {
      fetchDeposits()
      // Refresh every 10 seconds
      const interval = setInterval(fetchDeposits, 10000)
      return () => clearInterval(interval)
    } else {
      setDeposits([])
      setSelectedDeposit(null)
    }
  }, [address, isConnected])

  // Find selected deposit
  useEffect(() => {
    if (value && deposits.length > 0) {
      const deposit = deposits.find((d) => d.depositId.toLowerCase() === value.toLowerCase())
      setSelectedDeposit(deposit || null)
      onDepositSelect?.(deposit || null)
    } else {
      setSelectedDeposit(null)
      onDepositSelect?.(null)
    }
  }, [value, deposits, onDepositSelect])

  const handleSelect = (deposit: Deposit) => {
    onChange(deposit.depositId)
    setSelectedDeposit(deposit)
    onDepositSelect?.(deposit)
    setShowDropdown(false)
  }

  if (!isConnected) {
    return (
      <div>
        <label className="block text-xs text-muted mb-3">DEPOSIT ID</label>
        <div className="border-4 border-border bg-background p-4 text-center">
          <p className="text-muted text-xs">Connect wallet to view deposits</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="block text-[10px] sm:text-xs text-muted mb-2 sm:mb-3">DEPOSIT ID</label>
      
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => deposits.length > 0 && setShowDropdown(!showDropdown)}
        disabled={deposits.length === 0}
        className="w-full bg-background border-4 border-border px-3 sm:px-4 py-2 sm:py-3 text-left text-foreground text-[10px] sm:text-xs focus:border-primary focus:outline-none focus:pixel-glow-purple flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate flex-1">
          {selectedDeposit
            ? `${selectedDeposit.depositId.slice(0, 8)}...${selectedDeposit.depositId.slice(-6)}`
            : deposits.length > 0
            ? "Select a deposit..."
            : isLoading
            ? "Loading deposits..."
            : "No deposits available"}
        </span>
        {deposits.length > 0 && <span className="ml-2 text-[10px] sm:text-xs">{showDropdown ? "▲" : "▼"}</span>}
      </button>

      {showDropdown && deposits.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 sm:mt-2 border-4 border-primary bg-card max-h-48 sm:max-h-60 overflow-y-auto"
        >
          {deposits.map((deposit) => {
            const isSelected = deposit.depositId.toLowerCase() === value.toLowerCase()
            
            return (
              <button
                key={deposit.depositId}
                onClick={() => handleSelect(deposit)}
                className={`w-full text-left p-2 sm:p-3 border-b-2 border-border hover:bg-primary/10 ${
                  isSelected ? "bg-primary/20" : ""
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-xs text-foreground truncate">
                      {deposit.depositId.slice(0, 8)}...{deposit.depositId.slice(-6)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">
                      {formatBalance(deposit.remainingAmount)} MNT remaining
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-primary text-[10px] sm:text-xs ml-1 sm:ml-2 flex-shrink-0">✓</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isLoading && (
        <p className="text-muted text-[10px] sm:text-xs mt-1">Loading deposits...</p>
      )}

      {!isLoading && deposits.length === 0 && isConnected && (
        <p className="text-muted text-[10px] sm:text-xs mt-1">
          No active deposits found. Deposit funds first.
        </p>
      )}

      {selectedDeposit && (
        <div className="mt-2 border-4 border-accent/30 bg-accent/10 p-2">
          <div className="text-[10px] sm:text-xs text-accent">
            Selected: {formatBalance(selectedDeposit.remainingAmount)} MNT available
          </div>
        </div>
      )}
    </div>
  )
}

