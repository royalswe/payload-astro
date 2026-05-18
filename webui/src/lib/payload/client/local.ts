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
    const { existsSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const { loadEnv } = await import('payload/node')

    const currentFile = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(currentFile)
    const payloadEnvPath = path.resolve(currentDir, '../../../../../payload/.env')
    const webuiEnvPath = path.resolve(currentDir, '../../../../.env')

    // Load from both packages so local API can run regardless of command cwd.
    if (existsSync(payloadEnvPath)) {
      loadEnv(payloadEnvPath)
    }

    if (existsSync(webuiEnvPath)) {
      loadEnv(webuiEnvPath)
    }

    loadEnv()
  } catch (error) {
    console.warn(`[webui] Could not preload Payload environment variables. ${getErrorMessage(error)}`)
  }
}

export const getLocalPayloadClient = async (
  context: PayloadRequestContext = {},
): Promise<Payload | null> => {
  if (!shouldUseLocalClient(context)) {
    console.log('using REST api');
    return null
  }

  console.log('using LOCAL api');

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
