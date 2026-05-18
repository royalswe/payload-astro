'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'
import { AlertBanner } from '@/components/AlertBanner'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { useHeaderTheme } from '@/providers/HeaderTheme'

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = NonNullable<Header['navItems']>[number]
type NavChild = NonNullable<NavItem['children']>[number]

interface HeaderClientProps {
  data: Header
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useScrolled(threshold = 35) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [active, onOutside, ref])
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative flex h-[12px] w-[18px] flex-col justify-between">
      <span
        className={`block h-[2px] w-full origin-center rounded-full bg-white transition-all duration-150 ease-in-out ${
          open ? 'translate-y-[5px] rotate-45' : ''
        }`}
      />
      <span
        className={`block h-[2px] w-full rounded-full bg-white transition-all duration-150 ease-in-out ${
          open ? 'scale-x-0 opacity-0' : ''
        }`}
      />
      <span
        className={`block h-[2px] w-full origin-center rounded-full bg-white transition-all duration-150 ease-in-out ${
          open ? '-translate-y-[5px] -rotate-45' : ''
        }`}
      />
    </div>
  )
}

function ChevronDown({ open, size = 14 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Shared nav link styles ───────────────────────────────────────────────────

const NAV_LINK_CLASS =
  'font-sans text-[16px] leading-[20px] text-white whitespace-nowrap hover:opacity-80 transition-opacity'

// ─── Desktop components ───────────────────────────────────────────────────────

/** A single child inside a desktop dropdown (link or nested folder). */
function DesktopDropdownChild({ child }: { child: NavChild }) {
  const [open, setOpen] = useState(false)

  if (child.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1 ${NAV_LINK_CLASS}`}
        >
          {child.label}
          <ChevronDown open={open} size={13} />
        </button>
        {open && child.subItems && (
          <div className="ml-3 mt-2 flex flex-col gap-2">
            {child.subItems.map((sub, i) =>
              sub.link ? (
                <CMSLink
                  key={sub.id ?? i}
                  {...sub.link}
                  appearance="inline"
                  className="font-sans text-[16px] leading-[20px] text-white/80 transition-colors hover:text-white"
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    )
  }

  return child.link ? (
    <CMSLink {...child.link} appearance="inline" className={NAV_LINK_CLASS} />
  ) : null
}

/** Pill nav items — measured for overflow, hidden ones move to the hamburger dropdown. */
function DesktopNavItems({
  navItems,
  containerRef,
  itemRefs,
  hiddenIndices,
  expandedFolders,
  onToggleFolder,
  onCloseMenu,
}: {
  navItems: NavItem[]
  containerRef: React.RefObject<HTMLDivElement | null>
  itemRefs: React.RefObject<(HTMLSpanElement | null)[]>
  hiddenIndices: Set<number>
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
  onCloseMenu: () => void
}) {
  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2.5"
      style={{ maxWidth: 'calc(50vw - 88px - 64px - 85px)' }} // 50% viewport - half the logo - padding - hamburger
    >
      {navItems.map((item, i) => {
        const id = item.id ?? `nav-${i}`
        const hidden = hiddenIndices.has(i)
        const isOpen = expandedFolders.has(id)

        if (item.type === 'folder') {
          return (
            <span
              key={id}
              ref={(el) => {
                if (itemRefs.current) itemRefs.current[i] = el
              }}
              className="relative shrink-0"
              style={hidden ? { visibility: 'hidden' } : undefined}
            >
              <button
                onClick={() => {
                  onToggleFolder(id)
                  onCloseMenu()
                }}
                className={`flex items-center gap-1 ${NAV_LINK_CLASS}`}
              >
                {item.label}
                <ChevronDown open={isOpen} size={13} />
              </button>
              {isOpen && !hidden && !!item.children?.length && (
                <div className="absolute left-0 top-full z-10 mt-4 flex min-w-[180px] flex-col gap-3 rounded-[16px] bg-black p-4 shadow-lg">
                  {item.children.map((child, ci) => (
                    <DesktopDropdownChild key={child.id ?? ci} child={child} />
                  ))}
                </div>
              )}
            </span>
          )
        }

        return item.link ? (
          <span
            key={id}
            ref={(el) => {
              if (itemRefs.current) itemRefs.current[i] = el
            }}
            className="shrink-0"
            style={hidden ? { visibility: 'hidden' } : undefined}
          >
            <CMSLink {...item.link} appearance="inline" className={NAV_LINK_CLASS} />
          </span>
        ) : null
      })}
    </div>
  )
}

/** Hamburger dropdown: overflow items + Login. */
function DesktopHamburgerMenu({
  open,
  onToggle,
  overflowItems,
  allItems,
  expandedFolders,
  onToggleFolder,
}: {
  open: boolean
  onToggle: () => void
  overflowItems: NavItem[]
  allItems: NavItem[]
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        className="flex h-6 w-6 items-center justify-center"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <HamburgerIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-4 flex min-w-[200px] flex-col gap-4 rounded-[16px] bg-black p-4 shadow-lg">
          {overflowItems.map((item, i) => {
            const realIndex = allItems.indexOf(item)
            const id = item.id ?? `df-${i}`
            const isExpanded = expandedFolders.has(id)

            if (item.type === 'folder') {
              return (
                <div key={id}>
                  <button
                    onClick={() => onToggleFolder(id)}
                    className={`flex w-full items-center gap-2 text-left ${NAV_LINK_CLASS}`}
                  >
                    {item.label}
                    <ChevronDown open={isExpanded} />
                  </button>
                  {isExpanded && item.children && (
                    <div className="ml-3 mt-2 flex flex-col gap-2">
                      {item.children.map((child, ci) => (
                        <DesktopDropdownChild key={child.id ?? ci} child={child} />
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return item.link ? (
              <CMSLink
                key={item.id ?? realIndex}
                {...item.link}
                appearance="inline"
                className={`${NAV_LINK_CLASS} hover:underline`}
              />
            ) : null
          })}

          <Link
            href="/admin"
            className="mt-2 rounded-[40px] border-[1.5px] border-white px-5 py-2 text-center font-sans text-[16px] leading-[20px] text-white transition-colors hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Mobile components ────────────────────────────────────────────────────────

function MobileSubfolderItem({
  child,
  expandedFolders,
  onToggleFolder,
}: {
  child: NavChild
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
}) {
  const id = child.id ?? 'unknown-sub'
  const isExpanded = expandedFolders.has(id)

  return (
    <div>
      <button
        onClick={() => onToggleFolder(id)}
        className="flex items-center gap-2 font-sans text-[24px] leading-[32px] text-white/80 transition-colors hover:text-white"
      >
        {child.label}
        <ChevronDown open={isExpanded} size={16} />
      </button>
      {isExpanded && child.subItems && (
        <div className="ml-4 mt-3 flex flex-col gap-3">
          {child.subItems.map((sub, sci) =>
            sub.link ? (
              <CMSLink
                key={sub.id ?? sci}
                {...sub.link}
                appearance="inline"
                className="font-sans text-[20px] leading-[28px] text-white/60 transition-colors hover:text-white"
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

function MobileFolderItem({
  item,
  expandedFolders,
  onToggleFolder,
}: {
  item: NavItem
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
}) {
  const id = item.id ?? 'unknown'
  const isExpanded = expandedFolders.has(id)

  return (
    <div>
      <button
        onClick={() => onToggleFolder(id)}
        className="flex items-center gap-3 font-sans text-[32px] leading-[40px] text-white transition-opacity hover:opacity-80"
      >
        {item.label}
        <ChevronDown open={isExpanded} size={20} />
      </button>
      {isExpanded && item.children && (
        <div className="ml-4 mt-4 flex flex-col gap-4">
          {item.children.map((child, ci) =>
            child.type === 'folder' ? (
              <MobileSubfolderItem
                key={child.id ?? ci}
                child={child}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ) : child.link ? (
              <CMSLink
                key={child.id ?? ci}
                {...child.link}
                appearance="inline"
                className="font-sans text-[24px] leading-[32px] text-white/80 transition-colors hover:text-white"
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

/** Full-screen mobile menu overlay. */
function MobileMenu({
  open,
  navItems,
  expandedFolders,
  onClose,
  onToggleFolder,
}: {
  open: boolean
  navItems: NavItem[]
  expandedFolders: Set<string>
  onClose: () => void
  onToggleFolder: (id: string) => void
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-black transition-all duration-200 ease-in-out lg:hidden ${
        open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
      }`}
    >
      {/* Top bar with close button */}
      <div className="relative flex h-[92px] shrink-0 items-center justify-end px-4">
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo loading="eager" priority="high" />
        </Link>
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
          aria-label="Close menu"
        >
          <HamburgerIcon open />
        </button>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-10 pb-10 pt-4">
        {navItems.map((item, i) =>
          item.type === 'folder' ? (
            <MobileFolderItem
              key={item.id ?? i}
              item={item}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          ) : item.link ? (
            <CMSLink
              key={item.id ?? i}
              {...item.link}
              appearance="inline"
              className="font-sans text-[32px] leading-[40px] text-white transition-opacity hover:opacity-80"
            />
          ) : null,
        )}

        <Link
          href="/admin"
          className="mt-auto w-fit rounded-[40px] border-[1.5px] border-white px-6 py-3 text-center font-sans text-[16px] leading-[20px] text-white transition-colors hover:bg-white/10"
        >
          Log in
        </Link>
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set())

  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const scrolled = useScrolled()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Reset on navigation
  useEffect(() => {
    setHeaderTheme(null)
    setMenuOpen(false)
    setExpandedFolders(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Sync theme
  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Lock scroll on mobile when menu is open
  useEffect(() => {
    const isMobile = !window.matchMedia('(min-width: 1024px)').matches
    document.body.style.overflow = menuOpen && isMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Close desktop dropdown on outside click (skip on mobile where the overlay handles its own close)
  const closeMenu = useCallback(() => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    setMenuOpen(false)
    setExpandedFolders(new Set())
  }, [])
  useClickOutside(dropdownRef, closeMenu, menuOpen || expandedFolders.size > 0)

  // MEASURE OVERFLOW LOGIC - Refactored to use bounding rects
  const measureOverflow = useCallback(() => {
    const container = navItemsRef.current
    if (!container) return

    // getBoundingClientRect ensures we are calculating purely based on rendering
    // and layout coordinates on the screen, completely avoiding offsetParent anomalies.
    const containerRect = container.getBoundingClientRect()
    const next = new Set<number>()

    itemRefs.current.forEach((el, i) => {
      if (!el) return

      const elRect = el.getBoundingClientRect()
      if (elRect.right > containerRect.right) {
        next.add(i)
      }
    })

    setHiddenIndices(next)
  }, [])

  useEffect(() => {
    measureOverflow()
    const ro = new ResizeObserver(measureOverflow)
    if (navItemsRef.current) ro.observe(navItemsRef.current)
    return () => ro.disconnect()
  }, [measureOverflow, data?.navItems])

  const navItems = data?.navItems ?? []

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.clear()
        next.add(id)
      }
      return next
    })
  }, [])

  const overflowItems = navItems.filter((_, i) => hiddenIndices.has(i))

  const isOverlay = theme === 'dark' && !scrolled

  return (
    <>
      <AlertBanner
        enabled={data?.alertBanner?.enabled}
        text={data?.alertBanner?.text}
        link={data?.alertBanner?.link}
      />

      <div className="sticky top-0 z-20">
        <header className="relative w-full" {...(theme ? { 'data-theme': theme } : {})}>
          {/* Background: gradient overlay fades out, solid white fades in on scroll */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${isOverlay ? 'opacity-100' : 'opacity-0'}`}
              style={{
                background: 'linear-gradient(0deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.65) 100%)',
              }}
            />
            <div
              className={`absolute inset-0 bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.08)] transition-opacity duration-300 ${isOverlay ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>

          {/* Header bar */}
          <div className="relative flex h-[92px] items-center justify-end px-4 lg:h-[120px] lg:px-16">
            {/* Logo — centred absolutely so nav items don't push it */}
            <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Logo loading="eager" priority="high" variant={isOverlay ? 'white' : 'black'} />
            </Link>

            {/* Desktop pill */}
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <div className="flex items-center gap-2.5 rounded-[40px] bg-black px-4 py-2">
                <DesktopNavItems
                  navItems={navItems}
                  containerRef={navItemsRef}
                  itemRefs={itemRefs}
                  hiddenIndices={hiddenIndices}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                  onCloseMenu={() => setMenuOpen(false)}
                />
                <DesktopHamburgerMenu
                  open={menuOpen}
                  onToggle={() => {
                    setMenuOpen((v) => !v)
                    setExpandedFolders(new Set())
                  }}
                  overflowItems={overflowItems}
                  allItems={navItems}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                />
              </div>
            </div>

            {/* Mobile hamburger trigger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>

          {/* Mobile full-screen overlay */}
          <MobileMenu
            open={menuOpen}
            navItems={navItems}
            expandedFolders={expandedFolders}
            onClose={() => setMenuOpen(false)}
            onToggleFolder={toggleFolder}
          />
        </header>
      </div>
    </>
  )
}
