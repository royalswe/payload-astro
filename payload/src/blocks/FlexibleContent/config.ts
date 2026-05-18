import type { Block } from 'payload'

import { CardBlock } from '@/blocks/Card/config'

export const FlexibleContentBlock: Block = {
  slug: 'flexibleContent',
  interfaceName: 'FlexibleContentBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'size',
          type: 'select',
          defaultValue: 'oneThird',
          options: [
            { label: 'One Fourth', value: 'oneFourth' },
            { label: 'One Third', value: 'oneThird' },
            { label: 'Half', value: 'half' },
            { label: 'Two Thirds', value: 'twoThirds' },
            { label: 'Full', value: 'full' },
          ],
        },
        {
          name: 'block',
          type: 'blocks',
          minRows: 1,
          maxRows: 1,
          blocks: [CardBlock],
        },
      ],
    },
  ],
}
