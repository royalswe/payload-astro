import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    placeholder?: string
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, placeholder, register, required }) => {
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
      <input
        defaultValue={defaultValue}
        id={name}
        type="email"
        placeholder={placeholder || ''}
        aria-required={required || undefined}
        className="h-11 w-full rounded-3xl border-[1.5px] border-black bg-transparent px-5 text-base md:text-[20px] md:leading-6.5 text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
        {...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
