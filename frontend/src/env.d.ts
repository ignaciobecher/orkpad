/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_URL_DEV?: string
  readonly VITE_API_URL_PROD?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_ADMIN_USER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
