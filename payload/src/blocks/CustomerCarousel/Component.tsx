'use client'

import React, { useRef, useState, useEffect } from 'react'
import type { CustomerCarouselBlock as CustomerCarouselBlockProps } from '@/payload-types'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

export const CustomerCarouselBlockComponent: React.FC<CustomerCarouselBlockProps> = ({
  title,
  logos,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)
  // Start with 2 as a safe default for SSR
  const [repeatCount, setRepeatCount] = useState(2)

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !setRef.current) return

      const containerW = containerRef.current.offsetWidth
      const setW = setRef.current.offsetWidth

      if (setW > 0) {
        // We need the logos to cover the screen PLUS one extra set
        // to slide into view while the first one slides out.
        const needed = Math.ceil(containerW / setW) + 1
        setRepeatCount(Math.max(2, needed))
      }
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [logos])

  if (!logos || logos.length === 0) return null

  return (
    <section className="w-full bg-black py-12 overflow-hidden">
      {title && (
        <h2 className="mb-8 text-center text-white font-sans capitalize text-[24px] md:text-[32px]">
          {title}
        </h2>
      )}

      <div
        ref={containerRef}
        className="relative flex overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <div
          className="flex w-max items-center animate-carousel-scroll"
          style={{ '--repeat-count': repeatCount } as React.CSSProperties}
        >
          {Array.from({ length: repeatCount }).map((_, setIndex) => (
            <div
              key={setIndex}
              ref={setIndex === 0 ? setRef : undefined}
              className="flex shrink-0  gap-12 px-6" // Use padding for consistent spacing between sets
              aria-hidden={setIndex > 0 || undefined}
            >
              {logos.map((logo, i) => {
                const image = logo.image as MediaType | undefined
                if (!image) return null

                return (
                  <div key={i} className="flex shrink-0 justify-center">
                    {logo.link ? (
                      <a
                        href={logo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-70"
                      >
                        <Media
                          resource={image}
                          imgClassName="h-10 w-auto max-w-[140px] object-contain"
                        />
                      </a>
                    ) : (
                      <Media
                        resource={image}
                        imgClassName="h-10 w-auto max-w-[140px] object-contain"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
