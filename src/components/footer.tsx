import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t-4 border-[#2d1b4e] bg-[#1a0f2e]/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-primary text-sm mb-4 text-glow-purple">c0gito</h3>
            <p className="text-muted text-xs leading-relaxed mb-4">
              Private cryptocurrency transfers powered by Oasis Sapphire confidential computation.
            </p>
            <p className="text-muted text-xs">THINK. TRANSFER. VANISH.</p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="text-primary text-xs mb-4 uppercase">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted text-xs hover:text-primary transition-colors">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/transfer" className="text-muted text-xs hover:text-primary transition-colors">
                  TRANSFER
                </Link>
              </li>
              <li>
                <a
                  href="https://docs.mantle.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-xs hover:text-primary transition-colors"
                >
                  MANTLE DOCS
                </a>
              </li>
              <li>
                <a
                  href="https://docs.oasis.io/dapp/sapphire"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-xs hover:text-primary transition-colors"
                >
                  SAPPHIRE DOCS
                </a>
              </li>
            </ul>
          </div>

          {/* Technology Section */}
          <div>
            <h4 className="text-primary text-xs mb-4 uppercase">Powered By</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.mantle.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-xs hover:text-accent transition-colors"
                >
                  MANTLE
                </a>
              </li>
              <li>
                <a
                  href="https://sapphire.oasis.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-xs hover:text-accent transition-colors"
                >
                  OASIS SAPPHIRE
                </a>
              </li>
              <li>
                <a
                  href="https://www.hyperlane.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-xs hover:text-accent transition-colors"
                >
                  HYPERLANE
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-[#2d1b4e] pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <p className="text-muted text-[10px] sm:text-xs text-center sm:text-left">
              © 2026 c0gito. All rights reserved.
            </p>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-muted text-[10px] sm:text-xs">TESTNET</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-muted text-[10px] sm:text-xs">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

