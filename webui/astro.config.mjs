// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node'
import { loadEnv } from 'payload/node'

const currentDir = path.dirname(fileURLToPath(import.meta.url));

loadEnv()

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    ssr: {
      external: [
        'payload',
        'sharp',
        '@img/sharp-linuxmusl-x64',
        '@img/sharp-wasm32',
      ],
    },
    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: `${path.resolve(currentDir, '../payload/src')}/`,
        },
      ],
    },
    server: {
      fs: {
        allow: [path.resolve(currentDir, '..')],
      },
    },
  },
})
