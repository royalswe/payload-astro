import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

function getPagePath(doc: Partial<Page>): string {
  const breadcrumbUrl = doc.breadcrumbs?.at(-1)?.url
  if (breadcrumbUrl) return breadcrumbUrl === '/home' ? '/' : breadcrumbUrl
  if (!doc.slug) return '/'
  return doc.slug === 'home' ? '/' : `/${doc.slug}`
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = getPagePath(doc)

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = getPagePath(previousDoc)

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = doc ? getPagePath(doc) : '/'
    revalidatePath(path)
    revalidateTag('pages-sitemap', 'max')
  }

  return doc
}
