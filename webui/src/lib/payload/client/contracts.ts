import type { Config, Page, Post, User } from '@payload-types'
import type { Payload } from 'payload'

export type GlobalSlug = keyof Config['globals']
export type DataSource = 'local' | 'rest'

export type PayloadRequestContext = {
  request?: Request
  draft?: boolean
}

export type FindResponse<T> = {
  docs: T[]
}

export type GlobalResponse<T extends GlobalSlug> = Config['globals'][T] | null

export type PaginatedResponse<T> = FindResponse<T> & {
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

export type { Config, Page, Payload, Post, User }
