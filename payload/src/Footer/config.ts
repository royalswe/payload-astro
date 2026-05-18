import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    // ─── Contact Section ──────────────────────────────────────────────
    {
      name: 'contactTitle',
      type: 'text',
      label: 'Contact Title',
      defaultValue: 'Get In Touch',
      localized: true,
    },
    {
      name: 'addressLines',
      type: 'array',
      label: 'Address Lines',
      maxRows: 6,
      fields: [
        {
          name: 'line',
          type: 'text',
          required: true,
        },
        {
          name: 'isLink',
          type: 'checkbox',
          label: 'Is link?',
          defaultValue: false,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL (tel:, mailto:, or href)',
          admin: {
            condition: (_, siblingData) => siblingData?.isLink === true,
          },
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },

    // ─── Social Links ──────────────────────────────────────────────────
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      maxRows: 6,
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'X / Twitter', value: 'x' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },

    // ─── Navigation Columns ──────────────────────────────────────────
    {
      name: 'navColumns',
      type: 'array',
      label: 'Navigation Columns',
      maxRows: 4,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'links',
          type: 'array',
          maxRows: 8,
          fields: [
            link({
              appearances: false,
            }),
          ],
          admin: {
            initCollapsed: true,
          },
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },

    // ─── Legal Links ─────────────────────────────────────────────────
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links (bottom)',
      maxRows: 4,
      fields: [
        link({
          appearances: false,
        }),
      ],
      admin: {
        initCollapsed: true,
      },
    },

    // ─── Copyright ──────────────────────────────────────────────────
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Copyright Text',
      defaultValue: '© OnceMore 2025',
      localized: true,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
