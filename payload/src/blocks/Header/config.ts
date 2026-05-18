import type { Block } from 'payload'

export const HeaderBlock: Block = {
  slug: 'headerBlock',
  interfaceName: 'HeaderBlock',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'fontSize',
      type: 'select',
      defaultValue: 'h2',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
      ],
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
