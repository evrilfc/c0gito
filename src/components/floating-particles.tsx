"use client"

import { useState, useEffect } from "react"

export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{
    left: number
    top: number
    animationDelay: number
    animationDuration: number
  }>>([])

  useEffect(() => {
    // Generate random values only on client-side after mount
    setParticles(
      [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 5 + Math.random() * 10,
      }))
    )
  }, [])

  // Return empty div during SSR and initial render
  if (particles.length === 0) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden" />
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
          }}
        />
      ))}
    </div>
  )
}
