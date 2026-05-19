import type {
  Config,
  FindResponse,
  GlobalResponse,
  GlobalSlug,
  Page,
  PaginatedResponse,
  PayloadRequestContext,
  Post,
  User,
} from './contracts'
import { getLocalPayloadClient } from './local'
import { fetchREST, getErrorMessage, warnAndReturn } from './rest'

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
): Promise<GlobalResponse<T>> => {
  try {
    const localPayload = await getLocalPayloadClient(context)

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
} = {}): Promise<Page[]> => {
  try {
    const context: PayloadRequestContext = { draft, request }
    const localPayload = await getLocalPayloadClient(context)

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
} = {}): Promise<Post[]> => {
  try {
    const context: PayloadRequestContext = { draft, request }
    const localPayload = await getLocalPayloadClient(context)

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
    const localPayload = await getLocalPayloadClient(context)

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
    const localPayload = await getLocalPayloadClient(context)

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

export const getPageByPath = async (
  path: string,
  depth = 2,
  context: PayloadRequestContext = {},
): Promise<Page | null> => {
  try {
    const localPayload = await getLocalPayloadClient(context)

    if (localPayload) {
      const result = await localPayload.find({
        collection: 'pages',
        depth,
        limit: 20,
        pagination: false,
        ...(context.draft ? { draft: true, overrideAccess: true } : {}),
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
