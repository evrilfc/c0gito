import { formatEther } from "viem"

/**
 * Format balance dengan smart formatting (K, M untuk besar)
 * Menggunakan format yang lebih readable
 */
export function formatBalance(value: string | bigint, decimals: number = 18): string {
  let num: number
  
  if (typeof value === "bigint") {
    num = parseFloat(formatEther(value))
  } else if (typeof value === "string") {
    // Jika string, parse sebagai wei (dengan decimals)
    num = parseFloat(formatEther(BigInt(value)))
  } else {
    num = value
  }
  
  if (isNaN(num) || num === 0) return "0.00"
  
  // Jika terlalu kecil, tampilkan dengan lebih banyak decimals
  if (num < 0.01) {
    return num.toFixed(6)
  }
  
  // Jika besar, gunakan K/M suffix
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  
  // Format normal dengan 2 decimals untuk angka >= 1
  if (num >= 1) {
    return num.toFixed(2)
  }
  
  // Untuk angka < 1, tampilkan 4 decimals
  return num.toFixed(4)
}

/**
 * Format balance untuk display (dengan thousand separator, tanpa K/M)
 */
export function formatBalanceDisplay(value: string | bigint, decimals: number = 18): string {
  let num: number
  
  if (typeof value === "bigint") {
    num = parseFloat(formatEther(value))
  } else if (typeof value === "string") {
    // Parse string sebagai wei
    num = parseFloat(formatEther(BigInt(value)))
  } else {
    num = value
  }
  
  if (isNaN(num) || num === 0) return "0.00"
  
  // Format dengan thousand separator, max 4 decimals
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num)
}

