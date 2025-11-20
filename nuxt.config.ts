// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const cssPath = resolve(rootDir, 'assets/css/main.css')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // SPA mode for better drag performance
  
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  tailwindcss: {
    cssPath,
    exposeConfig: false,
    configPath: 'tailwind.config'
  },
  
  css: [cssPath],
  
  alias: {
    'element-resize-detector': '~/shims/element-resize-detector.js'
  }
})