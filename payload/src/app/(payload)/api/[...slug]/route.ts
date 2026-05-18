/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

// import type { NextRequest } from 'next/server'
// type RouteHandler = (
//   req: NextRequest,
//   args: { params: Promise<{ slug: string[] }> },
// ) => Promise<Response>

/**
 * Buffers the response body before returning it to prevent Next.js 16 from
 * consuming the ReadableStream internally (for instrumentation/logging) before
 * it reaches the client. Without this, the client receives an empty body,
 * causing "Unexpected end of JSON input" on media uploads.
 */
// function withBufferedResponse(handler: RouteHandler): RouteHandler {
//   return async (req, args) => {
//     const response = await handler(req, args)
//     const body = await response.arrayBuffer()
//     return new Response(body, {
//       status: response.status,
//       statusText: response.statusText,
//       headers: response.headers,
//     })
//   }
// }

export const GET = REST_GET(config)
export const DELETE = REST_DELETE(config)
export const POST = REST_POST(config)
export const PATCH = REST_PATCH(config)

export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
