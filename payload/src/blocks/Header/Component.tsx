import React from 'react'
import { cn } from '@/utilities/ui'

import type { HeaderBlock as HeaderBlockProps } from '@/payload-types'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

export const HeaderBlockComponent: React.FC<HeaderBlockProps> = ({
  text,
  fontSize = 'h2',
  alignment = 'center',
}) => {
  const Tag = (fontSize ?? 'h2') as HeadingTag

  const alignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return <Tag className={cn(alignClasses[alignment ?? 'center'], ' w-full')}>{text}</Tag>
}
