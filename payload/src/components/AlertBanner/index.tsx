'use client'

import React from 'react'
import Link from 'next/link'

interface AlertBannerProps {
  enabled?: boolean | null
  text?: string | null
  link?: string | null
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ enabled, text, link }) => {
  if (!enabled || !text) return null

  const content = (
    <div className="bg-[#00de6c] w-full overflow-hidden py-1.5 shadow-[0px_0px_44px_0px_rgba(0,0,0,0.13)] relative">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Duplicate the text enough times to fill the screen and loop seamlessly */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="font-sans text-[20px] leading-[23px] text-black text-center mx-10"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
