"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Lock, Rabbit, Glasses, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { PixelButton } from "@/components/pixel-button"
import { PixelCard } from "@/components/pixel-card"
import { FloatingParticles } from "@/components/floating-particles"

const faqs = [
  {
    question: "What is c0gito?",
    answer: "c0gito is a privacy-preserving cross-chain transfer protocol built on Mantle Network and Oasis Sapphire. It enables users to transfer cryptocurrency with complete privacy, hiding recipient addresses, amounts, and memos from public view.",
  },
  {
    question: "How does it work?",
    answer: "When you initiate a transfer, your transaction details (receiver, amount, memo) are encrypted using X25519DeoxysII encryption and sent to Oasis Sapphire's Trusted Execution Environment (TEE). The encrypted data is decrypted privately in the TEE, and the release instruction is sent back to Mantle via Hyperlane, ensuring your transaction details remain confidential throughout the process.",
  },
  {
    question: "Is it really private?",
    answer: "Yes! Your transfer details are encrypted before being sent on-chain. Only the encrypted payload is visible on Mantle. The actual recipient, amount, and memo are decrypted inside Oasis Sapphire's confidential TEE, which is isolated from the public blockchain.",
  },
  {
    question: "What chains are supported?",
    answer: "Currently, c0gito supports private transfers only on Mantle Sepolia (testnet). The protocol uses Hyperlane for secure cross-chain messaging between Mantle Sepolia and Oasis Sapphire, allowing for future expansion to additional chains.",
  },
  {
    question: "What tokens are supported?",
    answer: "Currently, the frontend supports native MNT (Mantle token) transfers. However, the smart contracts support ERC20 tokens. Additional token support will be added in future updates.",
  },
  {
    question: "How much does it cost?",
    answer: "Transfer fees depend on gas costs on both Mantle and Sapphire networks. Since c0gito operates on testnets, you'll need testnet tokens. The service itself doesn't charge any additional fees beyond network gas costs.",
  },
  {
    question: "How long does a transfer take?",
    answer: "Transfers typically complete within a few minutes. The process involves: (1) Submitting the encrypted transfer to Mantle, (2) Hyperlane relaying the message to Sapphire, (3) Decryption and processing in Sapphire's TEE, and (4) Sending the release instruction back to Mantle. The automated service monitors and processes transfers continuously.",
  },
  {
    question: "Is it safe?",
    answer: "c0gito uses battle-tested cryptographic primitives (X25519DeoxysII) and leverages Oasis Sapphire's Trusted Execution Environment, which provides hardware-level security guarantees. The smart contracts follow best practices and are designed with security in mind. However, as this is a testnet deployment, always exercise caution with testnet funds.",
  },
]

// Helper function to format answer with numbered items
const formatAnswer = (answer: string): string | React.ReactNode[] => {
  // Check if answer contains numbered items like (1), (2), etc.
  const numberedPattern = /\((\d+)\)/g
  if (numberedPattern.test(answer)) {
    // Split by numbered items and format
    const parts = answer.split(/(\(\d+\))/g)
    const formatted: React.ReactNode[] = []
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.match(/^\(\d+\)$/)) {
        // This is a number, add line break before it (except first)
        if (i > 0) {
          formatted.push(<br key={`br-${i}`} />)
        }
        formatted.push(<span key={i} className="text-primary font-bold">{part} </span>)
      } else if (part.trim()) {
        formatted.push(part)
      }
    }
    return formatted
  }
  return answer
}

export default function HomePage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0) // First item expanded by default

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#0a0118] scanlines relative overflow-hidden">
      <FloatingParticles />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block animate-float">
            <Image src="/c0gito.gif" alt="c0gito logo" width={120} height={120} className="mx-auto" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl text-[#b794f6] text-glow-purple leading-relaxed">c0gito</h2>
            <p className="text-xl md:text-2xl text-[#f093fb] text-glow-pink">THINK. TRANSFER. VANISH.</p>
            <p className="text-lg md:text-xl text-[#4facfe] text-glow-cyan">INCOGNITO MODE ON MANTLE</p>
          </div>

          <p className="text-[#9d8bb4] text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
            Transfer cryptocurrency with complete privacy using Oasis Sapphire confidential computation. Your
            transactions, your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/transfer">
              <PixelButton variant="primary" size="lg">
                START TRANSFER
              </PixelButton>
            </Link>
            <a href="#faq">
              <PixelButton variant="secondary" size="lg">
                FAQ
              </PixelButton>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24">
          <PixelCard>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-primary text-sm md:text-base">CONFIDENTIAL</h3>
              <p className="text-muted text-xs leading-relaxed">Powered by Oasis Sapphire for secure computation</p>
            </div>
          </PixelCard>

          <PixelCard>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Rabbit className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-accent text-sm md:text-base">FAST</h3>
              <p className="text-muted text-xs leading-relaxed">Powered by Hyperlane for Cross Chain Communication</p>
            </div>
          </PixelCard>

          <PixelCard>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Glasses className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-secondary text-sm md:text-base">PRIVATE</h3>
              <p className="text-muted text-xs leading-relaxed">Your transactions remain completely anonymous</p>
            </div>
          </PixelCard>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 scroll-mt-8 px-2 sm:px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary text-glow-purple">
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
            <p className="text-muted text-[10px] sm:text-xs md:text-sm">Everything you need to know about c0gito</p>
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => {
              const isExpanded = expandedIndex === index
              const formattedAnswer = formatAnswer(faq.answer)
              return (
                <PixelCard key={index} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-2 sm:p-3 md:p-4"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
                      <h3 className="text-primary text-xs sm:text-sm md:text-base font-bold flex-1 leading-tight sm:leading-normal">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4 mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t-2 border-border">
                      <div className="text-muted text-[10px] sm:text-xs md:text-sm leading-relaxed">
                        {formattedAnswer}
                      </div>
                    </div>
                  )}
                </PixelCard>
              )
            })}
          </div>
        </div>
        </div>

    </div>
  )
}
