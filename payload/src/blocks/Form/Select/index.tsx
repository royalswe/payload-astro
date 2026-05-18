'use client'

import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'

export const Select: React.FC<
  SelectField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, options, required, defaultValue }) => {
  return (
    <Width>
      {/* Group label */}
      <fieldset>
        {label && (
          <legend className="text-[20px] md:text-[24px] md:leading-8 text-black capitalize mb-4">
            {label}
            {required && <span className="sr-only"> (required)</span>}
          </legend>
        )}

        <Controller
          control={control}
          defaultValue={defaultValue}
          name={name}
          render={({ field: { onChange, value } }) => (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              role="radiogroup"
              aria-label={label}
            >
              {options.map((option) => {
                const isSelected = value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className="flex items-center gap-3 cursor-pointer group text-left"
                    onClick={() => onChange(option.value)}
                  >
                    <span
                      className={`shrink-0 size-11 rounded-full border-[1.5px] border-black transition-colors ${
                        isSelected ? 'bg-black' : 'bg-transparent'
                      }`}
                    />
                    <span className="text-base md:text-[20px] md:leading-6.5 text-black">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          rules={{ required }}
        />
      </fieldset>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
