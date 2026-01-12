"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CustomConnectButton } from "@/components/custom-connect-button"
import { PixelButton } from "@/components/pixel-button"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b-4 border-[#2d1b4e] bg-[#1a0f2e]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 hover:scale-105 transition-transform flex-shrink-0">
            <Image src="/c0gito.gif" alt="c0gito" width={32} height={32} className="sm:w-12 sm:h-12 animate-pulse" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl md:text-2xl text-[#b794f6] text-glow-purple truncate">c0gito</h1>
              <p className="text-[6px] sm:text-[8px] text-[#9d8bb4] mt-0.5 sm:mt-1 hidden sm:block">THINK. TRANSFER. VANISH.</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
            {pathname !== "/" && (
              <Link href="/">
                <PixelButton variant="secondary" className="text-[8px] sm:text-xs px-2 sm:px-3 py-1 sm:py-2">HOME</PixelButton>
              </Link>
            )}
            {pathname !== "/transfer" && (
              <Link href="/transfer">
                <PixelButton variant="secondary" className="text-[8px] sm:text-xs px-2 sm:px-3 py-1 sm:py-2">TRANSFER</PixelButton>
              </Link>
            )}
            {/* {pathname === "/" && (
              <a href="#faq">
                <PixelButton variant="secondary" className="text-[8px] sm:text-xs px-2 sm:px-3 py-1 sm:py-2">FAQ</PixelButton>
              </a>
            )} */}
            <CustomConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

