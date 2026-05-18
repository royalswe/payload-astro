import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { nestedDocsPageTreePlugin } from 'payload-nested-docs-page-tree'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import type { Block, BlocksField } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  // For pages with breadcrumbs (nested pages), use the full breadcrumb URL
  const breadcrumbUrl = doc && 'breadcrumbs' in doc ? (doc as Page).breadcrumbs?.at(-1)?.url : null
  if (breadcrumbUrl) return `${url}${breadcrumbUrl}`

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories', 'pages'],
    generateLabel: (_, doc) => doc.title as string,
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  nestedDocsPageTreePlugin({
    collections: ['pages'],
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }

          // Add placeholder field to all form field blocks that use text-like inputs
          if ('name' in field && field.name === 'fields' && field.type === 'blocks') {
            const blocksField = field as BlocksField
            return {
              ...blocksField,
              blocks: blocksField.blocks.map((block: Block) => {
                const blocksNeedingPlaceholder = [
                  'text',
                  'textarea',
                  'email',
                  'number',
                  'country',
                  'state',
                ]
                if (blocksNeedingPlaceholder.includes(block.slug)) {
                  const hasPlaceholder = block.fields.some((f) => {
                    if ('name' in f && f.name === 'placeholder') return true
                    // Also check inside row fields
                    if (f.type === 'row') {
                      return f.fields.some((rf) => 'name' in rf && rf.name === 'placeholder')
                    }
                    return false
                  })
                  if (!hasPlaceholder) {
                    const placeholderRow = {
                      type: 'row' as const,
                      fields: [
                        {
                          name: 'placeholder',
                          type: 'text' as const,
                          label: 'Placeholder',
                          localized: true,
                        },
                      ],
                    }
                    // Find the first row (contains name + label) and insert after it
                    const firstRowIndex = block.fields.findIndex((f) => f.type === 'row')
                    const fields = [...block.fields]
                    if (firstRowIndex !== -1) {
                      fields.splice(firstRowIndex + 1, 0, placeholderRow)
                    } else {
                      fields.push(placeholderRow)
                    }
                    return { ...block, fields }
                  }
                }
                return block
              }),
            }
          }

          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
