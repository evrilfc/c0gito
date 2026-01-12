"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { PixelButton } from "@/components/pixel-button"
import { cn } from "@/lib/utils"

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <PixelButton variant="primary" onClick={openConnectModal} type="button">
                    CONNECT
                  </PixelButton>
                )
              }

              if (chain.unsupported) {
                return (
                  <PixelButton variant="accent" onClick={openChainModal} type="button">
                    WRONG NETWORK
                  </PixelButton>
                )
              }

              return (
                  <PixelButton variant="primary" onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ""}
                  </PixelButton>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

