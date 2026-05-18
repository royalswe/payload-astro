'use client'

import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'
import React, { useCallback, useState } from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const { setValue } = useFormContext()
  const [checked, setChecked] = useState(Boolean(defaultValue))

  // Register the field for validation
  register(name, { required: required })

  const handleToggle = useCallback(() => {
    const newValue = !checked
    setChecked(newValue)
    setValue(name, newValue, { shouldValidate: true })
  }, [checked, name, setValue])

  return (
    <Width>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-required={required || undefined}
        className="flex items-start gap-2 text-left cursor-pointer group"
        onClick={handleToggle}
      >
        <span
          className={`mt-0.5 shrink-0 size-4 rounded-sm border-[1.65px] border-black transition-colors ${
            checked ? 'bg-black' : 'bg-transparent'
          }`}
        >
          {checked && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="size-full text-white"
              aria-hidden="true"
            >
              <path
                d="M13 4L6 11L3 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-base md:text-[20px] md:leading-6.5 text-black">{label}</span>
      </button>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
