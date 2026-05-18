import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'white' | 'black'
}

export const Logo = (props: Props) => {
  const {
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    variant = 'white',
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="OnceMore Logo"
      width={176}
      height={48}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('w-[176px] h-[48px]', className)}
      src={variant === 'black' ? '/images/logo-black.svg' : '/images/logo-white.svg'}
    />
  )
}
