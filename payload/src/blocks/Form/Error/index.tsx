'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="mt-2 text-red-700 text-sm font-medium" role="alert" aria-live="polite">
      {(errors[name]?.message as string) || 'This field is required'}
    </div>
  )
}
