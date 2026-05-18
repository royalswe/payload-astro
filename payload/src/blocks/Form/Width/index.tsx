import * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const widthValue =
    width !== undefined ? (typeof width === 'number' ? `${width}%` : width) : '100%'

  return (
    <div
      className={className}
      style={{
        flexBasis: widthValue,
        maxWidth: widthValue,
      }}
    >
      {children}
    </div>
  )
}
