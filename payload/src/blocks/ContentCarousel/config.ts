import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
export const ContentCarousel: Block = {
  slug: 'contentCarousel',
  interfaceName: 'ContentCarouselBlock',
  labels: {
    singular: 'Content Carousel',
    plural: 'Content Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'text',
      type: 'richText',
      label: 'Text',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'enableLink',
      type: 'checkbox',
    },
    link({
      overrides: {
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
        },
      },
    }),
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      minRows: 1,
      fields: [
        {
          name: 'cardType',
          type: 'select',
          label: 'Card Type',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Minimal', value: 'minimal' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'text',
          type: 'richText',
          label: 'Text',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
            },
          }),
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
        link({ appearances: false, disableLabel: true }),
      ],
    },
  ],
}
