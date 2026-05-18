import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'alertBanner',
      label: 'Alert Banner',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Alert Banner',
          defaultValue: false,
        },
        {
          name: 'text',
          type: 'text',
          label: 'Banner Text',
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Banner Link (URL)',
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Folder', value: 'folder' },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_data, siblingData) => siblingData?.type === 'link',
            },
          },
        }),
        {
          name: 'label',
          type: 'text',
          label: 'Folder Label',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'folder',
          },
        },
        {
          name: 'children',
          type: 'array',
          label: 'Folder Items',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'folder',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'type',
              type: 'select',
              defaultValue: 'link',
              options: [
                { label: 'Link', value: 'link' },
                { label: 'Sub-folder', value: 'folder' },
              ],
            },
            link({
              appearances: false,
              overrides: {
                admin: {
                  condition: (_data, siblingData) => siblingData?.type === 'link',
                },
              },
            }),
            {
              name: 'label',
              type: 'text',
              label: 'Sub-folder Label',
              admin: {
                condition: (_data, siblingData) => siblingData?.type === 'folder',
              },
            },
            {
              name: 'subItems',
              type: 'array',
              label: 'Sub-folder Items',
              admin: {
                condition: (_data, siblingData) => siblingData?.type === 'folder',
                initCollapsed: true,
              },
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 50,
            },
          ],
          maxRows: 50,
        },
      ],
      maxRows: 50,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
