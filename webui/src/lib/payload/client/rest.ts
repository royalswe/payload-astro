import type { PayloadRequestContext } from './contracts'
import { payloadBaseURL, setActiveDataSource } from './dataSource'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const warnAndReturn = <T>(scope: string, fallback: T, error: unknown): T => {
  console.warn(`[webui] ${scope} failed. Returning fallback value. ${getErrorMessage(error)}`)
  return fallback
}

const getForwardedHeaders = (request?: Request): Record<string, string> => {
  const headers: Record<string, string> = {}
  const cookie = request?.headers.get('cookie')
  const authorization = request?.headers.get('authorization')

  if (cookie) {
    headers.cookie = cookie
  }

  if (authorization) {
    headers.authorization = authorization
  }

  return headers
}

const getRestURL = (pathname: string, params: Record<string, string | number> = {}) => {
  const url = new URL(pathname, `${payloadBaseURL}/`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  return url
}

export const fetchREST = async <T>(
  pathname: string,
  params: Record<string, string | number> = {},
  context: PayloadRequestContext = {},
): Promise<T> => {
  const url = getRestURL(pathname, params)

  let response: Response

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...getForwardedHeaders(context.request),
      },
    })
  } catch (error) {
    throw new Error(`[webui] Payload REST request failed: cannot reach ${url.toString()}`, {
      cause: error,
    })
  }

  if (!response.ok) {
    throw new Error(`[webui] Payload REST request failed: ${response.status} ${response.statusText}`)
  }

  setActiveDataSource('rest')

  return (await response.json()) as T
}
