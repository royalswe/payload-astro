'use client'

import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import RichText from '@/components/RichText'
import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  title?: string
}

type SubmissionError = {
  message: string
  status?: string
}

type FormData = Record<string, unknown>

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConfirmationMessage({
  confirmationMessage,
  onReset,
}: {
  confirmationMessage: FormType['confirmationMessage']
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-14 md:gap-20 w-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-8 md:gap-14 text-center text-black">
        <div className="font-heading text-[80px] leading-19.5 md:text-[170px] md:leading-33.75 uppercase **:text-inherit **:font-inherit **:leading-inherit">
          <RichText data={confirmationMessage} enableGutter={false} />
        </div>
      </div>
      <Button type="button" onClick={onReset}>
        Send another message
      </Button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center w-full min-h-[40vh]">
      <p className="text-[20px] text-black">Loading, please wait...</p>
    </div>
  )
}

function ErrorBanner({ error }: { error: SubmissionError }) {
  return (
    <div className="mb-6 p-4 text-red-700 text-base" role="alert" aria-live="polite">
      {`${error.status ?? '500'}: ${error.message}`}
    </div>
  )
}

function FieldGrid({
  form,
  formMethods,
}: {
  form: FormType
  formMethods: ReturnType<typeof useForm>
}) {
  const {
    control,
    formState: { errors },
    register,
  } = formMethods

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-6">
      {form.fields?.map((field, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
        if (!Field) return null

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldWidth = (field as any).width ?? 100
        const isFullWidth = fieldWidth >= 100

        return (
          <div
            key={index}
            style={{
              flexBasis: isFullWidth ? '100%' : `calc(${fieldWidth}% - 12px)`,
              maxWidth: isFullWidth ? '100%' : `calc(${fieldWidth}% - 12px)`,
            }}
          >
            <Field
              form={form}
              {...field}
              {...formMethods}
              control={control}
              errors={errors}
              register={register}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useFormSubmission({
  formID,
  confirmationType,
  redirect,
}: {
  formID: string
  confirmationType: FormType['confirmationType']
  redirect: FormType['redirect']
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<SubmissionError | undefined>()

  const onSubmit = useCallback(
    (data: FormData) => {
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data)
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([name, value]) => ({ field: name, value: String(value) }))

        // Delay the loading indicator by 1 s to avoid flash on fast connections
        const loadingTimer = setTimeout(() => setIsLoading(true), 1000)

        try {
          const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ form: formID, submissionData: dataToSend }),
          })

          const json = await res.json()
          clearTimeout(loadingTimer)

          if (!res.ok) {
            setIsLoading(false)
            setError({
              message: json.errors?.[0]?.message ?? 'Internal Server Error',
              status: String(res.status),
            })
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect?.url) {
            router.push(redirect.url)
          }
        } catch (err) {
          clearTimeout(loadingTimer)
          console.warn(err)
          setIsLoading(false)
          setError({ message: err instanceof Error ? err.message : 'An unknown error occurred' })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return { isLoading, hasSubmitted, error, onSubmit, setHasSubmitted, setError }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const FormBlock: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const {
    title,
    enableIntro,
    introContent,
    form,
    form: {
      id: formID,
      confirmationMessage,
      confirmationType,
      redirect,
      submitButtonLabel,
    } = {} as FormType,
  } = props

  if (!formID) {
    console.error('FormBlock is missing form ID')
    // TODO: handle this case better, e.g. show an error message in the UI
  }

  const formMethods = useForm<FormData>({
    defaultValues: form.fields?.reduce<FormData>((acc, field) => {
      if ('name' in field && field.name) {
        acc[field.name] = field.defaultValue as FormData[string]
      }
      return acc
    }, {}),
  })

  const { handleSubmit, reset } = formMethods

  const { isLoading, hasSubmitted, error, onSubmit, setHasSubmitted, setError } = useFormSubmission(
    { formID, confirmationType, redirect },
  )

  const handleReset = useCallback(() => {
    setHasSubmitted(false)
    setError(undefined)
    reset()
  }, [reset, setHasSubmitted, setError])

  const showConfirmation = !isLoading && hasSubmitted && confirmationType === 'message'
  const showForm = !hasSubmitted && !isLoading

  return (
    <section className="bg-[#00DE6C] w-full">
      <div className="flex flex-col items-center px-4 md:px-10 xl:px-72 py-16 md:py-20">
        {showConfirmation && (
          <ConfirmationMessage confirmationMessage={confirmationMessage} onReset={handleReset} />
        )}

        {isLoading && !hasSubmitted && <LoadingState />}

        {error && <ErrorBanner error={error} />}

        {showForm && (
          <>
            {title && <h2 className="mb-8 md:mb-14 text-center text-black">{title}</h2>}

            {enableIntro && introContent && (
              <RichText
                className="mb-8 md:mb-14 text-center text-black"
                data={introContent}
                enableGutter={false}
              />
            )}

            <div className="w-full max-w-216">
              <FormProvider {...formMethods}>
                <form id={formID} onSubmit={handleSubmit(onSubmit)} noValidate>
                  <FieldGrid form={form} formMethods={formMethods} />

                  <div className="flex justify-center mt-10 md:mt-14">
                    <Button form={formID} type="submit" disabled={isLoading}>
                      {submitButtonLabel}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
