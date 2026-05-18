# Astro Frontend for Payload

This package is the Astro frontend in the monorepo and is wired to the existing Payload app in `../payload`.

## How data is fetched

`src/lib/payload/client.ts` uses a local-first strategy:

1. It tries Payload Local API (`getPayload`) for best server-side performance.
2. If local initialization fails, it automatically falls back to Payload REST (`PAYLOAD_PUBLIC_URL`).

The current source mode is visible on the Astro homepage.

## Shared Payload typings

Types are imported directly from Payload-generated types:

- `@payload-types` -> `../payload/src/payload-types.ts`

When your schema changes, regenerate types from the monorepo root:

```sh
pnpm run generate:types
```

## Environment

Optional env vars for this frontend:

- `PAYLOAD_LOCAL_API=true` (default: true)
- `PAYLOAD_PUBLIC_URL=http://localhost:3000` (used for REST fallback)
- `PAYLOAD_SECRET=...` (required for Payload local API; can live in `webui/.env` or `payload/.env`)

For Payload CMS live preview to point to Astro, set these vars in the Payload app (`payload/.env`):

- `ASTRO_PUBLIC_SERVER_URL=http://localhost:4321`
- `PAYLOAD_PREVIEW_TARGET=astro` (default behavior in current code)

You can temporarily switch back to Next.js preview links with:

- `PAYLOAD_PREVIEW_TARGET=next`

Astro also loads both `../payload/.env` and `webui/.env` so local API mode can reuse existing Payload settings.

## Live preview and admin bar

- Payload draft/live preview loads Astro routes with `?preview=true`.
- In preview mode, Astro subscribes to Payload document events and refreshes automatically on autosave.
- When logged in to Payload admin, Astro renders a top admin bar with dashboard and edit links.

## Run locally

From monorepo root:

```sh
pnpm run dev
```

Or run only Astro:

```sh
pnpm --filter webui dev
```
