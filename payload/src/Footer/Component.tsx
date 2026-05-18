import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

// ─── Types ────────────────────────────────────────────────────────────────────

type AddressLine = NonNullable<FooterType['addressLines']>[number]
type SocialLink = NonNullable<FooterType['socialLinks']>[number]
type NavColumn = NonNullable<FooterType['navColumns']>[number]
type LegalLink = NonNullable<FooterType['legalLinks']>[number]

// ─── Social Icons ─────────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
        fill="currentColor"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
        fill="currentColor"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="currentColor"
      />
    </svg>
  )
}

const SOCIAL_ICONS: Record<string, React.FC> = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
}

const LINK_CLASS =
  'text-base md:text-xl md:leading-[26px] text-white underline hover:opacity-80 transition-opacity'
const HEADING_CLASS = 'text-xl md:text-2xl md:leading-8 capitalize mb-1.5'

// ─── Sub-components ───────────────────────────────────────────────────────────

function AddressBlock({
  contactTitle,
  addressLines,
}: {
  contactTitle?: string | null
  addressLines?: AddressLine[] | null
}) {
  if (!contactTitle && !addressLines?.length) return null

  return (
    <div className="flex flex-col gap-2.5">
      {contactTitle && <h3 className={HEADING_CLASS}>{contactTitle}</h3>}
      {addressLines?.map((item, i) =>
        item.isLink && item.url ? (
          <Link
            key={item.id ?? i}
            href={item.url}
            className={`${LINK_CLASS} no-underline underline`}
          >
            {item.line}
          </Link>
        ) : (
          <p key={item.id ?? i} className="text-base md:text-xl md:leading-[26px]">
            {item.line}
          </p>
        ),
      )}
    </div>
  )
}

function SocialBar({ socialLinks }: { socialLinks?: SocialLink[] | null }) {
  if (!socialLinks?.length) return null

  return (
    <div className="flex gap-4">
      {socialLinks.map((social, i) => {
        const Icon = social.platform ? SOCIAL_ICONS[social.platform] : null
        if (!Icon || !social.url) return null
        return (
          <Link
            key={social.id ?? i}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.platform ?? undefined}
            className="text-white hover:opacity-80 transition-opacity"
          >
            <Icon />
          </Link>
        )
      })}
    </div>
  )
}

function NavColumns({ navColumns }: { navColumns?: NavColumn[] | null }) {
  if (!navColumns?.length) return null

  return (
    <nav className="flex flex-col gap-12 md:flex-row md:gap-16" aria-label="Footer navigation">
      {navColumns.map((column, i) => (
        <div key={column.id ?? i} className="flex flex-col gap-2.5">
          {column.title && <h3 className={HEADING_CLASS}>{column.title}</h3>}
          {column.links?.map((item, j) => (
            <CMSLink key={item.id ?? j} className={LINK_CLASS} {...item.link} />
          ))}
        </div>
      ))}
    </nav>
  )
}

function LegalBar({ legalLinks }: { legalLinks?: LegalLink[] | null }) {
  if (!legalLinks?.length) return null

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-6">
      <ThemeSelector />

      {legalLinks.map((item, i) => (
        <CMSLink key={item.id ?? i} className={LINK_CLASS} {...item.link} />
      ))}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export async function Footer() {
  const footerData: FooterType = await getCachedGlobal('footer', 1)()

  const {
    contactTitle,
    addressLines,
    description,
    socialLinks,
    navColumns,
    legalLinks,
    copyrightText,
  } = footerData ?? {}

  return (
    <footer className="bg-black text-white">
      <div className="px-4 md:px-16 py-16 md:py-20">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-16">
          {/* Left: Contact + Description + Social */}
          <div className="flex flex-col gap-12 lg:max-w-[421px]">
            <AddressBlock contactTitle={contactTitle} addressLines={addressLines} />
            {description && <p className="text-base md:text-xl md:leading-[26px]">{description}</p>}
            <SocialBar socialLinks={socialLinks} />
          </div>

          {/* Right: Nav columns */}
          <NavColumns navColumns={navColumns} />
        </div>

        {/* Bottom: Copyright + Logo + Legal */}
        <div className="mt-20 flex flex-col-reverse lg:flex-row lg:items-end lg:justify-between gap-12">
          {copyrightText && (
            <p className="text-base md:text-xl md:leading-[26px]">{copyrightText}</p>
          )}

          <div className="flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 relative">
            <Link href="/" aria-label="OnceMore home">
              <Logo variant="white" />
            </Link>
          </div>

          <LegalBar legalLinks={legalLinks} />
        </div>
      </div>
    </footer>
  )
}
