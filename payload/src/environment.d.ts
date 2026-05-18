declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      ASTRO_PUBLIC_SERVER_URL?: string
      ASTRO_SERVER_URL?: string
      FRONTEND_SERVER_URL?: string
      PAYLOAD_PREVIEW_TARGET?: 'astro' | 'next'
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
