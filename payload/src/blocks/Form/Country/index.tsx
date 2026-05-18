'use client'

import type { CountryField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { countryOptions } from './options'

export const Country: React.FC<
  CountryField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    placeholder?: string
  }
> = ({ name, control, errors, label, placeholder, required }) => {
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
      <div className="relative">
        <Controller
          control={control}
          defaultValue=""
          name={name}
          render={({ field: { onChange, value } }) => (
            <select
              id={name}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              aria-required={required || undefined}
              className="h-11 w-full rounded-3xl border-[1.5px] border-black bg-transparent px-5 text-base md:text-[20px] md:leading-6.5 text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="" disabled>
                {placeholder || label || 'Select...'}
              </option>
              {countryOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
          rules={{ required }}
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
