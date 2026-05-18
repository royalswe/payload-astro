import type { Block } from 'payload'

export const CustomerCarousel: Block = {
  slug: 'customerCarousel',
  interfaceName: 'CustomerCarouselBlock',
  labels: {
    singular: 'Customer Carousel',
    plural: 'Customer Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'logos',
      type: 'array',
      label: 'Logos',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link (optional)',
          admin: {
            description: 'URL to link to when the logo is clicked (internal or external)',
          },
        },
      ],
    },
  ],
}
