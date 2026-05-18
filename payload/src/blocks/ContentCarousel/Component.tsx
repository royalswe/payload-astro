'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

import type { ContentCarouselBlock as ContentCarouselBlockProps } from '@/payload-types'
import type { Media as MediaType } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_GAP = 24 // px — matches `gap-6` (6 × 4 = 24)

// ─── Types ────────────────────────────────────────────────────────────────────

type CarouselItem = NonNullable<ContentCarouselBlockProps['items']>[number]

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Returns the width of the first [data-carousel-card] child in `ref`, updating
 * on window resize.
 */
function useCardWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [cardWidth, setCardWidth] = useState(0)

  useEffect(() => {
    const measure = () => {
      const card = ref.current?.querySelector('[data-carousel-card]') as HTMLElement | null
      setCardWidth(card?.offsetWidth ?? 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ref])

  return cardWidth
}

/**
 * Tracks which card index is currently scrolled to the left edge of `ref`.
 */
function useActiveIndex(
  ref: React.RefObject<HTMLDivElement | null>,
  cardWidth: number,
  count: number,
): number {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || cardWidth === 0) return

    const onScroll = () => {
      const index = Math.round(el.scrollLeft / (cardWidth + CARD_GAP))
      setActiveIndex(Math.min(index, count - 1))
    }

    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [ref, cardWidth, count])

  return activeIndex
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves a CMS link value to a plain href string, or undefined if unresolvable.
 */
function resolveLinkHref(link: CarouselItem['link']): string | undefined {
  if (!link) return undefined

  if (link.type === 'reference') return link.url ?? undefined

  const ref = link.reference
  if (!ref || typeof ref.value !== 'object' || !ref.value.slug) return undefined

  const prefix = ref.relationTo !== 'pages' ? `/${ref.relationTo}` : ''
  return `${prefix}/${ref.value.slug}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavButtonProps {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}

const NavButton: React.FC<NavButtonProps> = ({ direction, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'prev' ? 'Previous' : 'Next'}
    className={cn(
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black transition-opacity',
      disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:bg-black/5',
    )}
  >
    {direction === 'prev' ? (
      <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
    ) : (
      <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
    )}
  </button>
)

interface DotNavProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}

const DotNav: React.FC<DotNavProps> = ({ count, activeIndex, onSelect }) => (
  <div className="flex items-center gap-4">
    {Array.from({ length: count }, (_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        aria-label={`Go to slide ${i + 1}`}
        className="relative flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-[#4d4d4d] cursor-pointer"
      >
        {i === activeIndex && <span className="block h-2 w-2 rounded-full bg-black" />}
      </button>
    ))}
  </div>
)

// ─── Card variants ────────────────────────────────────────────────────────────

const CARD_BASE = 'h-[500px] w-[400px] shrink-0 snap-start overflow-hidden rounded-[32px]'

const MinimalCard: React.FC<{ item: CarouselItem }> = ({ item }) => {
  const media = item.image as MediaType | undefined

  return (
    <div
      data-carousel-card
      className={cn(CARD_BASE, 'group relative flex flex-col items-center justify-end px-6 py-14')}
    >
      {media && (
        <div className="absolute inset-0">
          <Media
            resource={media}
            imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            fill
          />
          <div className="absolute inset-0 rounded-[32px] bg-black/30 mix-blend-multiply" />
        </div>
      )}

      {(item.title || item.text) && (
        <div className="relative z-10 flex flex-col gap-1 text-center text-white">
          {item.title && <p className="text-xl leading-[26px]">{item.title}</p>}
          {item.text && <RichText data={item.text} enableGutter={false} enableProse={false} />}
        </div>
      )}
    </div>
  )
}

const DefaultCard: React.FC<{ item: CarouselItem }> = ({ item }) => {
  const media = item.image as MediaType | undefined

  return (
    <div
      data-carousel-card
      className={cn(CARD_BASE, 'group flex flex-col gap-1.5 bg-black px-6 pb-6 pt-14')}
    >
      {(item.title || item.text) && (
        <div className="flex flex-col gap-1 text-center text-white">
          {item.title && (
            <h3 className="text-[32px] font-normal capitalize leading-[40px]">{item.title}</h3>
          )}
          {item.text && <RichText data={item.text} enableGutter={false} enableProse={false} />}
        </div>
      )}

      {media && (
        <div className="relative mt-auto w-full flex-1 overflow-hidden rounded-b-[20px]">
          <Media resource={media} imgClassName="h-full w-full object-contain" fill />
        </div>
      )}
    </div>
  )
}

const CarouselCard: React.FC<{ item: CarouselItem }> = ({ item }) => {
  const isMinimal = item.cardType === 'minimal'
  const cardContent = isMinimal ? <MinimalCard item={item} /> : <DefaultCard item={item} />

  const href = resolveLinkHref(item.link)
  if (!href) return cardContent

  const newTabProps = item.link?.newTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  return (
    <a href={href} {...newTabProps} className="shrink-0 no-underline">
      {cardContent}
    </a>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const ContentCarouselBlockComponent: React.FC<ContentCarouselBlockProps> = ({
  title,
  text,
  link,
  items,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardWidth = useCardWidth(scrollRef)
  const count = items?.length ?? 0
  const activeIndex = useActiveIndex(scrollRef, cardWidth, count)

  // End padding lets the last card scroll flush to the left edge
  const endPadding = scrollRef.current ? Math.max(0, scrollRef.current.clientWidth - cardWidth) : 0

  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const clamped = Math.max(0, Math.min(index, count - 1))
      el.scrollTo({ left: clamped * (cardWidth + CARD_GAP), behavior: 'smooth' })
    },
    [cardWidth, count],
  )

  if (!items || count === 0) return null

  const hasLink = link && (link.type === 'reference' || link.url)

  return (
    <section className="w-full overflow-hidden my-16">
      <div className="container flex flex-col lg:flex-row lg:items-start lg:gap-24 xl:gap-34">
        {/* Left: text content */}
        {(title || text || hasLink) && (
          <div className="mb-14 flex shrink-0 flex-col gap-8 lg:mb-0 lg:w-[400px] xl:w-[500px]">
            {title && <h2>{title}</h2>}
            {text && <RichText data={text} enableGutter={false} enableProse={false} />}
            {hasLink && <CMSLink {...link} appearance="default" />}
          </div>
        )}

        {/* Right: carousel + navigation */}
        <div className="min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide snap-x mr-[calc(-50vw+50%)]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, i) => (
              <CarouselCard key={i} item={item} />
            ))}
            <div className="shrink-0" style={{ width: endPadding }} aria-hidden />
          </div>

          {count > 1 && (
            <div className="mt-8 flex w-[400px] max-w-full items-center justify-center gap-8">
              <NavButton
                direction="prev"
                disabled={activeIndex === 0}
                onClick={() => scrollTo(activeIndex - 1)}
              />
              <DotNav count={count} activeIndex={activeIndex} onSelect={scrollTo} />
              <NavButton
                direction="next"
                disabled={activeIndex === count - 1}
                onClick={() => scrollTo(activeIndex + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
