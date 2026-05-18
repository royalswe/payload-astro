import type { Payload, PayloadRequestContext } from './contracts'
import { setActiveDataSource, shouldUseLocalAPI } from './dataSource'
import { getErrorMessage } from './rest'

let localPayloadPromise: Promise<Payload | null> | null = null
let localPayloadDisabled = false
let payloadEnvLoaded = false

const shouldUseLocalClient = (context: PayloadRequestContext) =>
  shouldUseLocalAPI && !context.draft && !localPayloadDisabled

const ensurePayloadEnvLoaded = async (): Promise<void> => {
  if (payloadEnvLoaded) {
    return
  }

  payloadEnvLoaded = true

  try {
    const path = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const { loadEnv } = await import('payload/node')

    const currentFile = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(currentFile)

    // Load from both packages so local API can run regardless of command cwd.
    loadEnv(path.resolve(currentDir, '../../../../../payload/.env'))
    loadEnv(path.resolve(currentDir, '../../../../.env'))
    loadEnv()

    if (!process.env.PAYLOAD_SECRET && import.meta.env.PAYLOAD_SECRET) {
      process.env.PAYLOAD_SECRET = import.meta.env.PAYLOAD_SECRET
    }
  } catch (error) {
    console.warn(`[webui] Could not preload Payload environment variables. ${getErrorMessage(error)}`)
  }
}

export const getLocalPayloadClient = async (
  context: PayloadRequestContext = {},
): Promise<Payload | null> => {
  if (!shouldUseLocalClient(context)) {
    return null
  }

  if (!localPayloadPromise) {
    localPayloadPromise = (async () => {
      try {
        await ensurePayloadEnvLoaded()

        const [{ getPayload }, { default: config }] = await Promise.all([
          import('payload'),
          import('@payload-local-config'),
        ])

        const payload = await getPayload({ config })
        setActiveDataSource('local')

        return payload
      } catch (error) {
        localPayloadDisabled = true

        console.warn(
          `[webui] Could not initialize Payload local API. Falling back to REST API for this process. ${getErrorMessage(error)}`,
        )

        return null
      }
    })()
  }

  return localPayloadPromise
}
