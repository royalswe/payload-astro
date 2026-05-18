import React from 'react'
import { cn } from '@/utilities/ui'

import type { FlexibleContentBlock as FlexibleContentBlockProps } from '@/payload-types'

import { CardBlockComponent } from '@/blocks/Card/Component'

const innerBlockComponents: Record<string, React.FC<any>> = {
  card: CardBlockComponent,
}

const sizeClasses: Record<string, string> = {
  oneFourth: 'w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]',
  oneThird: 'w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]',
  half: 'w-full md:w-[calc(50%-12px)]',
  twoThirds: 'w-full md:w-full lg:w-[calc(66.667%-8px)]',
  full: 'w-full',
}

export const FlexibleContentBlockComponent: React.FC<FlexibleContentBlockProps> = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="container my-16">
      <div className="flex flex-col items-center gap-10 w-full md:flex-row md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-10">
        {items.map((item, index) => {
          const { size = 'oneThird', block } = item
          if (!block || !Array.isArray(block) || block.length === 0) return null
          const innerBlock = block[0]
          const blockType = innerBlock?.blockType
          const Block = blockType ? innerBlockComponents[blockType] : undefined
          if (!Block) return null
          return (
            <div key={index} className={cn(sizeClasses[size ?? 'oneThird'])}>
              <Block {...innerBlock} tiltIndex={index} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
