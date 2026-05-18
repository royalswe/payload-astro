import type { Config, Page, Post, User } from '@payload-types'
import type { Payload } from 'payload'

type GlobalSlug = keyof Config['globals']
type DataSource = 'local' | 'rest'
type PayloadRequestContext = {
  request?: Request
  draft?: boolean
}

type FindResponse<T> = {
  docs: T[]
}

type GlobalResponse<T extends GlobalSlug> = Config['globals'][T] | null

type PaginatedResponse<T> = FindResponse<T> & {
  totalDocs: number
  limit: number
  totalPages: number
  page?: number
  pagingCounter?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
  prevPage?: number | null
  nextPage?: number | null
}

const shouldUseLocalAPI = (process.env.PAYLOAD_LOCAL_API ?? import.meta.env.PAYLOAD_LOCAL_API ?? 'true') !== 'false'

const payloadBaseURL = (
  process.env.PAYLOAD_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_SERVER_URL ??
  import.meta.env.PAYLOAD_PUBLIC_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')

let localPayloadPromise: Promise<Payload | null> | null = null
let localPayloadDisabled = false
let activeDataSource: DataSource = 'rest'
let payloadEnvLoaded = false

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

const warnAndReturn = <T>(scope: string, fallback: T, error: unknown): T => {
  console.warn(`[webui] ${scope} failed. Returning fallback value. ${getErrorMessage(error)}`)
  return fallback
}

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
    loadEnv(path.resolve(currentDir, '../../../../payload/.env'))
    loadEnv(path.resolve(currentDir, '../../../.env'))
    loadEnv()

    if (!process.env.PAYLOAD_SECRET && import.meta.env.PAYLOAD_SECRET) {
      process.env.PAYLOAD_SECRET = import.meta.env.PAYLOAD_SECRET
    }
  } catch (error) {
    console.warn('[webui] Could not preload Payload environment variables.', error)
  }
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

const shouldUseLocalClient = (context: PayloadRequestContext) =>
  shouldUseLocalAPI && !context.draft && !localPayloadDisabled

const getRestURL = (pathname: string, params: Record<string, string | number> = {}) => {
  const url = new URL(pathname, `${payloadBaseURL}/`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  return url
}

const fetchREST = async <T>(
  pathname: string,
  params: Record<string, string | number> = {},
  context: PayloadRequestContext = {},
) => {
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

  activeDataSource = 'rest'

  return (await response.json()) as T
}

const getLocalPayloadClient = async (): Promise<Payload | null> => {
  if (!shouldUseLocalAPI || localPayloadDisabled) {
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
        activeDataSource = 'local'

        return payload
      } catch (error) {
        localPayloadDisabled = true

        console.warn(
          '[webui] Could not initialize Payload local API. Falling back to REST API for this process.',
          error,
        )

        return null
      }
    })()
  }

  return localPayloadPromise
}

export const getPayloadDataSource = (): DataSource => activeDataSource
export const getPayloadBaseURL = (): string => payloadBaseURL

export const getCurrentUser = async (context: PayloadRequestContext = {}): Promise<User | null> => {
  try {
    return (await fetchREST<{ user: User | null }>('/api/users/me', {}, context)).user
  } catch (error) {
    console.warn(`[webui] getCurrentUser failed. Returning null. ${getErrorMessage(error)}`)
    return null
  }
}

export const getGlobal = async <T extends GlobalSlug>(
  slug: T,
  depth = 1,
  context: PayloadRequestContext = {},
) : Promise<GlobalResponse<T>> => {
  try {
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      return (await localPayload.findGlobal({ slug, depth })) as Config['globals'][T]
    }

    return await fetchREST<Config['globals'][T]>(`/api/globals/${String(slug)}`, { depth }, context)
  } catch (error) {
    return warnAndReturn(`getGlobal(${String(slug)})`, null, error)
  }
}

export const getPublishedPages = async ({
  depth = 1,
  limit = 12,
  draft = false,
  request,
}: {
  depth?: number
  limit?: number
  draft?: boolean
  request?: Request
} = {}) => {
  try {
    const context: PayloadRequestContext = { draft, request }
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'pages',
        depth,
        limit,
        sort: '-updatedAt',
        where: {
          _status: {
            equals: 'published',
          },
        },
      })

      return result.docs as Page[]
    }

    if (draft) {
      const result = await fetchREST<FindResponse<Page>>(
        '/api/pages',
        {
          depth,
          limit,
          sort: '-updatedAt',
          draft: 'true',
          overrideAccess: 'true',
        },
        context,
      )

      return result.docs
    }

    const result = await fetchREST<FindResponse<Page>>(
      '/api/pages',
      {
        depth,
        limit,
        sort: '-updatedAt',
        'where[_status][equals]': 'published',
      },
      context,
    )

    return result.docs
  } catch (error) {
    return warnAndReturn('getPublishedPages', [], error)
  }
}

export const getPublishedPosts = async ({
  depth = 1,
  limit = 8,
  draft = false,
  request,
}: {
  depth?: number
  limit?: number
  draft?: boolean
  request?: Request
} = {}) => {
  try {
    const context: PayloadRequestContext = { draft, request }
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'posts',
        depth,
        limit,
        sort: '-publishedAt',
        where: {
          _status: {
            equals: 'published',
          },
        },
      })

      return result.docs as Post[]
    }

    if (draft) {
      const result = await fetchREST<FindResponse<Post>>(
        '/api/posts',
        {
          depth,
          limit,
          sort: '-publishedAt',
          draft: 'true',
          overrideAccess: 'true',
        },
        context,
      )

      return result.docs
    }

    const result = await fetchREST<FindResponse<Post>>(
      '/api/posts',
      {
        depth,
        limit,
        sort: '-publishedAt',
        'where[_status][equals]': 'published',
      },
      context,
    )

    return result.docs
  } catch (error) {
    return warnAndReturn('getPublishedPosts', [], error)
  }
}

export const getPostsArchivePage = async ({
  depth = 1,
  limit = 12,
  page = 1,
  draft = false,
  request,
}: {
  depth?: number
  limit?: number
  page?: number
  draft?: boolean
  request?: Request
} = {}): Promise<PaginatedResponse<Post>> => {
  const fallback: PaginatedResponse<Post> = {
    docs: [],
    totalDocs: 0,
    limit,
    totalPages: 1,
    page,
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  }

  try {
    const context: PayloadRequestContext = { draft, request }
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'posts',
        depth,
        limit,
        page,
        sort: '-publishedAt',
        where: {
          _status: {
            equals: 'published',
          },
        },
      })

      return result as PaginatedResponse<Post>
    }

    if (draft) {
      return await fetchREST<PaginatedResponse<Post>>(
        '/api/posts',
        {
          depth,
          limit,
          page,
          sort: '-publishedAt',
          draft: 'true',
          overrideAccess: 'true',
        },
        context,
      )
    }

    return await fetchREST<PaginatedResponse<Post>>(
      '/api/posts',
      {
        depth,
        limit,
        page,
        sort: '-publishedAt',
        'where[_status][equals]': 'published',
      },
      context,
    )
  } catch (error) {
    return warnAndReturn('getPostsArchivePage', fallback, error)
  }
}

export const getPostBySlug = async (
  slug: string,
  depth = 1,
  context: PayloadRequestContext = {},
): Promise<Post | null> => {
  try {
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'posts',
        depth,
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: slug,
          },
        },
      })

      return (result.docs?.[0] as Post | undefined) ?? null
    }

    const result = await fetchREST<FindResponse<Post>>(
      '/api/posts',
      {
        depth,
        limit: 1,
        pagination: 'false',
        ...(context.draft
          ? {
              draft: 'true',
              overrideAccess: 'true',
            }
          : {
              'where[_status][equals]': 'published',
            }),
        'where[slug][equals]': slug,
      },
      context,
    )

    return result.docs?.[0] ?? null
  } catch (error) {
    return warnAndReturn(`getPostBySlug(${slug})`, null, error)
  }
}

export const getPageByPath = async (path: string, depth = 2, context: PayloadRequestContext = {}) => {
  try {
    const localPayload = shouldUseLocalClient(context) ? await getLocalPayloadClient() : null

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'pages',
        depth,
        limit: 20,
        pagination: false,
        where: {
          'breadcrumbs.url': {
            equals: path,
          },
        },
      })

      return (result.docs.find((doc) => doc.breadcrumbs?.at(-1)?.url === path) ?? null) as Page | null
    }

    const result = await fetchREST<FindResponse<Page>>(
      '/api/pages',
      {
        depth,
        limit: 20,
        pagination: 'false',
        ...(context.draft
          ? {
              draft: 'true',
              overrideAccess: 'true',
            }
          : {}),
        'where[breadcrumbs.url][equals]': path,
      },
      context,
    )

    return result.docs.find((doc) => doc.breadcrumbs?.at(-1)?.url === path) ?? null
  } catch (error) {
    return warnAndReturn(`getPageByPath(${path})`, null, error)
  }
}
