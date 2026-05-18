import React from 'react'
import { cn } from '@/utilities/ui'

import type { CardBlock as CardBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type Props = CardBlockProps & {
  tiltIndex?: number
}

export const CardBlockComponent: React.FC<Props> = ({
  image,
  title,
  text,
  enableLink,
  link,
  tiltIndex = 0,
}) => {
  // Alternate tilt: even index tilts left (-2°), odd tilts right (+2°)
  const tilt = tiltIndex % 2 === 0 ? '-rotate-2' : 'rotate-2'
  return (
    <div className="flex flex-col items-center gap-6 p-2 w-full">
      {/* Image — responsive size and border-radius */}
      {image && typeof image !== 'string' && (
        <div className="flex justify-center w-full overflow-visible">
          <div
            className={cn(
              // Mobile: 310×410, rounded-[13px]
              'relative overflow-hidden shrink-0 rounded-[13px] w-[310px] h-[410px]',
              // Desktop: 400×500, rounded-[32px]
              'xl:w-[400px] xl:h-[500px] xl:rounded-[32px]',
              tilt,
            )}
          >
            <Media resource={image} fill imgClassName="object-cover" />
          </div>
        </div>
      )}

      {/* Text + button */}
      <div className="flex flex-col gap-8 w-full max-w-[344px] xl:max-w-[400px]">
        <div className="flex flex-col items-center gap-6 text-center w-full">
          {title && (
            <h3
              className={
                // Mobile/tablet: 24px, Desktop: 32px
                'font-sans text-[24px] leading-[32px] capitalize w-full xl:text-[32px] xl:leading-[40px]'
              }
            >
              {title}
            </h3>
          )}
          {text && (
            <RichText
              data={text}
              enableGutter={false}
              // Mobile/tablet: 16px, Desktop: 20px
              className="font-sans text-[16px] leading-[24px] text-center [&_p]:m-0 xl:text-[20px] xl:leading-[26px]"
            />
          )}
        </div>

        {enableLink && link && <CMSLink {...link} appearance={'default'} />}
      </div>
    </div>
  )
}
