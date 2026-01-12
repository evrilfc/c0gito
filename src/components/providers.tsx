"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { config } from "@/lib/wagmi"
import "@rainbow-me/rainbowkit/styles.css"
import { useState } from "react"
import merge from "lodash.merge"
import type { Theme } from "@rainbow-me/rainbowkit"

// Custom theme matching the cyber purple pixel aesthetic
const customTheme = merge(darkTheme(), {
  colors: {
    accentColor: "#b794f6", // Primary purple
    accentColorForeground: "#0a0118", // Dark background
    connectButtonBackground: "#1a0f2e", // Card background
    connectButtonBackgroundError: "#0a0118",
    connectButtonInnerBackground: "#1a0f2e",
    connectButtonText: "#e8e1f5", // Foreground text
    connectButtonTextError: "#e8e1f5",
    connectionIndicator: "#4facfe", // Accent cyan
    error: "oklch(0.577 0.245 27.325)",
    generalBorder: "#2d1b4e", // Border color
    generalBorderDim: "#1a0f2e",
    menuItemBackground: "#1a0f2e",
    modalBackdrop: "rgba(10, 1, 24, 0.8)",
    modalBackground: "#1a0f2e",
    modalBorder: "#2d1b4e",
    modalText: "#e8e1f5",
    modalTextDim: "#9d8bb4", // Muted color
    modalTextSecondary: "#9d8bb4",
    profileAction: "#1a0f2e",
    profileActionHover: "#2d1b4e",
    profileForeground: "#1a0f2e",
    selectedOptionBorder: "#b794f6",
    standby: "#9d8bb4",
  },
  radii: {
    actionButton: "0px", // Pixel style - no border radius
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px",
  },
  fonts: {
    body: '"Press Start 2P", "Courier New", monospace',
  },
} as Theme)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

