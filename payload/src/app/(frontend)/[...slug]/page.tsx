import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      breadcrumbs: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      // breadcrumbs[last].url will be e.g. "/about/team" — skip home
      const url = doc.breadcrumbs?.at(-1)?.url
      return url && url !== '/'
    })
    .map((doc) => {
      const url = doc.breadcrumbs!.at(-1)!.url! // e.g. "/about/team"
      const segments = url.replace(/^\//, '').split('/') // ["about", "team"]
      return { slug: segments }
    })

  return params ?? []
}

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

// Helper to safely decode URI components
function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise

  // Join segments back into a full path, e.g. ["about", "team"] → "/about/team"
  const fullPath = slug?.length ? '/' + slug.map(safeDecodeURIComponent).join('/') : '/home'
  const isHome = !slug?.length

  let page = (await queryPageByPath({
    path: fullPath,
    draft,
  })) as RequiredDataFromCollectionSlug<'pages'> | null

  // Remove this code once your website is seeded
  if (!page && isHome) {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={fullPath} />
  }

  const { hero, layout } = page

  return (
    <>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={fullPath} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const fullPath = slug?.length ? '/' + slug.map(safeDecodeURIComponent).join('/') : '/home'
  const { isEnabled: draft } = await draftMode()

  const page = await queryPageByPath({ path: fullPath, draft })

  return generateMeta({ doc: page })
}

const queryPageByPath = cache(async ({ path, draft }: { path: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    pagination: false,
    overrideAccess: draft,
    where: {
      'breadcrumbs.url': {
        equals: path,
      },
    },
  })

  // The query matches any page that has `path` anywhere in its breadcrumbs
  // (children inherit parent breadcrumbs). Pick only the page whose *last*
  // breadcrumb — i.e. its own URL — matches the requested path.
  return result.docs?.find((doc) => doc.breadcrumbs?.at(-1)?.url === path) ?? null
})
