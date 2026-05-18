'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative flex flex-col items-center justify-end text-white rounded-b-[32px] overflow-hidden min-h-[620px] lg:h-[800px] px-4 py-20 lg:py-20 -mt-[92px] lg:-mt-[120px]"
      data-theme="dark"
    >
      {/* Background media */}
      <div className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-[220px] w-full max-w-[1070px]">
        {/* Spacer pushes content down */}
        <div className="flex-1" />

        {/* Hero text */}
        {richText && (
          <RichText
            className="text-center capitalize font-sans text-[40px] leading-[48px] lg:text-[64px] lg:leading-[72px] text-white [text-shadow:0px_0px_10px_rgba(0,0,0,0.35)] [&_p]:m-0 [&_h1]:font-normal [&_h1]:text-[40px] [&_h1]:leading-[48px] lg:[&_h1]:text-[64px] lg:[&_h1]:leading-[72px]"
            data={richText}
            enableGutter={false}
          />
        )}

        {/* CTA button */}
        {Array.isArray(links) && links.length > 0 && (
          <div className="flex justify-center">
            {links.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance={'default'}
                className="bg-black text-white whitespace-nowrap hover:bg-black/80 transition-colors"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
