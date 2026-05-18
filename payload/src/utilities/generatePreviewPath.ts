import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

const getAstroPreviewBaseURL = () =>
  (
    process.env.ASTRO_PUBLIC_SERVER_URL ||
    process.env.ASTRO_SERVER_URL ||
    process.env.FRONTEND_SERVER_URL ||
    'http://localhost:4321'
  ).replace(/\/$/, '')

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  /**
   * Optional full path override (e.g. from breadcrumbs) for nested pages.
   * When provided, this is used instead of building the path from the slug.
   */
  fullPath?: string | null
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, fullPath }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Use the full breadcrumb path when available, otherwise fall back to prefix + slug
  const rawPath = fullPath || `${collectionPrefixMap[collection]}/${slug}`
  const path = collection === 'pages' && rawPath === '/home' ? '/' : rawPath

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  if (process.env.PAYLOAD_PREVIEW_TARGET === 'next') {
    return `/next/preview?${encodedParams.toString()}`
  }

  const astroPreviewURL = new URL(path.startsWith('/') ? path : `/${path}`, getAstroPreviewBaseURL())
  astroPreviewURL.searchParams.set('preview', 'true')
  astroPreviewURL.searchParams.set('collection', collection)
  astroPreviewURL.searchParams.set('slug', slug)

  const url = astroPreviewURL.toString()

  return url
}
