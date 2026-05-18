'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import RichText from '@/components/RichText'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsletterSubscribeBlockType = {
  blockName?: string
  blockType?: 'newsletterSubscribe'
  title: string
  description?: DefaultTypedEditorState
  namePlaceholder?: string
  emailPlaceholder?: string
  consentLabel?: string
  consentLinkText?: string
  consentLinkUrl?: string
  submitLabel?: string
  confirmationTitle?: string
  confirmationButtonLabel?: string
}

type FormData = {
  name: string
  email: string
  consent: boolean
}

type SubmissionError = {
  message: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const NewsletterSubscribeBlock: React.FC<{ id?: string } & NewsletterSubscribeBlockType> = (
  props,
) => {
  const {
    title,
    description,
    namePlaceholder,
    emailPlaceholder,
    consentLabel,
    consentLinkText,
    consentLinkUrl,
    submitLabel,
    confirmationTitle,
    confirmationButtonLabel,
  } = props

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<SubmissionError | undefined>()

  const onSubmit = useCallback(async (data: FormData) => {
    setError(undefined)
    setIsLoading(true)

    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, consentGiven: data.consent }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError({ message: json?.message ?? 'Something went wrong.' })
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setIsSubmitted(true)
    } catch {
      setIsLoading(false)
      setError({ message: 'Something went wrong.' })
    }
  }, [])

  const handleReset = useCallback(() => {
    setIsSubmitted(false)
    setError(undefined)
    reset()
  }, [reset])

  // ─── Confirmation State ───────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <section className="relative w-full overflow-hidden">
        {/* Diagonal green stripes background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(-45deg, #00DE6C 0px, #00DE6C 60px, white 60px, white 120px)',
          }}
        />

        <div className="relative flex flex-col items-center justify-center px-4 py-16 md:py-20 min-h-[454px]">
          <div className="flex flex-col items-center gap-14">
            <h2 className="font-heading text-5xl leading-[50px] md:text-[104px] md:leading-[96px] uppercase text-center max-w-[842px]">
              {confirmationTitle}
            </h2>
            <Button type="button" onClick={handleReset}>
              {confirmationButtonLabel}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ─── Form State ─────────────────────────────────────────────────────────

  return (
    <section className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Left: Text content */}
        <div className="px-4 pt-16 pb-8 md:px-10 lg:pl-16 lg:pr-0 lg:py-20 lg:w-[45%] lg:shrink-0">
          <div className="flex flex-col gap-8 md:gap-14 max-w-[533px]">
            {title && (
              <h2 className="font-heading text-5xl leading-[50px] md:text-[104px] md:leading-[96px] uppercase">
                {title}
              </h2>
            )}
            {description && (
              <RichText
                className="text-base md:text-xl md:leading-[26px]"
                data={description}
                enableGutter={false}
              />
            )}
          </div>
        </div>

        {/* Right: Form with background image */}
        <div className="relative flex-1">
          {/* Diagonal green stripes background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(-45deg, #00DE6C 0px, #00DE6C 60px, white 60px, white 120px)',
            }}
          />

          {/* Form overlay */}
          <div className="relative flex flex-col items-center lg:items-start justify-center h-full px-4 md:px-16 py-16">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-14 w-full max-w-[646px]"
            >
              <div className="flex flex-col gap-6">
                {/* Input fields */}
                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="newsletter-name" className="sr-only">
                      {namePlaceholder}
                    </label>
                    <input
                      id="newsletter-name"
                      type="text"
                      placeholder={namePlaceholder}
                      aria-required="true"
                      aria-invalid={errors.name ? 'true' : undefined}
                      aria-describedby={errors.name ? 'newsletter-name-error' : undefined}
                      className="h-11 w-full rounded-3xl border-[1.5px] border-black bg-white px-5 text-base md:text-xl md:leading-[26px] placeholder:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p
                        id="newsletter-name-error"
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="newsletter-email" className="sr-only">
                      {emailPlaceholder}
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      placeholder={emailPlaceholder}
                      aria-required="true"
                      className="h-11 w-full rounded-3xl border-[1.5px] border-black bg-white px-5 text-base md:text-xl md:leading-[26px] placeholder:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    id="newsletter-consent"
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 appearance-none rounded border-[1.65px] border-black bg-white checked:bg-black checked:border-black cursor-pointer"
                    {...register('consent', { required: 'You must agree to continue' })}
                  />
                  <label
                    htmlFor="newsletter-consent"
                    className="text-base md:text-xl md:leading-[26px] text-black cursor-pointer"
                  >
                    {consentLabel}
                    {consentLinkUrl && consentLinkText && (
                      <>
                        {' '}
                        <Link
                          href={consentLinkUrl}
                          className="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {consentLinkText}
                        </Link>
                      </>
                    )}
                  </label>
                </div>
                {errors.consent && (
                  <p className="-mt-4 text-sm text-red-600" role="alert" aria-live="polite">
                    {errors.consent.message}
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-600" role="alert" aria-live="polite">
                  {error.message}
                </p>
              )}

              {/* Submit button */}
              <Button type="submit" disabled={isLoading} className="self-center lg:self-start">
                {isLoading ? 'Subscribing...' : submitLabel}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
