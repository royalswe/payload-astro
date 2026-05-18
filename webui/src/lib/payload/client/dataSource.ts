import type { DataSource } from './contracts'

export const shouldUseLocalAPI =
  (process.env.PAYLOAD_LOCAL_API ?? import.meta.env.PAYLOAD_LOCAL_API ?? 'true') !== 'false'

export const payloadBaseURL = (
  process.env.PAYLOAD_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_SERVER_URL ??
  import.meta.env.PAYLOAD_PUBLIC_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')

let activeDataSource: DataSource = 'rest'

export const setActiveDataSource = (source: DataSource): void => {
  activeDataSource = source
}

export const getPayloadDataSource = (): DataSource => activeDataSource
export const getPayloadBaseURL = (): string => payloadBaseURL
