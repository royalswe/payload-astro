import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const NewsletterSubscribe: Block = {
  slug: 'newsletterSubscribe',
  interfaceName: 'NewsletterSubscribeBlock',
  labels: {
    singular: 'Newsletter Subscribe',
    plural: 'Newsletter Subscribe Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      defaultValue: 'Subscribe to our newsletter',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'namePlaceholder',
      type: 'text',
      label: 'Name Field Placeholder',
      defaultValue: 'Name',
      localized: true,
    },
    {
      name: 'emailPlaceholder',
      type: 'text',
      label: 'Email Field Placeholder',
      defaultValue: 'Email',
      localized: true,
    },
    {
      name: 'consentLabel',
      type: 'text',
      label: 'Consent Checkbox Label',
      defaultValue: 'I have read and agree to',
      localized: true,
    },
    {
      name: 'consentLinkText',
      type: 'text',
      label: 'Consent Link Text',
      defaultValue: 'the integrity policy',
      localized: true,
    },
    {
      name: 'consentLinkUrl',
      type: 'text',
      label: 'Consent Link URL',
      defaultValue: '/integrity-policy',
    },
    {
      name: 'submitLabel',
      type: 'text',
      label: 'Submit Button Label',
      defaultValue: 'Subscribe',
      localized: true,
    },
    {
      name: 'confirmationTitle',
      type: 'text',
      label: 'Confirmation Title',
      defaultValue: 'Thank you for subscribing to our newsletter',
      localized: true,
    },
    {
      name: 'confirmationButtonLabel',
      type: 'text',
      label: 'Confirmation Button Label',
      defaultValue: 'Subscribe again',
      localized: true,
    },
  ],
}
