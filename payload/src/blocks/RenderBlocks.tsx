import type { Page } from '@/payload-types'

import React, { Fragment } from 'react'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { FlexibleContentBlockComponent } from '@/blocks/FlexibleContent/Component'
import { HeaderBlockComponent } from '@/blocks/Header/Component'
import { CustomerCarouselBlockComponent } from '@/blocks/CustomerCarousel/Component'
import { ContentCarouselBlockComponent } from '@/blocks/ContentCarousel/Component'
import { NewsletterSubscribeBlock } from '@/blocks/NewsletterSubscribe/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  flexibleContent: FlexibleContentBlockComponent,
  headerBlock: HeaderBlockComponent,
  customerCarousel: CustomerCarouselBlockComponent,
  contentCarousel: ContentCarouselBlockComponent,
  newsletterSubscribe: NewsletterSubscribeBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]
            if (Block) {
              return (
                <Fragment key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </Fragment>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
