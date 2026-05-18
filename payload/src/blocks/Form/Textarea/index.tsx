import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    placeholder?: string
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, placeholder, register, required, rows = 5 }) => {
  return (
    <Width>
      {label && (
        <label
          htmlFor={name}
          className="block text-base md:text-[20px] md:leading-6.5 text-black mb-2"
        >
          {label}
          {required && (
            <span className="ml-0.5">
              * <span className="sr-only">(required)</span>
            </span>
          )}
        </label>
      )}
      <textarea
        defaultValue={defaultValue}
        id={name}
        rows={rows}
        placeholder={placeholder || ''}
        aria-required={required || undefined}
        className="min-h-35 md:min-h-43 w-full rounded-3xl border-[1.5px] border-black bg-transparent px-5 py-5 text-base md:text-[20px] md:leading-6.5 text-black placeholder:text-black resize-y focus:outline-none focus:ring-2 focus:ring-black/20"
        {...register(name, { required: required })}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
