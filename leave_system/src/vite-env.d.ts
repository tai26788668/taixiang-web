/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: string
  readonly MODE: string
  readonly VITE_DISABLE_AUTO_LOGOUT?: string
  readonly VITE_AUTO_LOGOUT_TIMEOUT?: string
  readonly VITE_AUTO_LOGOUT_REDIRECT_DELAY?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}